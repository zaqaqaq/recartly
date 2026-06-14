from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user_required, get_current_user
from app.models.user import User
from app.models.recipe import Recipe
from app.models.like import Like

router = APIRouter(prefix="/likes", tags=["Лайки"])


@router.post("/{recipe_id}")
def like_recipe(
        recipe_id: int,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user_required)
):
    """Поставить лайк рецепту (требует авторизации)"""
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Рецепт не найден")

    existing_like = db.query(Like).filter(
        Like.recipe_id == recipe_id,
        Like.user_id == current_user.id
    ).first()

    if existing_like:
        raise HTTPException(status_code=400, detail="Вы уже поставили лайк этому рецепту")

    new_like = Like(recipe_id=recipe_id, user_id=current_user.id)
    db.add(new_like)
    db.commit()

    return {"message": "Лайк поставлен"}


@router.get("/{recipe_id}/count")
def get_likes_count(
        recipe_id: int,
        db: Session = Depends(get_db)
):
    """Получить количество лайков у рецепта (доступно без авторизации)"""
    count = db.query(Like).filter(Like.recipe_id == recipe_id).count()
    return {"count": count}


@router.delete("/{recipe_id}")
def unlike_recipe(
        recipe_id: int,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user_required)
):
    """Убрать лайк с рецепта (требует авторизации)"""
    like = db.query(Like).filter(
        Like.recipe_id == recipe_id,
        Like.user_id == current_user.id
    ).first()

    if not like:
        raise HTTPException(status_code=404, detail="Лайк не найден")

    db.delete(like)
    db.commit()

    return {"message": "Лайк убран"}