from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class CartItemBase(BaseModel):
    name: str
    quantity: str
    price: Optional[float] = None

class CartItemCreate(CartItemBase):
    pass

class CartItemResponse(CartItemBase):
    id: int
    cart_id: int

    class Config:
        from_attributes = True

class CartBase(BaseModel):
    title: str
    description: Optional[str] = None
    shop_name: Optional[str] = None
    city: Optional[str] = None

class CartCreate(CartBase):
    items: List[CartItemCreate]

class CartResponse(CartBase):
    id: int
    user_id: int
    total_price: float = 0
    created_at: datetime
    updated_at: Optional[datetime] = None
    items: List[CartItemResponse] = []
    username: Optional[str] = None
    avatar_url: Optional[str] = None
    likes_count: int = 0
    comments_count: int = 0
    is_liked: bool = False

    class Config:
        from_attributes = True

class CartCommentBase(BaseModel):
    text: str

class CartCommentCreate(CartCommentBase):
    pass

class CartCommentResponse(CartCommentBase):
    id: int
    user_id: int
    cart_id: int
    created_at: datetime
    username: Optional[str] = None
    avatar_url: Optional[str] = None

    class Config:
        from_attributes = True