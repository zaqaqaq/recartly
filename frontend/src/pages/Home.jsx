import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getRecipes, likeRecipe, unlikeRecipe, getLatestComments } from '../services/api';

function Home() {
    const [recipes, setRecipes] = useState([]);
    const [popularRecipes, setPopularRecipes] = useState([]);
    const [latestComments, setLatestComments] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        setLoading(true);
        try {
            const recipesData = await getRecipes();
            setRecipes(recipesData || []);

            const sortedByLikes = [...(recipesData || [])].sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
            setPopularRecipes(sortedByLikes.slice(0, 5));

            try {
                const commentsData = await getLatestComments();
                setLatestComments(commentsData || []);
            } catch (commentErr) {
                console.error('Comments error:', commentErr);
            }
        } catch (error) {
            console.error('Load data error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleLikeUpdate = async (recipeId, isLiked) => {
        setRecipes(prev => prev.map(recipe =>
            recipe.id === recipeId
                ? { ...recipe, likes_count: recipe.likes_count + (isLiked ? 1 : -1), user_liked: isLiked }
                : recipe
        ));
        setPopularRecipes(prev => prev.map(recipe =>
            recipe.id === recipeId
                ? { ...recipe, likes_count: recipe.likes_count + (isLiked ? 1 : -1), user_liked: isLiked }
                : recipe
        ));
    };

    if (loading) {
        return (
            <div className="text-center py-10">
                <p className="text-gray-600">Загрузка рецептов...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 border-l-4 border-green-500 pl-4">
                    Свежие рецепты
                </h1>
                <p className="text-gray-500 mt-2 ml-4">Готовьте с умом, экономьте с нами</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1">
                    {recipes.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                            <p className="text-gray-500">Пока нет рецептов. Будьте первым!</p>
                            <Link to="/create" className="mt-4 inline-block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
                                Создать рецепт
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {recipes.map((recipe) => (
                                <RecipeCard
                                    key={recipe.id}
                                    recipe={recipe}
                                    onLikeUpdate={handleLikeUpdate}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <div className="lg:w-80 space-y-6">
                    <SidebarSection title="Популярное">
                        {popularRecipes.map((recipe) => (
                            <PopularItem key={recipe.id} recipe={recipe} onLikeUpdate={handleLikeUpdate} />
                        ))}
                    </SidebarSection>

                    <SidebarSection title="Актуальные акции в магазинах">
                        {['Пятёрочка', 'Магнит', 'Лента', 'Перекрёсток', 'Озон'].map((shop, idx) => (
                            <div key={idx} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                                <span className="font-medium text-gray-700">{shop}</span>
                                <span className="text-green-600 font-semibold text-sm">Скидки</span>
                            </div>
                        ))}
                    </SidebarSection>

                    <SidebarSection title="Последние комментарии">
                        {latestComments.slice(0, 4).map((comment, idx) => (
                            <div key={idx} className="border-b border-gray-100 pb-2">
                                <p className="font-semibold text-sm text-gray-800">{comment.username}</p>
                                <p className="text-gray-600 text-sm line-clamp-2">{comment.text}</p>
                                <p className="text-xs text-gray-400 mt-1">{comment.time_ago || 'только что'}</p>
                            </div>
                        ))}
                    </SidebarSection>
                </div>
            </div>
        </div>
    );
}

function RecipeCard({ recipe, onLikeUpdate }) {
    const [liked, setLiked] = useState(recipe.user_liked || false);
    const [likesCount, setLikesCount] = useState(recipe.likes_count || 0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [imgError, setImgError] = useState(false);
    const isAuthenticated = !!localStorage.getItem('access_token');

    const handleLike = async () => {
        if (!isAuthenticated) {
            window.location.href = '/login';
            return;
        }

        if (isProcessing) return;
        setIsProcessing(true);

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
        } finally {
            setIsProcessing(false);
        }
    };

    const photoUrl = recipe.photo_url && !imgError
        ? `http://localhost:8000${recipe.photo_url}`
        : null;

    return (
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
            <div className="flex flex-col md:flex-row p-4 gap-4">
                {/* Фото слева с отступами и скруглением */}
                <div className="md:w-40 h-40 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                    {photoUrl ? (
                        <img
                            src={photoUrl}
                            alt={recipe.title}
                            className="w-full h-full object-cover"
                            onError={() => setImgError(true)}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl bg-gray-100">
                            🍲
                        </div>
                    )}
                </div>

                {/* Контент справа */}
                <div className="flex-1">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center text-green-700 font-bold">
                                {recipe.username?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div>
                                <p className="font-semibold text-gray-800">{recipe.username || 'Пользователь'}</p>
                                <p className="text-xs text-gray-400">{recipe.time_ago || 'недавно'}</p>
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

                    {recipe.tags && recipe.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                            {recipe.tags.map((tag, idx) => (
                                <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                        <button
                            onClick={handleLike}
                            disabled={isProcessing}
                            className="flex items-center gap-1 text-sm hover:opacity-75 transition-opacity"
                        >
                            <span className={liked ? 'text-red-500' : 'text-gray-500'}>
                                {liked ? '❤️' : '🤍'}
                            </span>
                            <span>{likesCount}</span>
                        </button>
                        <Link
                            to={`/recipe/${recipe.id}`}
                            className="text-green-600 font-medium hover:text-green-700 text-sm"
                        >
                            Подробнее →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SidebarSection({ title, children }) {
    return (
        <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
            <h3 className="font-bold text-lg text-gray-800 mb-4 pb-2 border-b-2 border-green-500 inline-block">
                {title}
            </h3>
            {children}
        </div>
    );
}

function PopularItem({ recipe, onLikeUpdate }) {
    const [liked, setLiked] = useState(recipe.user_liked || false);
    const [likesCount, setLikesCount] = useState(recipe.likes_count || 0);
    const isAuthenticated = !!localStorage.getItem('access_token');

    const handleLike = async (e) => {
        e.preventDefault();
        e.stopPropagation();
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
        <Link to={`/recipe/${recipe.id}`} className="block hover:bg-gray-50 rounded-lg p-2 transition-colors">
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <p className="font-semibold text-gray-800 text-sm">{recipe.username || 'Пользователь'}</p>
                    <p className="text-gray-700 text-sm line-clamp-1">{recipe.title}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                        <button onClick={handleLike} className="flex items-center gap-1">
                            <span>{liked ? '❤️' : '🤍'}</span>
                            <span>{likesCount}</span>
                        </button>
                        <span>💬 {recipe.comments_count || 0}</span>
                    </div>
                </div>
                {recipe.total_price && (
                    <span className="text-green-600 font-bold text-sm">{recipe.total_price} ₽</span>
                )}
            </div>
        </Link>
    );
}

export default Home;