import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getRecipes, addFavorite, removeFavorite, getFavorites, getLatestComments, getCarts, likeCart, unlikeCart } from '../services/api';
import { getShopStyle } from '../utils/shopColors';

function Home() {
    const [activeTab, setActiveTab] = useState('recipes'); // 'recipes' or 'carts'
    const [recipes, setRecipes] = useState([]);
    const [carts, setCarts] = useState([]);
    const [popularRecipes, setPopularRecipes] = useState([]);
    const [latestComments, setLatestComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [favorites, setFavorites] = useState(new Set());

    const loadData = async () => {
        setLoading(true);
        try {
            // Загружаем рецепты
            const recipesData = await getRecipes();
            setRecipes(recipesData || []);

            // Загружаем корзины
            const cartsData = await getCarts();
            setCarts(cartsData || []);

            const sortedByLikes = [...(recipesData || [])].sort((a, b) => (b.favorites_count || 0) - (a.favorites_count || 0));
            setPopularRecipes(sortedByLikes.slice(0, 5));

            // Загружаем избранное
            try {
                const favoritesData = await getFavorites();
                const favSet = new Set(favoritesData.map(fav => fav.id));
                setFavorites(favSet);
            } catch (err) {
                console.error('Error loading favorites:', err);
            }

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

    const handleFavoriteUpdate = async (recipeId, isFavorited) => {
        setRecipes(prev => prev.map(recipe =>
            recipe.id === recipeId
                ? { ...recipe, favorites_count: (recipe.favorites_count || 0) + (isFavorited ? 1 : -1) }
                : recipe
        ));
        setPopularRecipes(prev => prev.map(recipe =>
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

    const handleCartLikeUpdate = async (cartId, isLiked) => {
        setCarts(prev => prev.map(cart =>
            cart.id === cartId
                ? { ...cart, likes_count: (cart.likes_count || 0) + (isLiked ? 1 : -1), is_liked: isLiked }
                : cart
        ));
    };

    if (loading) {
        return (
            <div className="text-center py-10">
                <p className="text-gray-600">Загрузка...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 border-l-4 border-green-500 pl-4">
                    Recartly
                </h1>
                <p className="text-gray-500 mt-2 ml-4">Готовьте с умом, экономьте с нами</p>
            </div>

            {/* Вкладки */}
            <div className="flex gap-2 border-b border-gray-200 mb-6">
                <button
                    onClick={() => setActiveTab('recipes')}
                    className={`px-6 py-2 text-lg font-medium transition-colors ${
                        activeTab === 'recipes'
                            ? 'text-green-600 border-b-2 border-green-600'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    📝 Рецепты
                </button>
                <button
                    onClick={() => setActiveTab('carts')}
                    className={`px-6 py-2 text-lg font-medium transition-colors ${
                        activeTab === 'carts'
                            ? 'text-green-600 border-b-2 border-green-600'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    🛒 Корзины
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1">
                    {activeTab === 'recipes' ? (
                        <>
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
                                            isFavorited={favorites.has(recipe.id)}
                                            onFavoriteUpdate={handleFavoriteUpdate}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            {carts.length === 0 ? (
                                <div className="text-center py-12 bg-gray-50 rounded-lg">
                                    <p className="text-gray-500">Пока нет корзин. Будьте первым!</p>
                                    <Link to="/create-cart" className="mt-4 inline-block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
                                        Создать корзину
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {carts.map((cart) => (
                                        <CartCard
                                            key={cart.id}
                                            cart={cart}
                                            onLikeUpdate={handleCartLikeUpdate}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="lg:w-80 space-y-6">
                    <SidebarSection title="Популярное">
                        {popularRecipes.map((recipe) => (
                            <PopularItem key={recipe.id} recipe={recipe} onFavoriteUpdate={handleFavoriteUpdate} />
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
                                <div className="flex items-center gap-2">
                                    <AvatarDisplay avatarUrl={comment.avatar_url} username={comment.username} size="w-6 h-6 text-xs" />
                                    <p className="font-semibold text-sm text-gray-800">{comment.username}</p>
                                </div>
                                <p className="text-gray-600 text-sm line-clamp-2 mt-1">{comment.text}</p>
                                <p className="text-xs text-gray-400 mt-1">{comment.time_ago || 'только что'}</p>
                            </div>
                        ))}
                    </SidebarSection>
                </div>
            </div>
        </div>
    );
}

function AvatarDisplay({ avatarUrl, username, size = "w-10 h-10 text-base" }) {
    const getInitials = () => {
        return username ? username[0].toUpperCase() : '?';
    };

    if (avatarUrl && avatarUrl.startsWith('emoji:')) {
        const parts = avatarUrl.split(':');
        const emoji = parts[1];
        const bg = parts[2] || 'bg-green-100';
        const textColor = parts[3] || 'text-green-600';
        return (
            <div className={`rounded-full ${bg} ${textColor} flex items-center justify-center ${size}`}>
                {emoji}
            </div>
        );
    } else if (avatarUrl) {
        return (
            <img
                src={`http://localhost:8000${avatarUrl}`}
                alt={username}
                className={`rounded-full object-cover ${size}`}
            />
        );
    }
    return (
        <div className={`rounded-full bg-green-200 text-green-700 flex items-center justify-center font-bold ${size}`}>
            {getInitials()}
        </div>
    );
}

function RecipeCard({ recipe, isFavorited, onFavoriteUpdate }) {
    const [favorited, setFavorited] = useState(isFavorited || false);
    const [favoritesCount, setFavoritesCount] = useState(recipe.favorites_count || 0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [imgError, setImgError] = useState(false);
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

    const photoUrl = recipe.photo_url && !imgError
        ? `http://localhost:8000${recipe.photo_url}`
        : null;

    return (
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
            <div className="flex flex-col md:flex-row p-4 gap-4">
                <div className="md:w-40 h-40 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                    {photoUrl ? (
                        <img
                            src={photoUrl}
                            alt={recipe.title}
                            className="w-full h-full object-cover"
                            onError={() => setImgError(true)}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
                            🍲
                        </div>
                    )}
                </div>

                <div className="flex-1">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                            <AvatarDisplay
                                avatarUrl={recipe.avatar_url}
                                username={recipe.username}
                                size="w-10 h-10 text-base"
                            />
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

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                        <button
                            onClick={handleFavorite}
                            disabled={isProcessing}
                            className="flex items-center gap-1 text-sm hover:opacity-75 transition-opacity"
                        >
                            <span className={favorited ? 'text-red-500' : 'text-gray-500'}>
                                {favorited ? '❤️' : '🤍'}
                            </span>
                            <span>{favoritesCount}</span>
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

function CartCard({ cart, onLikeUpdate }) {
    const [isLiked, setIsLiked] = useState(cart.is_liked || false);
    const [likesCount, setLikesCount] = useState(cart.likes_count || 0);
    const [isProcessing, setIsProcessing] = useState(false);
    const isAuthenticated = !!localStorage.getItem('access_token');
    const shopStyle = getShopStyle(cart.shop_name);

    const handleLike = async () => {
        if (!isAuthenticated) {
            window.location.href = '/login';
            return;
        }

        if (isProcessing) return;
        setIsProcessing(true);

        try {
            if (isLiked) {
                await unlikeCart(cart.id);
                setIsLiked(false);
                setLikesCount(prev => prev - 1);
                if (onLikeUpdate) onLikeUpdate(cart.id, false);
            } else {
                await likeCart(cart.id);
                setIsLiked(true);
                setLikesCount(prev => prev + 1);
                if (onLikeUpdate) onLikeUpdate(cart.id, true);
            }
        } catch (err) {
            console.error('Ошибка лайка:', err);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
            <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${shopStyle.bgColor} ${shopStyle.textColor}`}>
                        <span>{shopStyle.emoji}</span>
                        <span className="text-sm font-medium">{cart.shop_name || 'Магазин не указан'}</span>
                    </div>
                    <div className="text-green-600 font-bold text-lg">{cart.total_price || 0} ₽</div>
                </div>

                <Link to={`/cart/${cart.id}`}>
                    <h2 className="text-xl font-bold text-gray-800 mb-2 hover:text-green-600 transition-colors">
                        {cart.title}
                    </h2>
                </Link>

                {cart.description && (
                    <p className="text-gray-500 text-sm line-clamp-2 mb-3">{cart.description}</p>
                )}

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                        <AvatarDisplay
                            avatarUrl={cart.avatar_url}
                            username={cart.username}
                            size="w-8 h-8 text-sm"
                        />
                        <span className="text-sm text-gray-600">{cart.username}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                        <button onClick={handleLike} disabled={isProcessing} className="flex items-center gap-1">
                            <span className={isLiked ? 'text-red-500' : 'text-gray-400'}>
                                {isLiked ? '❤️' : '🤍'}
                            </span>
                            <span>{likesCount}</span>
                        </button>
                        <Link to={`/cart/${cart.id}`} className="text-green-600 hover:text-green-700">
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

function PopularItem({ recipe, onFavoriteUpdate }) {
    const [favorited, setFavorited] = useState(recipe.is_favorited || false);
    const [favoritesCount, setFavoritesCount] = useState(recipe.favorites_count || 0);
    const isAuthenticated = !!localStorage.getItem('access_token');

    const handleFavorite = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isAuthenticated) {
            window.location.href = '/login';
            return;
        }
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
        }
    };

    return (
        <Link to={`/recipe/${recipe.id}`} className="block hover:bg-gray-50 rounded-lg p-2 transition-colors">
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <p className="font-semibold text-gray-800 text-sm">{recipe.username || 'Пользователь'}</p>
                    <p className="text-gray-700 text-sm line-clamp-1">{recipe.title}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                        <button onClick={handleFavorite} className="flex items-center gap-1">
                            <span>{favorited ? '❤️' : '🤍'}</span>
                            <span>{favoritesCount}</span>
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