import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { searchRecipes, addFavorite, removeFavorite, getFavorites } from '../services/api';

function SearchPage() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [favorites, setFavorites] = useState(new Set());

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
            setRecipes(data || []);

            // Загружаем избранное текущего пользователя
            try {
                const favoritesData = await getFavorites();
                const favSet = new Set(favoritesData.map(fav => fav.id));
                setFavorites(favSet);
            } catch (err) {
                console.error('Error loading favorites:', err);
            }
        } catch (error) {
            console.error('Ошибка поиска:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFavoriteUpdate = async (recipeId, isFavorited) => {
        setRecipes(prev => prev.map(recipe =>
            recipe.id === recipeId
                ? { ...recipe, favorites_count: (recipe.favorites_count || 0) + (isFavorited ? 1 : -1) }
                : recipe
        ));

        if (isFavorited) {
            setFavorites(prev => new Set([...prev, recipeId]));
        } else {
            setFavorites(prev => {
                const newSet = new Set(prev);
                newSet.delete(recipeId);
                return newSet;
            });
        }
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
                            isFavorited={favorites.has(recipe.id)}
                            onFavoriteUpdate={handleFavoriteUpdate}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function SearchResultCard({ recipe, isFavorited, onFavoriteUpdate }) {
    const [favorited, setFavorited] = useState(isFavorited || false);
    const [favoritesCount, setFavoritesCount] = useState(recipe.favorites_count || 0);
    const [isProcessing, setIsProcessing] = useState(false);
    const isAuthenticated = !!localStorage.getItem('access_token');

    const handleFavorite = async () => {
        if (!isAuthenticated) {
            window.location.href = '/login';
            return;
        }
        if (isProcessing) return;
        setIsProcessing(true);
        try {
            if (favorited) {
                await removeFavorite(recipe.id);
                setFavorited(false);
                setFavoritesCount(prev => prev - 1);
                if (onFavoriteUpdate) onFavoriteUpdate(recipe.id, false);
            } else {
                await addFavorite(recipe.id);
                setFavorited(true);
                setFavoritesCount(prev => prev + 1);
                if (onFavoriteUpdate) onFavoriteUpdate(recipe.id, true);
            }
        } catch (err) {
            console.error('Ошибка избранного:', err);
        } finally {
            setIsProcessing(false);
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
                    <button
                        onClick={handleFavorite}
                        disabled={isProcessing}
                        className="flex items-center gap-1 text-sm"
                    >
                        <span className={favorited ? 'text-red-500' : 'text-gray-500'}>
                            {favorited ? '❤️' : '🤍'}
                        </span>
                        <span>{favoritesCount}</span>
                    </button>
                    <span className="text-sm text-gray-500">💬 {recipe.comments_count || 0}</span>
                    <span className="text-green-600 font-bold">{recipe.total_price} ₽</span>
                </div>
            </div>
        </div>
    );
}

export default SearchPage;