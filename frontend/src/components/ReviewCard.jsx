import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { likeReview, unlikeReview } from '../services/api';

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

function ReviewCard({ review, onLikeUpdate }) {
    const [isLiked, setIsLiked] = useState(review.is_liked || false);
    const [likesCount, setLikesCount] = useState(review.likes_count || 0);
    const [isProcessing, setIsProcessing] = useState(false);
    const isAuthenticated = !!localStorage.getItem('access_token');

    const handleLike = async () => {
        if (!isAuthenticated) {
            window.location.href = '/login';
            return;
        }
        if (isProcessing) return;
        setIsProcessing(true);
        try {
            if (isLiked) {
                await unlikeReview(review.id);
                setIsLiked(false);
                setLikesCount(prev => prev - 1);
                if (onLikeUpdate) onLikeUpdate(review.id, false);
            } else {
                await likeReview(review.id);
                setIsLiked(true);
                setLikesCount(prev => prev + 1);
                if (onLikeUpdate) onLikeUpdate(review.id, true);
            }
        } catch (err) {
            console.error('Ошибка лайка:', err);
        } finally {
            setIsProcessing(false);
        }
    };

    const getTargetInfo = () => {
        if (review.target_type === 'recipe') {
            return { emoji: '📝', text: 'Рецепт', link: `/recipe/${review.target_id}` };
        } else if (review.target_type === 'cart') {
            return { emoji: '🛒', text: 'Корзина', link: `/cart/${review.target_id}` };
        } else if (review.target_type === 'shop') {
            return { emoji: '🏪', text: review.shop_name || 'Магазин', link: null };
        }
        return { emoji: '⭐', text: 'Отзыв', link: null };
    };

    const targetInfo = getTargetInfo();

    return (
        <div className="card card-hover p-5">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    <AvatarDisplay
                        avatarUrl={review.avatar_url}
                        username={review.username}
                    />
                    <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{review.username || 'Пользователь'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{review.time_ago || 'недавно'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {review.rating && (
                        <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-full">
                            <span className="text-yellow-500">⭐</span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{review.rating}</span>
                        </div>
                    )}
                    <div className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full text-xs text-gray-600 dark:text-gray-400">
                        {targetInfo.emoji} {targetInfo.text}
                    </div>
                </div>
            </div>

            <Link to={`/review/${review.id}`}>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    {review.title}
                </h2>
            </Link>

            <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">{review.content}</p>

            {targetInfo.link && (
                <Link to={targetInfo.link} className="text-primary-600 dark:text-primary-400 text-sm hover:underline mt-2 inline-block">
                    Перейти к {targetInfo.text.toLowerCase()} →
                </Link>
            )}

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                <button
                    onClick={handleLike}
                    disabled={isProcessing}
                    className="flex items-center gap-1 text-sm hover:opacity-75 transition-opacity"
                >
                    <span className={isLiked ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}>
                        {isLiked ? '❤️' : '🤍'}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">{likesCount}</span>
                </button>
                <Link
                    to={`/review/${review.id}`}
                    className="text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700 dark:hover:text-primary-300 text-sm"
                >
                    Читать отзыв →
                </Link>
            </div>
        </div>
    );
}

export default ReviewCard;