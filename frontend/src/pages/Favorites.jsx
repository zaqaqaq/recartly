import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFavorites, removeFavorite } from '../services/api';

function Favorites() {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadFavorites();
    }, []);

    const loadFavorites = async () => {
        try {
            const data = await getFavorites();
            setRecipes(data || []);
        } catch (err) {
            setError('Ошибка загрузки избранного');
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (recipeId) => {
        try {
            await removeFavorite(recipeId);
            setRecipes(recipes.filter(r => r.id !== recipeId));
        } catch (err) {
            alert('Ошибка удаления из избранного');
        }
    };

    if (loading) {
        return (
            <div className="text-center py-10">
                <p className="text-gray-600">Загрузка...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 border-l-4 border-green-500 pl-4">
                        ⭐ Избранное
                    </h1>
                    <p className="text-gray-500 mt-2 ml-4">
                        Сохранённые рецепты: {recipes.length}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                {recipes.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-md p-8 text-center">
                        <p className="text-gray-500 mb-4">У вас пока нет избранных рецептов</p>
                        <Link
                            to="/"
                            className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                        >
                            На главную
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {recipes.map((recipe) => (
                            <div key={recipe.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                                <div className="flex flex-col md:flex-row">
                                    {recipe.photo_url && (
                                        <div className="md:w-32 h-32 bg-gray-100">
                                            <img
                                                src={`http://localhost:8000${recipe.photo_url}`}
                                                alt={recipe.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}
                                    <div className="flex-1 p-4">
                                        <div className="flex justify-between items-start">
                                            <Link to={`/recipe/${recipe.id}`}>
                                                <h2 className="text-lg font-bold text-gray-800 hover:text-green-600">
                                                    {recipe.title}
                                                </h2>
                                            </Link>
                                            <button
                                                onClick={() => handleRemove(recipe.id)}
                                                className="text-red-500 hover:text-red-700 text-sm"
                                            >
                                                🗑️ Удалить
                                            </button>
                                        </div>
                                        <p className="text-gray-500 text-sm mt-1">
                                            от {recipe.username}
                                        </p>
                                        <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                                            {recipe.description || 'Без описания'}
                                        </p>
                                        <div className="flex gap-4 mt-2 text-sm text-gray-400">
                                            <span>💬 {recipe.comments_count || 0}</span>
                                            <span className="text-green-600 font-medium">{recipe.total_price} ₽</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Favorites;