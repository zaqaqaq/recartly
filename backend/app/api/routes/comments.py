from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.core.database import get_db
from app.api.deps import get_current_user_required, get_current_user
from app.models.user import User
from app.models.recipe import Recipe
from app.models.comment import Comment
from app.schemas.comment import CommentCreate, CommentResponse

router = APIRouter(prefix="/comments", tags=["Комментарии"])


def get_time_ago(dt):
    """Возвращает строку 'X минут/часов/дней назад'"""
    if dt.tzinfo is not None:
        dt = dt.replace(tzinfo=None)

    now = datetime.utcnow()
    diff = now - dt

    if diff.days > 365:
        return f"{diff.days // 365} г. назад"
    if diff.days > 30:
        return f"{diff.days // 30} мес. назад"
    if diff.days > 0:
        if diff.days == 1:
            return "вчера"
        return f"{diff.days} дн. назад"
    if diff.seconds // 3600 > 0:
        hours = diff.seconds // 3600
        return f"{hours} ч. назад"
    if diff.seconds // 60 > 0:
        minutes = diff.seconds // 60
        return f"{minutes} мин. назад"
    return "только что"


@router.get("/latest")
def get_latest_comments(
        limit: int = 10,
        db: Session = Depends(get_db)
):
    """Получение последних комментариев (доступно без авторизации)"""
    try:
        comments = db.query(Comment).order_by(Comment.created_at.desc()).limit(limit).all()

        result = []
        for comment in comments:
            user = db.query(User).filter(User.id == comment.user_id).first()
            result.append({
                "id": comment.id,
                "text": comment.text,
                "username": user.username if user else "Пользователь",
                "avatar_url": user.avatar_url if user else None,
                "user_id": comment.user_id,
                "created_at": comment.created_at.isoformat() if comment.created_at else None,
                "time_ago": get_time_ago(comment.created_at) if comment.created_at else "недавно"
            })

        return result
    except Exception as e:
        print(f"Error in get_latest_comments: {e}")
        return []


@router.post("/{recipe_id}")
def create_comment(
        recipe_id: int,
        comment_data: CommentCreate,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user_required)
):
    """Добавить комментарий к рецепту (требует авторизации)"""
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Рецепт не найден")

    new_comment = Comment(
        text=comment_data.text,
        user_id=current_user.id,
        recipe_id=recipe_id
    )
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)

    return {
        "id": new_comment.id,
        "text": new_comment.text,
        "user_id": new_comment.user_id,
        "recipe_id": new_comment.recipe_id,
        "created_at": new_comment.created_at,
        "username": current_user.username,
        "avatar_url": current_user.avatar_url
    }


@router.get("/{recipe_id}")
def get_comments(
        recipe_id: int,
        skip: int = 0,
        limit: int = 50,
        db: Session = Depends(get_db)
):
    """Получить все комментарии к рецепту (доступно без авторизации)"""
    comments = db.query(Comment).filter(Comment.recipe_id == recipe_id) \
        .order_by(Comment.created_at.desc()).offset(skip).limit(limit).all()

    result = []
    for comment in comments:
        user = db.query(User).filter(User.id == comment.user_id).first()
        result.append({
            "id": comment.id,
            "text": comment.text,
            "user_id": comment.user_id,
            "recipe_id": comment.recipe_id,
            "created_at": comment.created_at,
            "username": user.username if user else None,
            "avatar_url": user.avatar_url if user else None
        })

    return result


@router.delete("/{comment_id}")
def delete_comment(
        comment_id: int,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user_required)
):
    """Удалить комментарий (требует авторизации)"""
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Комментарий не найден")

    if comment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Нет прав на удаление")

    db.delete(comment)
    db.commit()

    return {"message": "Комментарий удалён"}