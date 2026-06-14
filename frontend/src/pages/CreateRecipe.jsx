import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRecipe, uploadPhoto } from '../services/api';

function CreateRecipe() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [photoPreview, setPhotoPreview] = useState('');
    const [photoUrl, setPhotoUrl] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        instructions: '',
        ingredients: [{ name: '', quantity: '', price: '' }]
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleIngredientChange = (index, field, value) => {
        const newIngredients = [...formData.ingredients];
        newIngredients[index][field] = value;
        setFormData({ ...formData, ingredients: newIngredients });
    };

    const addIngredient = () => {
        setFormData({
            ...formData,
            ingredients: [...formData.ingredients, { name: '', quantity: '', price: '' }]
        });
    };

    const removeIngredient = (index) => {
        if (formData.ingredients.length > 1) {
            const newIngredients = formData.ingredients.filter((_, i) => i !== index);
            setFormData({ ...formData, ingredients: newIngredients });
        }
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Превью
        const previewUrl = URL.createObjectURL(file);
        setPhotoPreview(previewUrl);

        // Загрузка на сервер
        const formDataPhoto = new FormData();
        formDataPhoto.append('file', file);

        setUploadingPhoto(true);
        try {
            const response = await uploadPhoto(formDataPhoto);
            setPhotoUrl(response.photo_url);
        } catch (err) {
            console.error('Ошибка загрузки фото:', err);
            setError('Не удалось загрузить фото');
            setPhotoPreview('');
        } finally {
            setUploadingPhoto(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const recipeData = {
            title: formData.title,
            description: formData.description,
            instructions: formData.instructions,
            photo_url: photoUrl || null,
            ingredients: formData.ingredients
                .filter(ing => ing.name && ing.quantity)
                .map(ing => ({
                    name: ing.name,
                    quantity: ing.quantity,
                    price: ing.price ? parseFloat(ing.price) : null
                }))
        };

        if (recipeData.ingredients.length === 0) {
            setError('Добавьте хотя бы один ингредиент');
            setLoading(false);
            return;
        }

        try {
            await createRecipe(recipeData);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.detail || 'Ошибка создания рецепта');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 border-l-4 border-green-500 pl-4">
                        Новый рецепт
                    </h1>
                    <p className="text-gray-500 mt-2 ml-4">Поделитесь своим кулинарным шедевром</p>
                </div>

                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        {/* Фото */}
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">
                                Фото блюда
                            </label>
                            <div className="flex items-center gap-4">
                                {photoPreview && (
                                    <img
                                        src={photoPreview}
                                        alt="Preview"
                                        className="w-24 h-24 object-cover rounded-lg"
                                    />
                                )}
                                <label className="cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg transition-colors">
                                    {uploadingPhoto ? 'Загрузка...' : 'Выбрать фото'}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePhotoUpload}
                                        disabled={uploadingPhoto}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Можно загрузить фото блюда</p>
                        </div>

                        {/* Название */}
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">
                                Название рецепта <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Например: Домашние сырники с вареньем"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                required
                            />
                        </div>

                        {/* Описание */}
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">
                                Краткое описание
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="3"
                                placeholder="Коротко о вашем блюде..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>

                        {/* Ингредиенты */}
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">
                                Ингредиенты <span className="text-red-500">*</span>
                            </label>
                            <div className="space-y-3">
                                {formData.ingredients.map((ingredient, index) => (
                                    <div key={index} className="flex flex-wrap gap-2 items-center">
                                        <input
                                            type="text"
                                            placeholder="Название"
                                            value={ingredient.name}
                                            onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                                            className="flex-1 min-w-[120px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                            required
                                        />
                                        <input
                                            type="text"
                                            placeholder="Количество"
                                            value={ingredient.quantity}
                                            onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                                            className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                            required
                                        />
                                        <input
                                            type="number"
                                            placeholder="Цена, ₽"
                                            value={ingredient.price}
                                            onChange={(e) => handleIngredientChange(index, 'price', e.target.value)}
                                            className="w-28 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                            step="0.01"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeIngredient(index)}
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
                                onClick={addIngredient}
                                className="mt-3 text-green-600 hover:text-green-700 font-medium text-sm flex items-center gap-1"
                            >
                                <span className="text-lg">+</span> Добавить ингредиент
                            </button>
                        </div>

                        {/* Инструкция */}
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">
                                Инструкция приготовления <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="instructions"
                                value={formData.instructions}
                                onChange={handleChange}
                                rows="8"
                                placeholder="1. Подготовьте ингредиенты..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                required
                            />
                        </div>

                        {/* Кнопки */}
                        <div className="flex gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={loading || uploadingPhoto}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Публикация...' : 'Опубликовать рецепт'}
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

export default CreateRecipe;