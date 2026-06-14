import React from 'react';
import { Link } from 'react-router-dom';

function RecipeCard({ recipe }) {
    return (
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
            <div className="p-5">
                <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                        <img
                            src={`https://i.pravatar.cc/150?img=${recipe.user_id}`}
                            alt={recipe.username}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                            <p className="font-semibold text-gray-800">{recipe.username || 'Пользователь'}</p>
                            <p className="text-xs text-gray-400">недавно</p>
                        </div>
                    </div>
                    {recipe.total_price && (
                        <div className="bg-green-100 px-3 py-1 rounded-full">
                            <span className="text-green-700 font-bold text-sm">{recipe.total_price} ₽</span>
                        </div>
                    )}
                </div>

                <Link to={`/recipe/${recipe.id}`}>
                    <h2 className="text-xl font-bold text-gray-800 mt-3 hover:text-green-600 transition-colors">
                        {recipe.title}
                    </h2>
                </Link>

                {recipe.description && (
                    <p className="text-gray-600 mt-2 line-clamp-2">{recipe.description}</p>
                )}

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                    <div className="flex space-x-4 text-sm text-gray-500">
                        <span>❤️ {recipe.likes_count || 0}</span>
                        <span>💬 {recipe.comments_count || 0}</span>
                    </div>
                    <Link
                        to={`/recipe/${recipe.id}`}
                        className="text-green-600 font-medium hover:text-green-700 text-sm"
                    >
                        Подробнее →
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default RecipeCard;