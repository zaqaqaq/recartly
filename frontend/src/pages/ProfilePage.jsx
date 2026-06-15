import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyProfile, updateProfile } from '../services/api';

function ProfilePage() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
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
                bio: data.bio || '',
                city: data.city || '',
                website: data.website || ''
            });
            localStorage.setItem('username', data.username);
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
            const updated = await updateProfile(formData);
            setProfile(updated);
            localStorage.setItem('username', updated.username);
            setEditing(false);
            setSuccess('Профиль успешно обновлён!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Ошибка обновления профиля');
        }
    };

    if (loading) {
        return (
            <div className="text-center py-10">
                <p className="text-gray-600">Загрузка профиля...</p>
            </div>
        );
    }

    if (!profile) return null;

    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 h-24"></div>
                    <div className="px-6 pb-6">
                        <div className="flex flex-col md:flex-row items-start md:items-end -mt-12 mb-4">
                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-4xl shadow-lg border-4 border-white">
                                {profile.avatar_url ? (
                                    <img
                                        src={profile.avatar_url}
                                        alt={profile.username}
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-green-200 rounded-full flex items-center justify-center text-green-700 text-3xl font-bold">
                                        {profile.username?.[0]?.toUpperCase() || '?'}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 mt-4 md:mt-0 md:ml-4">
                                <h1 className="text-2xl font-bold text-gray-800">{profile.username}</h1>
                                <p className="text-gray-500 text-sm">@{profile.username}</p>
                                <p className="text-gray-400 text-xs">
                                    Регистрация: {new Date(profile.created_at).toLocaleDateString('ru-RU')}
                                </p>
                            </div>
                            <button
                                onClick={() => setEditing(!editing)}
                                className="mt-4 md:mt-0 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg transition-colors"
                            >
                                {editing ? 'Отмена' : '✏️ Редактировать'}
                            </button>
                        </div>

                        <div className="flex gap-6 py-4 border-t border-gray-100">
                            <div className="text-center">
                                <div className="text-xl font-bold text-gray-800">{profile.recipes_count || 0}</div>
                                <div className="text-xs text-gray-500">рецептов</div>
                            </div>
                            <div className="text-center">
                                <div className="text-xl font-bold text-gray-800">{profile.comments_count || 0}</div>
                                <div className="text-xs text-gray-500">комментариев</div>
                            </div>
                            <div className="text-center">
                                <div className="text-xl font-bold text-gray-800">{profile.likes_received || 0}</div>
                                <div className="text-xs text-gray-500">лайков</div>
                            </div>
                        </div>

                        {!editing ? (
                            <div className="space-y-2 text-gray-600">
                                {profile.bio && <p>📝 {profile.bio}</p>}
                                {profile.city && <p>📍 {profile.city}</p>}
                                {profile.website && (
                                    <p>
                                        🌐 <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">
                                            {profile.website}
                                        </a>
                                    </p>
                                )}
                                {!profile.bio && !profile.city && !profile.website && (
                                    <p className="text-gray-400 italic">Ничего не заполнено</p>
                                )}
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                                {error && <div className="text-red-600 text-sm">{error}</div>}
                                {success && <div className="text-green-600 text-sm">{success}</div>}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Имя пользователя</label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">О себе</label>
                                    <textarea
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleChange}
                                        rows="3"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="Расскажите о себе..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Город</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="Ваш город"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Сайт</label>
                                    <input
                                        type="url"
                                        name="website"
                                        value={formData.website}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="https://..."
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    Сохранить изменения
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
                    <Link to="/my-recipes" className="px-4 py-2 text-gray-600 hover:text-green-600 hover:bg-gray-50 rounded-lg transition-colors">
                        📝 Мои рецепты
                    </Link>
                    <Link to="/favorites" className="px-4 py-2 text-gray-600 hover:text-green-600 hover:bg-gray-50 rounded-lg transition-colors">
                        ⭐ Избранное
                    </Link>
                    <Link to="/settings" className="px-4 py-2 text-gray-600 hover:text-green-600 hover:bg-gray-50 rounded-lg transition-colors">
                        ⚙️ Настройки
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;