from sqlalchemy import Column, Integer, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.core.database import Base

class Like(Base):
    __tablename__ = "likes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    recipe_id = Column(Integer, ForeignKey("recipes.id"), nullable=False)

    # Уникальность: один пользователь — один лайк на рецепт
    __table_args__ = (UniqueConstraint('user_id', 'recipe_id', name='unique_user_recipe_like'),)

    # Связи
    user = relationship("User", back_populates="likes")
    recipe = relationship("Recipe", back_populates="likes")