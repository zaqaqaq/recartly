import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyProfile, updateProfile, uploadAvatar } from '../services/api';

const PRESET_AVATARS = [
    { emoji: '🍲', bg: 'bg-green-100', textColor: 'text-green-600' },
    { emoji: '👨‍🍳', bg: 'bg-blue-100', textColor: 'text-blue-600' },
    { emoji: '👩‍🍳', bg: 'bg-pink-100', textColor: 'text-pink-600' },
    { emoji: '🍕', bg: 'bg-orange-100', textColor: 'text-orange-600' },
    { emoji: '🥗', bg: 'bg-emerald-100', textColor: 'text-emerald-600' },
    { emoji: '🍰', bg: 'bg-rose-100', textColor: 'text-rose-600' },
    { emoji: '🐱', bg: 'bg-yellow-100', textColor: 'text-yellow-600' },
    { emoji: '🐶', bg: 'bg-amber-100', textColor: 'text-amber-600' },
    { emoji: '⭐', bg: 'bg-purple-100', textColor: 'text-purple-600' },
    { emoji: '❤️', bg: 'bg-red-100', textColor: 'text-red-600' },
    { emoji: '👍', bg: 'bg-indigo-100', textColor: 'text-indigo-600' },
    { emoji: '😋', bg: 'bg-teal-100', textColor: 'text-teal-600' },
];

function SettingsPage() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        bio: '',
        city: '',
        website: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const data = await getMyProfile();
            setProfile(data);
            setFormData({
                username: data.username || '',
                email: data.email || '',
                bio: data.bio || '',
                city: data.city || '',
                website: data.website || ''
            });
            // Обновляем localStorage
            localStorage.setItem('username', data.username);
            if (data.avatar_url) {
                localStorage.setItem('avatar_url', data.avatar_url);
            } else {
                localStorage.removeItem('avatar_url');
            }
            // Триггерим событие для обновления Navbar
            window.dispatchEvent(new Event('storage'));
        } catch (err) {
            console.error('Ошибка загрузки профиля:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const updateData = {
                username: formData.username,
                bio: formData.bio,
                city: formData.city,
                website: formData.website
            };
            const updated = await updateProfile(updateData);
            setProfile(updated);
            localStorage.setItem('username', updated.username);
            setSuccess('Настройки сохранены!');
            setTimeout(() => setSuccess(''), 3000);
            window.dispatchEvent(new Event('storage'));
        } catch (err) {
            setError('Ошибка сохранения');
        }
    };

    const handleSelectPreset = async (preset) => {
        const avatarValue = `emoji:${preset.emoji}:${preset.bg}:${preset.textColor}`;
        setUploading(true);
        setError('');

        try {
            await updateProfile({ avatar_url: avatarValue });
            localStorage.setItem('avatar_url', avatarValue);
            setSuccess('Аватарка обновлена!');
            setTimeout(() => setSuccess(''), 2000);
            await loadProfile(); // Перезагружаем профиль
        } catch (err) {
            setError('Ошибка сохранения аватарки');
        } finally {
            setUploading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('Можно загружать только изображения');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            setError('Файл не должен превышать 2MB');
            return;
        }

        const formDataPhoto = new FormData();
        formDataPhoto.append('file', file);

        setUploading(true);
        setError('');

        try {
            const response = await uploadAvatar(formDataPhoto);
            await updateProfile({ avatar_url: response.avatar_url });
            localStorage.setItem('avatar_url', response.avatar_url);
            setSuccess('Фото загружено!');
            setTimeout(() => setSuccess(''), 2000);
            await loadProfile(); // Перезагружаем профиль
        } catch (err) {
            setError('Ошибка загрузки фото');
        } finally {
            setUploading(false);
        }
    };

    const getCurrentAvatarDisplay = () => {
        if (!profile) return null;

        if (profile.avatar_url && profile.avatar_url.startsWith('emoji:')) {
            const parts = profile.avatar_url.split(':');
            const emoji = parts[1];
            const bg = parts[2] || 'bg-green-100';
            const textColor = parts[3] || 'text-green-600';
            return (
                <div className={`w-20 h-20 rounded-full ${bg} flex items-center justify-center text-3xl ${textColor}`}>
                    {emoji}
                </div>
            );
        } else if (profile.avatar_url) {
            return (
                <img
                    src={`http://localhost:8000${profile.avatar_url}`}
                    alt="Avatar"
                    className="w-20 h-20 rounded-full object-cover"
                />
            );
        } else {
            return (
                <div className="w-20 h-20 bg-green-200 rounded-full flex items-center justify-center text-2xl font-bold text-green-700">
                    {profile.username?.[0]?.toUpperCase() || '?'}
                </div>
            );
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
            <div className="max-w-2xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 border-l-4 border-green-500 pl-4">
                        ⚙️ Настройки профиля
                    </h1>
                    <p className="text-gray-500 mt-2 ml-4">Управляйте информацией о себе и аватаркой</p>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">🖼️ Моя аватарка</h2>
                    <div className="flex flex-col items-center mb-4">
                        {getCurrentAvatarDisplay()}
                        <p className="text-sm text-gray-500 mt-2">{profile?.username}</p>
                    </div>

                    <div className="mb-4">
                        <h3 className="text-md font-medium text-gray-700 mb-2">Загрузить своё фото</h3>
                        <div className="flex items-center gap-4">
                            <label className="cursor-pointer bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
                                {uploading ? 'Загрузка...' : '📷 Выбрать фото'}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    disabled={uploading}
                                    className="hidden"
                                />
                            </label>
                            <p className="text-sm text-gray-500">JPG, PNG до 2MB</p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-md font-medium text-gray-700 mb-2">Выбрать иконку</h3>
                        <div className="grid grid-cols-6 gap-3">
                            {PRESET_AVATARS.map((preset, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSelectPreset(preset)}
                                    disabled={uploading}
                                    className={`w-12 h-12 rounded-full ${preset.bg} ${preset.textColor} flex items-center justify-center text-xl hover:scale-110 transition-transform disabled:opacity-50`}
                                >
                                    {preset.emoji}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-4">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                disabled
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                            />
                            <p className="text-xs text-gray-400 mt-1">Email нельзя изменить</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Имя пользователя
                            </label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                О себе
                            </label>
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                rows="4"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="Расскажите о себе, своих кулинарных предпочтениях..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Город
                            </label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="Москва, Санкт-Петербург..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Сайт или соцсеть
                            </label>
                            <input
                                type="url"
                                name="website"
                                value={formData.website}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="https://..."
                            />
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                type="submit"
                                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                            >
                                Сохранить
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/profile')}
                                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
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

export default SettingsPage;