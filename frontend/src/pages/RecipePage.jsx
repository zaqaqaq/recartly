import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRecipe, deleteRecipe, addFavorite, removeFavorite, getFavorites, getComments, createComment, deleteComment } from '../services/api';

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

function RecipePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [commentLoading, setCommentLoading] = useState(false);
    const [isFavorited, setIsFavorited] = useState(false);
    const [favoritesCount, setFavoritesCount] = useState(0);
    const [imgError, setImgError] = useState(false);

    const isAuthenticated = !!localStorage.getItem('access_token');

    useEffect(() => {
        loadRecipe();
        loadComments();
        loadFavoriteStatus();
    }, [id]);

    const loadRecipe = async () => {
        try {
            const data = await getRecipe(id);
            setRecipe(data);
            setFavoritesCount(data.favorites_count || 0);
        } catch (err) {
            setError('Рецепт не найден');
        } finally {
            setLoading(false);
        }
    };

    const loadComments = async () => {
        try {
            const data = await getComments(id);
            setComments(data || []);
        } catch (err) {
            console.error('Ошибка загрузки комментариев', err);
        }
    };

    const loadFavoriteStatus = async () => {
        if (!isAuthenticated) return;
        try {
            const favorites = await getFavorites();
            const isFav = favorites.some(fav => fav.id === parseInt(id));
            setIsFavorited(isFav);
        } catch (err) {
            console.error('Error loading favorite status:', err);
        }
    };

    const handleFavorite = async () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        try {
            if (isFavorited) {
                await removeFavorite(id);
                setIsFavorited(false);
                setFavoritesCount(prev => prev - 1);
            } else {
                await addFavorite(id);
                setIsFavorited(true);
                setFavoritesCount(prev => prev + 1);
            }
        } catch (err) {
            console.error('Ошибка', err);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Вы уверены, что хотите удалить этот рецепт?')) {
            try {
                await deleteRecipe(id);
                navigate('/');
            } catch (err) {
                alert('Ошибка удаления');
            }
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setCommentLoading(true);
        try {
            await createComment(id, newComment);
            setNewComment('');
            loadComments();
        } catch (err) {
            alert('Ошибка отправки комментария');
        } finally {
            setCommentLoading(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (window.confirm('Удалить комментарий?')) {
            try {
                await deleteComment(commentId);
                loadComments();
            } catch (err) {
                alert('Ошибка удаления');
            }
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="text-center">
                <div className="text-green-600 text-xl">🍲 Загрузка...</div>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
                <div className="text-red-500 text-6xl mb-4">😕</div>
                <p className="text-gray-600">{error}</p>
                <button onClick={() => navigate('/')} className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg">
                    На главную
                </button>
            </div>
        </div>
    );

    if (!recipe) return null;

    const photoUrl = recipe.photo_url && !imgError
        ? `http://localhost:8000${recipe.photo_url}`
        : null;

    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="mb-4 text-sm text-gray-500">
                    <button onClick={() => navigate('/')} className="hover:text-green-600">Главная</button>
                    <span className="mx-2">/</span>
                    <span className="text-gray-700">{recipe.title}</span>
                </div>

                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="w-full h-64 md:h-96 bg-gray-100">
                        {photoUrl ? (
                            <img
                                src={photoUrl}
                                alt={recipe.title}
                                className="w-full h-full object-cover"
                                onError={() => setImgError(true)}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-6xl">
                                🍲
                            </div>
                        )}
                    </div>

                    <div className="p-6 md:p-8">
                        <div className="flex justify-between items-start mb-4">
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex-1">
                                {recipe.title}
                            </h1>
                            {isAuthenticated && recipe.user_id === parseInt(localStorage.getItem('user_id')) && (
                                <button
                                    onClick={handleDelete}
                                    className="ml-4 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                                >
                                    Удалить
                                </button>
                            )}
                        </div>

                        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                            <div className="flex items-center gap-3">
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
                            <button onClick={handleFavorite} className="flex items-center gap-2 px-3 py-1 rounded-lg hover:bg-gray-100 transition-colors">
                                <span className="text-2xl">{isFavorited ? '❤️' : '🤍'}</span>
                                <span className="font-semibold">{favoritesCount}</span>
                            </button>
                        </div>

                        {recipe.description && (
                            <div className="mb-6">
                                <p className="text-gray-600 italic">📝 {recipe.description}</p>
                            </div>
                        )}

                        <div className="mb-8">
                            <h2 className="text-xl font-bold text-gray-800 mb-3">🛒 Ингредиенты</h2>
                            <div className="bg-gray-50 rounded-xl p-4">
                                {recipe.ingredients?.map((ing, idx) => (
                                    <div key={idx} className="flex justify-between py-2 border-b last:border-0 border-gray-200">
                                        <span className="text-gray-700">{ing.name} — {ing.quantity}</span>
                                        <span className="font-semibold text-gray-800">{ing.price || 0} ₽</span>
                                    </div>
                                ))}
                                <div className="flex justify-between pt-3 mt-2 border-t-2 border-green-200">
                                    <span className="font-bold text-gray-800">Общая стоимость:</span>
                                    <span className="font-bold text-green-600 text-lg">{recipe.total_price || 0} ₽</span>
                                </div>
                            </div>
                        </div>

                        <div className="mb-8">
                            <h2 className="text-xl font-bold text-gray-800 mb-3">👨‍🍳 Инструкция</h2>
                            <div className="bg-gray-50 rounded-xl p-4">
                                {recipe.instructions.split('\n').map((step, idx) => (
                                    <p key={idx} className="text-gray-700 mb-2">
                                        {step.startsWith('1.') || step.startsWith('2.') ? step : `• ${step}`}
                                    </p>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-3">💬 Комментарии ({comments.length})</h2>

                            {isAuthenticated ? (
                                <form onSubmit={handleCommentSubmit} className="mb-6">
                                    <textarea
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        rows="3"
                                        placeholder="Напишите комментарий..."
                                        required
                                    />
                                    <button
                                        type="submit"
                                        disabled={commentLoading}
                                        className="mt-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {commentLoading ? 'Отправка...' : 'Отправить'}
                                    </button>
                                </form>
                            ) : (
                                <p className="text-gray-600 mb-6 bg-gray-50 p-3 rounded-lg text-center">
                                    <a href="/login" className="text-green-600 hover:underline">Войдите</a>, чтобы оставить комментарий
                                </p>
                            )}

                            <div className="space-y-4">
                                {comments.length === 0 ? (
                                    <p className="text-gray-500 text-center py-6">Пока нет комментариев. Будьте первым!</p>
                                ) : (
                                    comments.map((comment) => (
                                        <div key={comment.id} className="bg-gray-50 rounded-xl p-4">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <AvatarDisplay
                                                            avatarUrl={comment.avatar_url}
                                                            username={comment.username}
                                                            size="w-6 h-6 text-xs"
                                                        />
                                                        <p className="font-semibold text-gray-800 text-sm">
                                                            {comment.username || `Пользователь ${comment.user_id}`}
                                                        </p>
                                                        <p className="text-xs text-gray-400">
                                                            {new Date(comment.created_at).toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <p className="text-gray-700">{comment.text}</p>
                                                    <div className="flex items-center gap-4 mt-2">
                                                        <button className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                                                            👍 Ответить
                                                        </button>
                                                    </div>
                                                </div>
                                                {isAuthenticated && comment.user_id === parseInt(localStorage.getItem('user_id')) && (
                                                    <button
                                                        onClick={() => handleDeleteComment(comment.id)}
                                                        className="text-red-500 hover:text-red-700 text-sm"
                                                    >
                                                        Удалить
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RecipePage;