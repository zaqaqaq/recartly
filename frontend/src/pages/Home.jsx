import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getRecipes, addFavorite, removeFavorite, getFavorites, getLatestComments, getCarts, likeCart, unlikeCart, getReviews } from '../services/api';
import { getShopStyle } from '../utils/shopColors';
import ReviewCard from '../components/ReviewCard';
import SkeletonCard from '../components/SkeletonCard';

function Home() {
    const [activeTab, setActiveTab] = useState('recipes');
    const [recipes, setRecipes] = useState([]);
    const [carts, setCarts] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [popularRecipes, setPopularRecipes] = useState([]);
    const [latestComments, setLatestComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [favorites, setFavorites] = useState(new Set());

    const loadData = async () => {
        setLoading(true);
        try {
            const recipesData = await getRecipes();
            setRecipes(recipesData || []);

            const cartsData = await getCarts();
            setCarts(cartsData || []);

            const reviewsData = await getReviews();
            setReviews(reviewsData || []);

            const sortedByLikes = [...(recipesData || [])].sort((a, b) => (b.favorites_count || 0) - (a.favorites_count || 0));
            setPopularRecipes(sortedByLikes.slice(0, 5));

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

    const handleReviewLikeUpdate = async (reviewId, isLiked) => {
        setReviews(prev => prev.map(review =>
            review.id === reviewId
                ? { ...review, likes_count: (review.likes_count || 0) + (isLiked ? 1 : -1), is_liked: isLiked }
                : review
        ));
    };

    if (loading) {
        return (
            <div className="space-y-4 animate-fade-in">
                {[1, 2, 3].map((i) => (
                    <SkeletonCard key={i} type="recipe" />
                ))}
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-6 animate-fade-in">
            <div className="mb-8">
                <h1 className="heading-1 border-l-4 border-primary-500 pl-4">
                    Recartly
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2 ml-4">Готовьте с умом, экономьте с нами</p>
            </div>

            <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 mb-6">
                <button
                    onClick={() => setActiveTab('recipes')}
                    className={`px-6 py-2 text-lg font-medium transition-all ${
                        activeTab === 'recipes'
                            ? 'text-primary-600 border-b-2 border-primary-500'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    }`}
                >
                    📝 Рецепты
                </button>
                <button
                    onClick={() => setActiveTab('carts')}
                    className={`px-6 py-2 text-lg font-medium transition-all ${
                        activeTab === 'carts'
                            ? 'text-primary-600 border-b-2 border-primary-500'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    }`}
                >
                    🛒 Корзины
                </button>
                <button
                    onClick={() => setActiveTab('reviews')}
                    className={`px-6 py-2 text-lg font-medium transition-all ${
                        activeTab === 'reviews'
                            ? 'text-primary-600 border-b-2 border-primary-500'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    }`}
                >
                    ⭐ Отзывы
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1">
                    {activeTab === 'recipes' && (
                        <>
                            {recipes.length === 0 ? (
                                <div className="card p-8 text-center">
                                    <p className="text-gray-500 dark:text-gray-400 mb-4">Пока нет рецептов. Будьте первым!</p>
                                    <Link to="/create" className="btn-primary inline-block">
                                        Создать рецепт
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {recipes.map((recipe, index) => (
                                        <div key={recipe.id} className={`animate-fade-in-up delay-${(index % 5) * 100}`}>
                                            <RecipeCard
                                                recipe={recipe}
                                                isFavorited={favorites.has(recipe.id)}
                                                onFavoriteUpdate={handleFavoriteUpdate}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {activeTab === 'carts' && (
                        <>
                            {carts.length === 0 ? (
                                <div className="card p-8 text-center">
                                    <p className="text-gray-500 dark:text-gray-400 mb-4">Пока нет корзин. Будьте первым!</p>
                                    <Link to="/create-cart" className="btn-primary inline-block">
                                        Создать корзину
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {carts.map((cart, index) => (
                                        <div key={cart.id} className={`animate-fade-in-up delay-${(index % 5) * 100}`}>
                                            <CartCard
                                                cart={cart}
                                                onLikeUpdate={handleCartLikeUpdate}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {activeTab === 'reviews' && (
                        <>
                            {reviews.length === 0 ? (
                                <div className="card p-8 text-center">
                                    <p className="text-gray-500 dark:text-gray-400 mb-4">Пока нет отзывов. Будьте первым!</p>
                                    <Link to="/create-review" className="btn-primary inline-block">
                                        Создать отзыв
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {reviews.map((review, index) => (
                                        <div key={review.id} className={`animate-fade-in-up delay-${(index % 5) * 100}`}>
                                            <ReviewCard
                                                review={review}
                                                onLikeUpdate={handleReviewLikeUpdate}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="lg:w-80 space-y-6">
                    <SidebarSection title="🔥 Популярное">
                        {popularRecipes.map((recipe) => (
                            <PopularItem key={recipe.id} recipe={recipe} onFavoriteUpdate={handleFavoriteUpdate} />
                        ))}
                    </SidebarSection>

                    <SidebarSection title="🏷️ Актуальные акции">
                        {['Пятёрочка', 'Магнит', 'Лента', 'Перекрёсток', 'Озон'].map((shop, idx) => (
                            <div key={idx} className="flex justify-between items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors">
                                <span className="font-medium text-gray-700 dark:text-gray-300">{shop}</span>
                                <span className="text-primary-500 font-semibold text-sm">Скидки</span>
                            </div>
                        ))}
                    </SidebarSection>

                    <SidebarSection title="💬 Последние комментарии">
                        {latestComments.slice(0, 4).map((comment, idx) => (
                            <div key={idx} className="border-b border-gray-100 dark:border-gray-700 pb-3 last:border-0">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-xs text-primary-600">
                                        {comment.username?.[0]?.toUpperCase() || '?'}
                                    </div>
                                    <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">{comment.username}</p>
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mt-1">{comment.text}</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{comment.time_ago || 'только что'}</p>
                            </div>
                        ))}
                    </SidebarSection>
                </div>
            </div>
        </div>
    );
}

// ===== Компоненты =====

function AvatarDisplay({ avatarUrl, username, size = "w-10 h-10 text-base" }) {
    const getInitials = () => {
        return username ? username[0].toUpperCase() : '?';
    };

    if (avatarUrl && avatarUrl.startsWith('emoji:')) {
        const parts = avatarUrl.split(':');
        const emoji = parts[1];
        const bg = parts[2] || 'bg-primary-100';
        const textColor = parts[3] || 'text-primary-600';
        return (
            <div className={`${size} rounded-full ${bg} ${textColor} flex items-center justify-center avatar`}>
                {emoji}
            </div>
        );
    } else if (avatarUrl) {
        return (
            <img
                src={`http://localhost:8000${avatarUrl}`}
                alt={username}
                className={`${size} rounded-full object-cover`}
            />
        );
    }
    return (
        <div className={`${size} rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold avatar`}>
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
        <div className="card card-hover overflow-hidden">
            <div className="flex flex-col md:flex-row p-4 gap-4">
                <div className="md:w-40 h-40 bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden flex-shrink-0">
                    {photoUrl ? (
                        <img
                            src={photoUrl}
                            alt={recipe.title}
                            className="w-full h-full object-cover"
                            onError={() => setImgError(true)}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl text-gray-400 dark:text-gray-500">
                            🍲
                        </div>
                    )}
                </div>

                <div className="flex-1">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <AvatarDisplay
                                avatarUrl={recipe.avatar_url}
                                username={recipe.username}
                            />
                            <div>
                                <p className="font-semibold text-gray-900 dark:text-white">{recipe.username || 'Пользователь'}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{recipe.time_ago || 'недавно'}</p>
                            </div>
                        </div>
                        {recipe.total_price && (
                            <div className="bg-primary-100 dark:bg-primary-900/30 px-3 py-1 rounded-full">
                                <span className="text-primary-700 dark:text-primary-400 font-bold text-sm">{recipe.total_price} ₽</span>
                            </div>
                        )}
                    </div>

                    <Link to={`/recipe/${recipe.id}`}>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-3 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                            {recipe.title}
                        </h2>
                    </Link>

                    {recipe.description && (
                        <p className="text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">{recipe.description}</p>
                    )}

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                        <button
                            onClick={handleFavorite}
                            disabled={isProcessing}
                            className="flex items-center gap-1 text-sm hover:opacity-75 transition-opacity"
                        >
                            <span className={favorited ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}>
                                {favorited ? '❤️' : '🤍'}
                            </span>
                            <span className="text-gray-600 dark:text-gray-400">{favoritesCount}</span>
                        </button>
                        <Link
                            to={`/recipe/${recipe.id}`}
                            className="text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700 dark:hover:text-primary-300 text-sm"
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
        <div className="card card-hover p-5">
            <div className="flex items-center justify-between mb-3">
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${shopStyle.bgColor} ${shopStyle.textColor}`}>
                    <span>{shopStyle.emoji}</span>
                    <span className="text-sm font-medium">{cart.shop_name || 'Магазин не указан'}</span>
                </div>
                <div className="text-primary-600 dark:text-primary-400 font-bold text-lg">{cart.total_price || 0} ₽</div>
            </div>

            <Link to={`/cart/${cart.id}`}>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    {cart.title}
                </h2>
            </Link>

            {cart.description && (
                <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-3">{cart.description}</p>
            )}

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2">
                    <AvatarDisplay
                        avatarUrl={cart.avatar_url}
                        username={cart.username}
                        size="w-8 h-8 text-sm"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{cart.username}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                    <button onClick={handleLike} disabled={isProcessing} className="flex items-center gap-1">
                        <span className={isLiked ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}>
                            {isLiked ? '❤️' : '🤍'}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">{likesCount}</span>
                    </button>
                    <Link to={`/cart/${cart.id}`} className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
                        Подробнее →
                    </Link>
                </div>
            </div>
        </div>
    );
}

function SidebarSection({ title, children }) {
    return (
        <div className="card p-5">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4 pb-2 border-b-2 border-primary-500 inline-block">
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
        <Link to={`/recipe/${recipe.id}`} className="block hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl p-2 transition-colors">
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{recipe.username || 'Пользователь'}</p>
                    <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-1">{recipe.title}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <button onClick={handleFavorite} className="flex items-center gap-1">
                            <span>{favorited ? '❤️' : '🤍'}</span>
                            <span>{favoritesCount}</span>
                        </button>
                        <span>💬 {recipe.comments_count || 0}</span>
                    </div>
                </div>
                {recipe.total_price && (
                    <span className="text-primary-600 dark:text-primary-400 font-bold text-sm">{recipe.total_price} ₽</span>
                )}
            </div>
        </Link>
    );
}

export default Home;