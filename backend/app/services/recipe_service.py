from sqlalchemy.orm import Session
from app.models.recipe import Recipe
from app.models.ingredient import Ingredient
from app.models.like import Like
from app.models.comment import Comment
from app.schemas.recipe import RecipeCreate


class RecipeService:

    @staticmethod
    def create_recipe(db: Session, recipe_data: RecipeCreate, user_id: int) -> Recipe:
        """Создание рецепта с ингредиентами"""
        # Создаём рецепт
        new_recipe = Recipe(
            title=recipe_data.title,
            description=recipe_data.description,
            instructions=recipe_data.instructions,
            user_id=user_id
        )
        db.add(new_recipe)
        db.flush()  # Получаем ID рецепта без коммита

        # Создаём ингредиенты
        for ing_data in recipe_data.ingredients:
            ingredient = Ingredient(
                name=ing_data.name,
                quantity=ing_data.quantity,
                price=ing_data.price,
                recipe_id=new_recipe.id
            )
            db.add(ingredient)

        db.commit()
        db.refresh(new_recipe)
        return new_recipe

    @staticmethod
    def get_recipe(db: Session, recipe_id: int) -> Recipe:
        """Получение рецепта по ID"""
        return db.query(Recipe).filter(Recipe.id == recipe_id).first()

    @staticmethod
    def get_recipes(db: Session, skip: int = 0, limit: int = 20) -> list[Recipe]:
        """Получение списка рецептов"""
        return db.query(Recipe).order_by(Recipe.created_at.desc()).offset(skip).limit(limit).all()

    @staticmethod
    def get_recipes_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 20) -> list[Recipe]:
        """Получение рецептов пользователя"""
        return db.query(Recipe).filter(Recipe.user_id == user_id).order_by(Recipe.created_at.desc()).offset(skip).limit(
            limit).all()

    @staticmethod
    def calculate_total_price(recipe: Recipe) -> float:
        """Подсчёт общей стоимости блюда"""
        total = 0
        for ingredient in recipe.ingredients:
            if ingredient.price:
                total += ingredient.price
        return round(total, 2)

    @staticmethod
    def delete_recipe(db: Session, recipe_id: int, user_id: int) -> bool:
        """Удаление рецепта (только владелец)"""
        recipe = db.query(Recipe).filter(Recipe.id == recipe_id, Recipe.user_id == user_id).first()
        if recipe:
            db.delete(recipe)
            db.commit()
            return True
        return False