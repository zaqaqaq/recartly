import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyCarts, deleteCart } from '../services/api';
import { getShopStyle } from '../utils/shopColors';

function MyCarts() {
    const [carts, setCarts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadCarts();
    }, []);

    const loadCarts = async () => {
        try {
            const data = await getMyCarts();
            setCarts(data || []);
        } catch (err) {
            setError('Ошибка загрузки корзин');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (cartId) => {
        if (window.confirm('Вы уверены, что хотите удалить эту корзину?')) {
            try {
                await deleteCart(cartId);
                setCarts(carts.filter(c => c.id !== cartId));
            } catch (err) {
                alert('Ошибка удаления');
            }
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
                        🛒 Мои корзины
                    </h1>
                    <p className="text-gray-500 mt-2 ml-4">
                        Всего корзин: {carts.length}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                {carts.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-md p-8 text-center">
                        <p className="text-gray-500 mb-4">У вас пока нет корзин</p>
                        <Link
                            to="/create-cart"
                            className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                        >
                            Создать корзину
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {carts.map((cart) => {
                            const shopStyle = getShopStyle(cart.shop_name);
                            return (
                                <div key={cart.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                                    <div className="p-4">
                                        <div className="flex justify-between items-start">
                                            <Link to={`/cart/${cart.id}`} className="flex-1">
                                                <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-full ${shopStyle.bgColor} ${shopStyle.textColor} text-xs mb-2`}>
                                                    <span>{shopStyle.emoji}</span>
                                                    <span>{cart.shop_name || 'Магазин не указан'}</span>
                                                </div>
                                                <h2 className="text-lg font-bold text-gray-800 hover:text-green-600">
                                                    {cart.title}
                                                </h2>
                                                <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                                                    {cart.description || 'Без описания'}
                                                </p>
                                                <div className="flex gap-4 mt-2 text-sm text-gray-400">
                                                    <span>❤️ {cart.likes_count || 0}</span>
                                                    <span>💬 {cart.comments_count || 0}</span>
                                                    <span className="text-green-600 font-medium">{cart.total_price} ₽</span>
                                                </div>
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(cart.id)}
                                                className="text-red-500 hover:text-red-700 text-sm ml-4"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default MyCarts;