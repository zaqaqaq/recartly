import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCart } from '../services/api';

const POPULAR_SHOPS = [
    'Пятёрочка', 'Магнит', 'Лента', 'Перекрёсток', 'Озон',
    'Wildberries', 'Яндекс.Лавка', 'ВкусВилл', 'Спар', 'Чижик', 'Ярче', 'Ашан', 'METRO', 'Самокат'
];

function CreateCart() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showShopList, setShowShopList] = useState(true);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        shop_name: '',
        city: '',
        items: [{ name: '', quantity: '', price: '' }]
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index][field] = value;
        setFormData({ ...formData, items: newItems });
    };

    const addItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { name: '', quantity: '', price: '' }]
        });
    };

    const removeItem = (index) => {
        if (formData.items.length > 1) {
            const newItems = formData.items.filter((_, i) => i !== index);
            setFormData({ ...formData, items: newItems });
        }
    };

    const handleShopSelect = (shop) => {
        setFormData({ ...formData, shop_name: shop });
        setShowShopList(false);
    };

    const handleCustomShop = () => {
        setShowShopList(false);
    };

    const handleBackToList = () => {
        setShowShopList(true);
        setFormData({ ...formData, shop_name: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const cartData = {
            title: formData.title,
            description: formData.description,
            shop_name: formData.shop_name,
            city: formData.city,
            items: formData.items
                .filter(item => item.name && item.quantity)
                .map(item => ({
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price ? parseFloat(item.price) : null
                }))
        };

        if (cartData.items.length === 0) {
            setError('Добавьте хотя бы один продукт');
            setLoading(false);
            return;
        }

        if (!cartData.shop_name) {
            setError('Выберите или введите название магазина');
            setLoading(false);
            return;
        }

        try {
            await createCart(cartData);
            navigate('/carts');
        } catch (err) {
            setError(err.response?.data?.detail || 'Ошибка создания корзины');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 border-l-4 border-green-500 pl-4">
                        🛒 Новая корзина
                    </h1>
                    <p className="text-gray-500 mt-2 ml-4">Поделитесь своим списком покупок</p>
                </div>

                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        {/* Название */}
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">
                                Название корзины <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Например: Ужин на 4х за 1800р"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                required
                            />
                        </div>

                        {/* Описание */}
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">
                                Описание
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="3"
                                placeholder="Коротко о вашей корзине..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>

                        {/* Магазин */}
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">
                                Магазин <span className="text-red-500">*</span>
                            </label>

                            {showShopList ? (
                                <div>
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {POPULAR_SHOPS.map(shop => (
                                            <button
                                                key={shop}
                                                type="button"
                                                onClick={() => handleShopSelect(shop)}
                                                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-green-100 hover:text-green-700 transition-colors"
                                            >
                                                {shop}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleCustomShop}
                                        className="text-green-600 text-sm hover:underline"
                                    >
                                        + Другой магазин
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <input
                                        type="text"
                                        name="shop_name"
                                        value={formData.shop_name}
                                        onChange={handleChange}
                                        placeholder="Введите название магазина"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleBackToList}
                                        className="text-gray-500 text-sm hover:underline mt-1"
                                    >
                                        ← Выбрать из списка
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Город */}
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">
                                Город
                            </label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                placeholder="Например: Томск, Москва..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>

                        {/* Продукты */}
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">
                                Список продуктов <span className="text-red-500">*</span>
                            </label>
                            <div className="space-y-3">
                                {formData.items.map((item, index) => (
                                    <div key={index} className="flex flex-wrap gap-2 items-center">
                                        <input
                                            type="text"
                                            placeholder="Название"
                                            value={item.name}
                                            onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                                            className="flex-1 min-w-[120px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                            required
                                        />
                                        <input
                                            type="text"
                                            placeholder="Количество"
                                            value={item.quantity}
                                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                            className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                            required
                                        />
                                        <input
                                            type="number"
                                            placeholder="Цена, ₽"
                                            value={item.price}
                                            onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                                            className="w-28 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                            step="0.01"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeItem(index)}
                                            className="w-8 h-8 bg-red-500 text-white rounded-full hover:bg-red-600 flex items-center justify-center"
                                            title="Удалить"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button
                                type="button"
                                onClick={addItem}
                                className="mt-3 text-green-600 hover:text-green-700 font-medium text-sm flex items-center gap-1"
                            >
                                <span className="text-lg">+</span> Добавить продукт
                            </button>
                        </div>

                        {/* Кнопки */}
                        <div className="flex gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Публикация...' : 'Опубликовать корзину'}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/carts')}
                                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors"
                            >
                                Отмена
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default CreateCart;