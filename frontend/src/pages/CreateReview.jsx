import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createReview } from '../services/api';

const TARGET_TYPES = [
    { value: 'recipe', label: '📝 Рецепт', placeholder: 'Введите ID рецепта' },
    { value: 'cart', label: '🛒 Корзина', placeholder: 'Введите ID корзины' },
    { value: 'shop', label: '🏪 Магазин', placeholder: 'Введите название магазина' },
];

function CreateReview() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        rating: 5,
        target_type: 'recipe',
        target_id: '',
        shop_name: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleTargetTypeChange = (e) => {
        setFormData({
            ...formData,
            target_type: e.target.value,
            target_id: '',
            shop_name: ''
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const reviewData = {
            title: formData.title,
            content: formData.content,
            rating: parseFloat(formData.rating),
            target_type: formData.target_type,
            target_id: formData.target_type === 'shop' ? null : (formData.target_id ? parseInt(formData.target_id) : null),
            shop_name: formData.target_type === 'shop' ? formData.shop_name : null
        };

        if (reviewData.target_type === 'shop' && !reviewData.shop_name) {
            setError('Введите название магазина');
            setLoading(false);
            return;
        }

        if ((reviewData.target_type === 'recipe' || reviewData.target_type === 'cart') && !reviewData.target_id) {
            setError('Введите ID рецепта или корзины');
            setLoading(false);
            return;
        }

        try {
            await createReview(reviewData);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.detail || 'Ошибка создания отзыва');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 border-l-4 border-green-500 pl-4">
                        ⭐ Новый отзыв
                    </h1>
                    <p className="text-gray-500 mt-2 ml-4">Поделитесь своим мнением</p>
                </div>

                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">
                                Заголовок <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Например: Отличный рецепт!"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">
                                Оценка
                            </label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, rating: star })}
                                        className="text-2xl transition-transform hover:scale-110"
                                    >
                                        {star <= formData.rating ? '⭐' : '☆'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">
                                Тип отзыва
                            </label>
                            <div className="flex gap-4">
                                {TARGET_TYPES.map((type) => (
                                    <label key={type.value} className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="target_type"
                                            value={type.value}
                                            checked={formData.target_type === type.value}
                                            onChange={handleTargetTypeChange}
                                            className="w-4 h-4 text-green-600"
                                        />
                                        <span>{type.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {formData.target_type === 'shop' ? (
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Название магазина <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="shop_name"
                                    value={formData.shop_name}
                                    onChange={handleChange}
                                    placeholder="Пятёрочка, Магнит, Озон..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    required
                                />
                            </div>
                        ) : (
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">
                                    {formData.target_type === 'recipe' ? 'ID рецепта' : 'ID корзины'} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="target_id"
                                    value={formData.target_id}
                                    onChange={handleChange}
                                    placeholder="Введите ID"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    required
                                />
                                <p className="text-xs text-gray-400 mt-1">
                                    ID можно найти в адресной строке страницы рецепта или корзины
                                </p>
                            </div>
                        )}

                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">
                                Текст отзыва <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="content"
                                value={formData.content}
                                onChange={handleChange}
                                rows="8"
                                placeholder="Расскажите о своём опыте..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                required
                            />
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Публикация...' : 'Опубликовать отзыв'}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/')}
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

export default CreateReview;