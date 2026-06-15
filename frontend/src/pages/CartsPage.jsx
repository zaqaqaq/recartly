import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCarts, likeCart, unlikeCart } from '../services/api';
import { getShopStyle } from '../utils/shopColors';

function CartsPage() {
    const [carts, setCarts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadCarts();
    }, []);

    const loadCarts = async () => {
        try {
            const data = await getCarts();
            setCarts(data || []);
        } catch (err) {
            setError('Ошибка загрузки корзин');
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async (cartId, isLiked) => {
        try {
            if (isLiked) {
                await unlikeCart(cartId);
                setCarts(prev => prev.map(cart =>
                    cart.id === cartId
                        ? { ...cart, likes_count: cart.likes_count - 1, is_liked: false }
                        : cart
                ));
            } else {
                await likeCart(cartId);
                setCarts(prev => prev.map(cart =>
                    cart.id === cartId
                        ? { ...cart, likes_count: cart.likes_count + 1, is_liked: true }
                        : cart
                ));
            }
        } catch (err) {
            console.error('Ошибка лайка:', err);
        }
    };

    if (loading) {
        return (
            <div className="text-center py-10">
                <p className="text-gray-600">Загрузка корзин...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 border-l-4 border-green-500 pl-4">
                    Корзины покупок
                </h1>
                <p className="text-gray-500 mt-2 ml-4">Пользователи делятся своими продуктовыми наборами</p>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
                    {error}
                </div>
            )}

            {carts.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">Пока нет корзин. Будьте первым!</p>
                    <Link to="/create-cart" className="mt-4 inline-block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
                        Создать корзину
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {carts.map((cart) => (
                        <CartCard key={cart.id} cart={cart} onLike={handleLike} />
                    ))}
                </div>
            )}
        </div>
    );
}

function CartCard({ cart, onLike }) {
    const isAuthenticated = !!localStorage.getItem('access_token');
    const shopStyle = getShopStyle(cart.shop_name);

    const handleLikeClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isAuthenticated) {
            window.location.href = '/login';
            return;
        }
        onLike(cart.id, cart.is_liked);
    };

    return (
        <Link to={`/cart/${cart.id}`} className="block">
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
                <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${shopStyle.bgColor} ${shopStyle.textColor}`}>
                            <span>{shopStyle.emoji}</span>
                            <span className="text-sm font-medium">{cart.shop_name || 'Магазин не указан'}</span>
                        </div>
                        <div className="text-green-600 font-bold text-lg">{cart.total_price || 0} ₽</div>
                    </div>

                    <h2 className="text-xl font-bold text-gray-800 mb-2 hover:text-green-600 transition-colors">
                        {cart.title}
                    </h2>

                    {cart.description && (
                        <p className="text-gray-500 text-sm line-clamp-2 mb-3">{cart.description}</p>
                    )}

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center text-sm font-bold text-green-700">
                                {cart.username?.[0]?.toUpperCase() || '?'}
                            </div>
                            <span className="text-sm text-gray-600">{cart.username}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                            <button onClick={handleLikeClick} className="flex items-center gap-1">
                                <span className={cart.is_liked ? 'text-red-500' : 'text-gray-400'}>
                                    {cart.is_liked ? '❤️' : '🤍'}
                                </span>
                                <span>{cart.likes_count || 0}</span>
                            </button>
                            <span>💬 {cart.comments_count || 0}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}

export default CartsPage;