from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone
import uuid
import os
import shutil
from app.core.database import get_db
from app.api.deps import get_current_user, get_current_user_required
from app.models.user import User
from app.models.recipe import Recipe
from app.models.like import Like
from app.models.comment import Comment
from app.schemas.recipe import RecipeCreate, RecipeResponse
from app.services.recipe_service import RecipeService

router = APIRouter(prefix="/recipes", tags=["Рецепты"])

# Директория для загрузки фото
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


def format_time_ago(dt):
    """Форматирует дату в '2 часа назад', 'вчера' и т.д."""
    if dt.tzinfo is not None:
        # Если дата с часовым поясом, преобразуем в UTC и делаем naive
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


@router.post("/upload-photo")
async def upload_photo(
        file: UploadFile = File(...),
        current_user: User = Depends(get_current_user_required)
):
    """Загрузка фото рецепта (требует авторизации)"""
    file_extension = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    new_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, new_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    photo_url = f"/uploads/{new_filename}"
    return {"photo_url": photo_url}


@router.post("/", response_model=RecipeResponse)
def create_recipe(
        recipe_data: RecipeCreate,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user_required)
):
    """Создание нового рецепта (требует авторизации)"""
    recipe = RecipeService.create_recipe(db, recipe_data, current_user.id)
    if recipe_data.photo_url:
        recipe.photo_url = recipe_data.photo_url
        db.commit()
        db.refresh(recipe)

    total_price = RecipeService.calculate_total_price(recipe)

    response = RecipeResponse.model_validate(recipe)
    response.total_price = total_price
    response.likes_count = 0
    response.comments_count = 0
    response.username = current_user.username
    response.time_ago = "только что"
    response.user_liked = False

    return response


@router.get("/", response_model=List[RecipeResponse])
def get_recipes_list(
        skip: int = 0,
        limit: int = 20,
        db: Session = Depends(get_db),
        current_user: Optional[User] = Depends(get_current_user)
):
    """Получение списка рецептов (доступно без авторизации)"""
    recipes = RecipeService.get_recipes(db, skip, limit)

    result = []
    for recipe in recipes:
        response = RecipeResponse.model_validate(recipe)
        response.total_price = RecipeService.calculate_total_price(recipe)
        response.likes_count = db.query(Like).filter(Like.recipe_id == recipe.id).count()
        response.comments_count = db.query(Comment).filter(Comment.recipe_id == recipe.id).count()

        user = db.query(User).filter(User.id == recipe.user_id).first()
        response.username = user.username if user else "Пользователь"
        response.time_ago = format_time_ago(recipe.created_at)

        if current_user:
            user_liked = db.query(Like).filter(
                Like.recipe_id == recipe.id,
                Like.user_id == current_user.id
            ).first() is not None
            response.user_liked = user_liked
        else:
            response.user_liked = False

        result.append(response)

    return result


@router.get("/search", response_model=List[RecipeResponse])
def search_recipes(
        q: str = "",
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        skip: int = 0,
        limit: int = 20,
        db: Session = Depends(get_db),
        current_user: Optional[User] = Depends(get_current_user)
):
    """Поиск рецептов (доступно без авторизации)"""
    query = db.query(Recipe)

    if q:
        query = query.filter(Recipe.title.ilike(f"%{q}%"))

    recipes = query.offset(skip).limit(limit).all()

    result = []
    for recipe in recipes:
        total_price = RecipeService.calculate_total_price(recipe)
        if min_price is not None and total_price < min_price:
            continue
        if max_price is not None and total_price > max_price:
            continue

        response = RecipeResponse.model_validate(recipe)
        response.total_price = total_price
        response.likes_count = db.query(Like).filter(Like.recipe_id == recipe.id).count()
        response.comments_count = db.query(Comment).filter(Comment.recipe_id == recipe.id).count()

        user = db.query(User).filter(User.id == recipe.user_id).first()
        response.username = user.username if user else "Пользователь"
        response.time_ago = format_time_ago(recipe.created_at)

        if current_user:
            user_liked = db.query(Like).filter(
                Like.recipe_id == recipe.id,
                Like.user_id == current_user.id
            ).first() is not None
            response.user_liked = user_liked
        else:
            response.user_liked = False

        result.append(response)

    return result


@router.get("/{recipe_id}", response_model=RecipeResponse)
def get_recipe(
        recipe_id: int,
        db: Session = Depends(get_db),
        current_user: Optional[User] = Depends(get_current_user)
):
    """Получение конкретного рецепта (доступно без авторизации)"""
    recipe = RecipeService.get_recipe(db, recipe_id)
    if not recipe:
        raise HTTPException(status_code=404, detail="Рецепт не найден")

    response = RecipeResponse.model_validate(recipe)
    response.total_price = RecipeService.calculate_total_price(recipe)
    response.likes_count = db.query(Like).filter(Like.recipe_id == recipe.id).count()
    response.comments_count = db.query(Comment).filter(Comment.recipe_id == recipe.id).count()

    user = db.query(User).filter(User.id == recipe.user_id).first()
    response.username = user.username if user else "Пользователь"
    response.time_ago = format_time_ago(recipe.created_at)

    if current_user:
        user_liked = db.query(Like).filter(
            Like.recipe_id == recipe.id,
            Like.user_id == current_user.id
        ).first() is not None
        response.user_liked = user_liked
    else:
        response.user_liked = False

    return response


@router.delete("/{recipe_id}")
def delete_recipe(
        recipe_id: int,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user_required)
):
    """Удаление рецепта (требует авторизации)"""
    success = RecipeService.delete_recipe(db, recipe_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Рецепт не найден или у вас нет прав")
    return {"message": "Рецепт удалён"}