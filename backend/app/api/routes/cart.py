from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.core.database import get_db
from app.api.deps import get_current_user, get_current_user_required
from app.models.user import User
from app.models.cart import ShoppingCart, CartItem, CartComment, CartLike
from app.schemas.cart import CartCreate, CartResponse, CartCommentCreate, CartCommentResponse

router = APIRouter(prefix="/carts", tags=["Корзины"])


def format_time_ago(dt):
    if dt.tzinfo is not None:
        dt = dt.replace(tzinfo=None)
    now = datetime.utcnow()
    diff = now - dt
    if diff.days > 0:
        return f"{diff.days} дн. назад"
    if diff.seconds // 3600 > 0:
        return f"{diff.seconds // 3600} ч. назад"
    if diff.seconds // 60 > 0:
        return f"{diff.seconds // 60} мин. назад"
    return "только что"


@router.post("/", response_model=CartResponse)
def create_cart(
        cart_data: CartCreate,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user_required)
):
    """Создание корзины покупок"""
    total_price = sum((item.price or 0) for item in cart_data.items)

    new_cart = ShoppingCart(
        user_id=current_user.id,
        title=cart_data.title,
        description=cart_data.description,
        shop_name=cart_data.shop_name,
        city=cart_data.city,
        total_price=total_price
    )
    db.add(new_cart)
    db.flush()

    for item_data in cart_data.items:
        cart_item = CartItem(
            cart_id=new_cart.id,
            name=item_data.name,
            quantity=item_data.quantity,
            price=item_data.price
        )
        db.add(cart_item)

    db.commit()
    db.refresh(new_cart)

    response = CartResponse.model_validate(new_cart)
    response.username = current_user.username
    response.avatar_url = current_user.avatar_url
    response.items = [CartItemResponse.model_validate(item) for item in new_cart.items]

    return response


@router.get("/", response_model=List[CartResponse])
def get_carts(
        skip: int = 0,
        limit: int = 20,
        db: Session = Depends(get_db),
        current_user: Optional[User] = Depends(get_current_user)
):
    """Получение списка корзин"""
    carts = db.query(ShoppingCart).order_by(ShoppingCart.created_at.desc()).offset(skip).limit(limit).all()

    result = []
    for cart in carts:
        user = db.query(User).filter(User.id == cart.user_id).first()
        response = CartResponse.model_validate(cart)
        response.username = user.username if user else "Пользователь"
        response.avatar_url = user.avatar_url if user else None
        response.likes_count = db.query(CartLike).filter(CartLike.cart_id == cart.id).count()
        response.comments_count = db.query(CartComment).filter(CartComment.cart_id == cart.id).count()
        if current_user:
            is_liked = db.query(CartLike).filter(
                CartLike.cart_id == cart.id,
                CartLike.user_id == current_user.id
            ).first() is not None
            response.is_liked = is_liked
        result.append(response)

    return result


@router.get("/my", response_model=List[CartResponse])
def get_my_carts(
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user_required)
):
    """Получить корзины текущего пользователя"""
    carts = db.query(ShoppingCart).filter(ShoppingCart.user_id == current_user.id).order_by(
        ShoppingCart.created_at.desc()).all()

    result = []
    for cart in carts:
        response = CartResponse.model_validate(cart)
        response.username = current_user.username
        response.avatar_url = current_user.avatar_url
        response.likes_count = db.query(CartLike).filter(CartLike.cart_id == cart.id).count()
        response.comments_count = db.query(CartComment).filter(CartComment.cart_id == cart.id).count()
        result.append(response)

    return result


@router.get("/{cart_id}", response_model=CartResponse)
def get_cart(
        cart_id: int,
        db: Session = Depends(get_db),
        current_user: Optional[User] = Depends(get_current_user)
):
    """Получение корзины по ID"""
    cart = db.query(ShoppingCart).filter(ShoppingCart.id == cart_id).first()
    if not cart:
        raise HTTPException(status_code=404, detail="Корзина не найдена")

    user = db.query(User).filter(User.id == cart.user_id).first()
    response = CartResponse.model_validate(cart)
    response.username = user.username if user else "Пользователь"
    response.avatar_url = user.avatar_url if user else None
    response.likes_count = db.query(CartLike).filter(CartLike.cart_id == cart.id).count()
    response.comments_count = db.query(CartComment).filter(CartComment.cart_id == cart.id).count()
    if current_user:
        is_liked = db.query(CartLike).filter(
            CartLike.cart_id == cart.id,
            CartLike.user_id == current_user.id
        ).first() is not None
        response.is_liked = is_liked

    return response


@router.delete("/{cart_id}")
def delete_cart(
        cart_id: int,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user_required)
):
    """Удаление корзины"""
    cart = db.query(ShoppingCart).filter(ShoppingCart.id == cart_id, ShoppingCart.user_id == current_user.id).first()
    if not cart:
        raise HTTPException(status_code=404, detail="Корзина не найдена")

    db.delete(cart)
    db.commit()

    return {"message": "Корзина удалена"}


@router.post("/{cart_id}/like")
def like_cart(
        cart_id: int,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user_required)
):
    """Поставить лайк корзине"""
    cart = db.query(ShoppingCart).filter(ShoppingCart.id == cart_id).first()
    if not cart:
        raise HTTPException(status_code=404, detail="Корзина не найдена")

    existing = db.query(CartLike).filter(
        CartLike.cart_id == cart_id,
        CartLike.user_id == current_user.id
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Вы уже поставили лайк")

    like = CartLike(cart_id=cart_id, user_id=current_user.id)
    db.add(like)
    db.commit()

    return {"message": "Лайк поставлен"}


@router.delete("/{cart_id}/like")
def unlike_cart(
        cart_id: int,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user_required)
):
    """Убрать лайк с корзины"""
    like = db.query(CartLike).filter(
        CartLike.cart_id == cart_id,
        CartLike.user_id == current_user.id
    ).first()

    if not like:
        raise HTTPException(status_code=404, detail="Лайк не найден")

    db.delete(like)
    db.commit()

    return {"message": "Лайк убран"}


@router.post("/{cart_id}/comments", response_model=CartCommentResponse)
def create_cart_comment(
        cart_id: int,
        comment_data: CartCommentCreate,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user_required)
):
    """Добавить комментарий к корзине"""
    cart = db.query(ShoppingCart).filter(ShoppingCart.id == cart_id).first()
    if not cart:
        raise HTTPException(status_code=404, detail="Корзина не найдена")

    comment = CartComment(
        cart_id=cart_id,
        user_id=current_user.id,
        text=comment_data.text
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)

    return CartCommentResponse(
        id=comment.id,
        text=comment.text,
        user_id=comment.user_id,
        cart_id=comment.cart_id,
        created_at=comment.created_at,
        username=current_user.username,
        avatar_url=current_user.avatar_url
    )


@router.get("/{cart_id}/comments", response_model=List[CartCommentResponse])
def get_cart_comments(
        cart_id: int,
        skip: int = 0,
        limit: int = 50,
        db: Session = Depends(get_db)
):
    """Получить комментарии к корзине"""
    comments = db.query(CartComment).filter(CartComment.cart_id == cart_id) \
        .order_by(CartComment.created_at.desc()).offset(skip).limit(limit).all()

    result = []
    for comment in comments:
        user = db.query(User).filter(User.id == comment.user_id).first()
        result.append(CartCommentResponse(
            id=comment.id,
            text=comment.text,
            user_id=comment.user_id,
            cart_id=comment.cart_id,
            created_at=comment.created_at,
            username=user.username if user else "Пользователь",
            avatar_url=user.avatar_url if user else None
        ))

    return result