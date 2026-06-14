import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { searchRecipes, likeRecipe, unlikeRecipe } from '../services/api';

function SearchPage() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    useEffect(() => {
        if (query) {
            loadSearchResults();
        }
    }, [query, minPrice, maxPrice]);

    const loadSearchResults = async () => {
        setLoading(true);
        try {
            const data = await searchRecipes(
                query,
                minPrice ? parseFloat(minPrice) : null,
                maxPrice ? parseFloat(maxPrice) : null
            );
            setRecipes(data);
        } catch (error) {
            console.error('Ошибка поиска:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLikeUpdate = async (recipeId, isLiked) => {
        setRecipes(prev => prev.map(recipe =>
            recipe.id === recipeId
                ? { ...recipe, likes_count: recipe.likes_count + (isLiked ? 1 : -1), user_liked: isLiked }
                : recipe
        ));
    };

    if (loading) {
        return (
            <div className="text-center py-10">
                <p className="text-gray-600">Поиск...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
                Результаты поиска: "{query}"
            </h1>

            <div className="bg-white rounded-xl shadow-md p-4 mb-6">
                <div className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Цена от</label>
                        <input
                            type="number"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            placeholder="0"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Цена до</label>
                        <input
                            type="number"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            placeholder="1000"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                    <button
                        onClick={loadSearchResults}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                        Применить
                    </button>
                </div>
            </div>

            {recipes.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">Ничего не найдено</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {recipes.map((recipe) => (
                        <SearchResultCard
                            key={recipe.id}
                            recipe={recipe}
                            onLikeUpdate={handleLikeUpdate}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function SearchResultCard({ recipe, onLikeUpdate }) {
    const [liked, setLiked] = useState(recipe.user_liked || false);
    const [likesCount, setLikesCount] = useState(recipe.likes_count || 0);
    const isAuthenticated = !!localStorage.getItem('access_token');

    const handleLike = async () => {
        if (!isAuthenticated) {
            window.location.href = '/login';
            return;
        }
        try {
            if (liked) {
                await unlikeRecipe(recipe.id);
                setLiked(false);
                setLikesCount(prev => prev - 1);
                if (onLikeUpdate) onLikeUpdate(recipe.id, false);
            } else {
                await likeRecipe(recipe.id);
                setLiked(true);
                setLikesCount(prev => prev + 1);
                if (onLikeUpdate) onLikeUpdate(recipe.id, true);
            }
        } catch (err) {
            console.error('Ошибка лайка:', err);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-4 flex gap-4">
            {recipe.photo_url && (
                <img
                    src={`http://localhost:8000${recipe.photo_url}`}
                    alt={recipe.title}
                    className="w-24 h-24 object-cover rounded-lg"
                />
            )}
            <div className="flex-1">
                <Link to={`/recipe/${recipe.id}`}>
                    <h2 className="text-lg font-bold text-gray-800 hover:text-green-600">{recipe.title}</h2>
                </Link>
                <p className="text-sm text-gray-500">{recipe.username} • {recipe.time_ago}</p>
                <p className="text-gray-600 text-sm mt-1 line-clamp-2">{recipe.description}</p>
                <div className="flex items-center gap-4 mt-2">
                    <button onClick={handleLike} className="flex items-center gap-1 text-sm">
                        <span>{liked ? '❤️' : '🤍'}</span>
                        <span>{likesCount}</span>
                    </button>
                    <span className="text-sm text-gray-500">💬 {recipe.comments_count || 0}</span>
                    <span className="text-green-600 font-bold">{recipe.total_price} ₽</span>
                </div>
            </div>
        </div>
    );
}

export default SearchPage;