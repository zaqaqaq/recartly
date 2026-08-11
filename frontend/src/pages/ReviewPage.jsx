import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getReview, deleteReview, likeReview, unlikeReview, getReviewComments, createReviewComment, deleteReviewComment } from '../services/api';

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

function ReviewPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [review, setReview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [commentLoading, setCommentLoading] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);

    const isAuthenticated = !!localStorage.getItem('access_token');

    useEffect(() => {
        loadReview();
        loadComments();
    }, [id]);

    const loadReview = async () => {
        try {
            const data = await getReview(id);
            setReview(data);
            setLikesCount(data.likes_count || 0);
            setIsLiked(data.is_liked || false);
        } catch (err) {
            setError('Отзыв не найден');
        } finally {
            setLoading(false);
        }
    };

    const loadComments = async () => {
        try {
            const data = await getReviewComments(id);
            setComments(data || []);
        } catch (err) {
            console.error('Ошибка загрузки комментариев', err);
        }
    };

    const handleLike = async () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        try {
            if (isLiked) {
                await unlikeReview(id);
                setIsLiked(false);
                setLikesCount(prev => prev - 1);
            } else {
                await likeReview(id);
                setIsLiked(true);
                setLikesCount(prev => prev + 1);
            }
        } catch (err) {
            console.error('Ошибка', err);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Вы уверены, что хотите удалить этот отзыв?')) {
            try {
                await deleteReview(id);
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
            await createReviewComment(id, newComment);
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
                await deleteReviewComment(id, commentId);
                loadComments();
            } catch (err) {
                alert('Ошибка удаления');
            }
        }
    };

    const getTargetInfo = () => {
        if (!review) return { emoji: '⭐', text: '', link: null };
        if (review.target_type === 'recipe') {
            return { emoji: '📝', text: 'Рецепт', link: `/recipe/${review.target_id}` };
        } else if (review.target_type === 'cart') {
            return { emoji: '🛒', text: 'Корзина', link: `/cart/${review.target_id}` };
        } else if (review.target_type === 'shop') {
            return { emoji: '🏪', text: review.shop_name || 'Магазин', link: null };
        }
        return { emoji: '⭐', text: 'Отзыв', link: null };
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="text-center">
                <div className="text-green-600 text-xl">⭐ Загрузка...</div>
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

    if (!review) return null;

    const targetInfo = getTargetInfo();

    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="mb-4 text-sm text-gray-500">
                    <button onClick={() => navigate('/')} className="hover:text-green-600">Главная</button>
                    <span className="mx-2">/</span>
                    <span className="text-gray-700">Отзывы</span>
                    <span className="mx-2">/</span>
                    <span className="text-gray-700">{review.title}</span>
                </div>

                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="p-6 md:p-8">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-600">
                                        {targetInfo.emoji} {targetInfo.text}
                                    </div>
                                    {review.rating && (
                                        <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full">
                                            <span className="text-yellow-500">⭐</span>
                                            <span className="text-sm font-medium">{review.rating}</span>
                                        </div>
                                    )}
                                </div>
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                                    {review.title}
                                </h1>
                            </div>
                            {isAuthenticated && review.user_id === parseInt(localStorage.getItem('user_id')) && (
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
                                    avatarUrl={review.avatar_url}
                                    username={review.username}
                                    size="w-10 h-10 text-base"
                                />
                                <div>
                                    <p className="font-semibold text-gray-800">{review.username || 'Пользователь'}</p>
                                    <p className="text-xs text-gray-400">
                                        {new Date(review.created_at).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            <button onClick={handleLike} className="flex items-center gap-2 px-3 py-1 rounded-lg hover:bg-gray-100 transition-colors">
                                <span className="text-2xl">{isLiked ? '❤️' : '🤍'}</span>
                                <span className="font-semibold">{likesCount}</span>
                            </button>
                        </div>

                        <div className="mb-6">
                            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                {review.content}
                            </p>
                        </div>

                        {targetInfo.link && (
                            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600">
                                    🎯 Отзыв о {targetInfo.text.toLowerCase()}:
                                    <a href={targetInfo.link} className="ml-2 text-green-600 hover:underline">
                                        Перейти →
                                    </a>
                                </p>
                            </div>
                        )}

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

export default ReviewPage;