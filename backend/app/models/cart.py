from sqlalchemy import Column, Integer, String, Float, ForeignKey, Text, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class ShoppingCart(Base):
    __tablename__ = "shopping_carts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    shop_name = Column(String, nullable=True)
    shop_custom = Column(Boolean, default=False)
    total_price = Column(Float, default=0)
    city = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Связи
    user = relationship("User", back_populates="carts")
    items = relationship("CartItem", back_populates="cart", cascade="all, delete-orphan")
    comments = relationship("CartComment", back_populates="cart", cascade="all, delete-orphan")
    likes = relationship("CartLike", back_populates="cart", cascade="all, delete-orphan")

class CartItem(Base):
    __tablename__ = "cart_items"

    id = Column(Integer, primary_key=True, index=True)
    cart_id = Column(Integer, ForeignKey("shopping_carts.id"), nullable=False)
    name = Column(String, nullable=False)
    quantity = Column(String, nullable=False)
    price = Column(Float, nullable=True)

    # Связи
    cart = relationship("ShoppingCart", back_populates="items")

class CartComment(Base):
    __tablename__ = "cart_comments"

    id = Column(Integer, primary_key=True, index=True)
    cart_id = Column(Integer, ForeignKey("shopping_carts.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    text = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Связи
    cart = relationship("ShoppingCart", back_populates="comments")
    user = relationship("User", back_populates="cart_comments")

class CartLike(Base):
    __tablename__ = "cart_likes"

    id = Column(Integer, primary_key=True, index=True)
    cart_id = Column(Integer, ForeignKey("shopping_carts.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Связи
    cart = relationship("ShoppingCart", back_populates="likes")
    user = relationship("User", back_populates="cart_likes")