from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class IngredientBase(BaseModel):
    name: str
    quantity: str
    price: Optional[float] = None

class IngredientCreate(IngredientBase):
    pass

class IngredientResponse(IngredientBase):
    id: int
    recipe_id: int

    class Config:
        from_attributes = True

class RecipeBase(BaseModel):
    title: str
    description: Optional[str] = None
    instructions: str

class RecipeCreate(RecipeBase):
    ingredients: List[IngredientCreate]
    photo_url: Optional[str] = None

class RecipeResponse(RecipeBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    ingredients: List[IngredientResponse] = []
    total_price: Optional[float] = None
    likes_count: int = 0
    comments_count: int = 0
    username: Optional[str] = None
    time_ago: Optional[str] = None
    tags: List[str] = []
    photo_url: Optional[str] = None
    user_liked: bool = False

    class Config:
        from_attributes = True