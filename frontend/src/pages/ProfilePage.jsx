import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMyProfile, updateProfile, getMyRecipes, getMyCarts, getFavorites, uploadAvatar } from '../services/api';

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

function AvatarDisplay({ avatarUrl, username, size = "w-24 h-24 text-4xl" }) {
    const getInitials = () => {
        return username ? username[0].toUpperCase() : '?';
    };

    if (avatarUrl && avatarUrl.startsWith('emoji:')) {
        const parts = avatarUrl.split(':');
        const emoji = parts[1];
        const bg = parts[2] || 'bg-primary-100';
        const textColor = parts[3] || 'text-primary-600';
        return (
            <div className={`${size} rounded-full ${bg} ${textColor} flex items-center justify-center shadow-lg border-4 border-white dark:border-gray-800`}>
                <span className="text-4xl">{emoji}</span>
            </div>
        );
    } else if (avatarUrl) {
        return (
            <img
                src={`http://localhost:8000${avatarUrl}`}
                alt={username}
                className={`${size} rounded-full object-cover shadow-lg border-4 border-white dark:border-gray-800`}
            />
        );
    }
    return (
        <div className={`${size} rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold shadow-lg border-4 border-white dark:border-gray-800`}>
            {getInitials()}
        </div>
    );
}

function ProfilePage() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('recipes');
    const [myRecipes, setMyRecipes] = useState([]);
    const [myCarts, setMyCarts] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [uploading, setUploading] = useState(false);
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
        loadMyRecipes();
        loadMyCarts();
        loadFavorites();
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
            if (data.avatar_url) {
                localStorage.setItem('avatar_url', data.avatar_url);
            } else {
                localStorage.removeItem('avatar_url');
            }
            window.dispatchEvent(new Event('storage'));
        } catch (err) {
            console.error('Ошибка загрузки профиля:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadMyRecipes = async () => {
        try {
            const data = await getMyRecipes();
            setMyRecipes(data || []);
        } catch (err) {
            console.error('Ошибка загрузки рецептов:', err);
        }
    };

    const loadMyCarts = async () => {
        try {
            const data = await getMyCarts();
            setMyCarts(data || []);
        } catch (err) {
            console.error('Ошибка загрузки корзин:', err);
        }
    };

    const loadFavorites = async () => {
        try {
            const data = await getFavorites();
            setFavorites(data || []);
        } catch (err) {
            console.error('Ошибка загрузки избранного:', err);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
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
            loadProfile();
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
            loadProfile();
        } catch (err) {
            setError('Ошибка загрузки фото');
        } finally {
            setUploading(false);
        }
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
            setSuccess('Профиль успешно обновлён!');
            setEditing(false);
            setTimeout(() => setSuccess(''), 3000);
            window.dispatchEvent(new Event('storage'));
        } catch (err) {
            setError('Ошибка обновления профиля');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('username');
        localStorage.removeItem('avatar_url');
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new Event('authChange'));
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="text-center py-10">
                <p className="text-gray-600 dark:text-gray-400">Загрузка профиля...</p>
            </div>
        );
    }

    if (!profile) return null;

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

    const renderTabContent = () => {
        switch (activeTab) {
            case 'recipes':
                return (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Мои рецепты ({myRecipes.length})</h3>
                        {myRecipes.length === 0 ? (
                            <p className="text-gray-500 dark:text-gray-400">У вас пока нет рецептов</p>
                        ) : (
                            myRecipes.map((recipe) => (
                                <div key={recipe.id} className="card p-4 flex gap-4">
                                    {recipe.photo_url && (
                                        <div className="w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700">
                                            <img
                                                src={`http://localhost:8000${recipe.photo_url}`}
                                                alt={recipe.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <Link to={`/recipe/${recipe.id}`} className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
                                            {recipe.title}
                                        </Link>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 line-clamp-2">{recipe.description || 'Без описания'}</p>
                                        <div className="flex gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                                            <span>❤️ {recipe.favorites_count || 0}</span>
                                            <span>💬 {recipe.comments_count || 0}</span>
                                            <span className="text-primary-600">{recipe.total_price} ₽</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                );
            case 'carts':
                return (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Мои корзины ({myCarts.length})</h3>
                        {myCarts.length === 0 ? (
                            <p className="text-gray-500 dark:text-gray-400">У вас пока нет корзин</p>
                        ) : (
                            myCarts.map((cart) => (
                                <div key={cart.id} className="card p-4">
                                    <Link to={`/cart/${cart.id}`} className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
                                        {cart.title}
                                    </Link>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{cart.description || 'Без описания'}</p>
                                    <div className="flex gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                                        <span>❤️ {cart.likes_count || 0}</span>
                                        <span>💬 {cart.comments_count || 0}</span>
                                        <span className="text-primary-600">{cart.total_price} ₽</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                );
            case 'favorites':
                return (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Избранное ({favorites.length})</h3>
                        {favorites.length === 0 ? (
                            <p className="text-gray-500 dark:text-gray-400">У вас пока нет избранных рецептов</p>
                        ) : (
                            favorites.map((recipe) => (
                                <div key={recipe.id} className="card p-4 flex gap-4">
                                    {recipe.photo_url && (
                                        <div className="w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700">
                                            <img
                                                src={`http://localhost:8000${recipe.photo_url}`}
                                                alt={recipe.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <Link to={`/recipe/${recipe.id}`} className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
                                            {recipe.title}
                                        </Link>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 line-clamp-2">{recipe.description || 'Без описания'}</p>
                                        <div className="flex gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                                            <span>❤️ {recipe.favorites_count || 0}</span>
                                            <span>💬 {recipe.comments_count || 0}</span>
                                            <span className="text-primary-600">{recipe.total_price} ₽</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                );
            case 'settings':
                return (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">⚙️ Настройки</h3>
                        <div className="card p-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">Управление аккаунтом</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Смена пароля, информация о сайте</p>
                                    </div>
                                    <Link
                                        to="/settings"
                                        className="btn-primary text-sm"
                                    >
                                        Перейти
                                    </Link>
                                </div>
                                <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
                                    Настройки откроются в отдельной странице
                                </p>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Шапка профиля */}
                <div className="card overflow-hidden p-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                        <AvatarDisplay
                            avatarUrl={profile.avatar_url}
                            username={profile.username}
                            size="w-24 h-24 text-4xl"
                        />
                        <div className="flex-1">
                            <h1 className="heading-2">{profile.username}</h1>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">@{profile.username}</p>
                            <p className="text-gray-400 dark:text-gray-500 text-xs">
                                Регистрация: {new Date(profile.created_at).toLocaleDateString('ru-RU')}
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                            {!editing && (
                                <button
                                    onClick={() => {
                                        setEditing(true);
                                        setError('');
                                        setSuccess('');
                                    }}
                                    className="btn-secondary"
                                >
                                    ✏️ Редактировать
                                </button>
                            )}
                            <button
                                onClick={handleLogout}
                                className="btn-danger"
                            >
                                🚪 Выйти
                            </button>
                        </div>
                    </div>

                    {/* Статистика */}
                    <div className="flex gap-8 py-4 mt-4 border-t border-gray-100 dark:border-gray-700">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">{profile.recipes_count || 0}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">рецептов</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">{profile.comments_count || 0}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">комментариев</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">{profile.likes_received || 0}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">лайков</div>
                        </div>
                    </div>

                    {/* Информация о пользователе */}
                    {!editing && (
                        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl space-y-2 text-gray-600 dark:text-gray-300">
                            <div className="flex items-start gap-2">
                                <span className="text-lg">📝</span>
                                <span>{profile.bio || <span className="text-gray-400 dark:text-gray-500 italic">О себе не указано</span>}</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="text-lg">📍</span>
                                <span>{profile.city || <span className="text-gray-400 dark:text-gray-500 italic">Город не указан</span>}</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="text-lg">🌐</span>
                                <span>
                                    {profile.website ? (
                                        <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 hover:underline">
                                            {profile.website}
                                        </a>
                                    ) : (
                                        <span className="text-gray-400 dark:text-gray-500 italic">Сайт не указан</span>
                                    )}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Редактирование профиля (с аватаркой) */}
                    {editing && (
                        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Редактирование профиля</h3>

                            {/* Текущая аватарка */}
                            <div className="flex flex-col items-center mb-6">
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Текущая аватарка</h4>
                                {getCurrentAvatarDisplay()}
                            </div>

                            {/* Выбор аватарки */}
                            <div className="mb-6">
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Выбрать иконку</h4>
                                <div className="grid grid-cols-6 gap-2">
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

                            {/* Загрузка фото */}
                            <div className="mb-6">
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Загрузить своё фото</h4>
                                <div className="flex items-center gap-4">
                                    <label className="cursor-pointer bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-xl transition-colors">
                                        {uploading ? 'Загрузка...' : '📷 Выбрать фото'}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileUpload}
                                            disabled={uploading}
                                            className="hidden"
                                        />
                                    </label>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">JPG, PNG до 2MB</p>
                                </div>
                            </div>

                            {/* Форма редактирования */}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {error && <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm">{error}</div>}
                                {success && <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-4 py-3 rounded-xl text-sm">{success}</div>}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Имя пользователя</label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        className="input"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">О себе</label>
                                    <textarea
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleChange}
                                        rows="3"
                                        className="input"
                                        placeholder="Расскажите о себе..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Город</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        className="input"
                                        placeholder="Ваш город"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Сайт</label>
                                    <input
                                        type="url"
                                        name="website"
                                        value={formData.website}
                                        onChange={handleChange}
                                        className="input"
                                        placeholder="https://..."
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button type="submit" className="btn-primary">
                                        Сохранить изменения
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditing(false);
                                            setError('');
                                            setSuccess('');
                                            setFormData({
                                                username: profile.username || '',
                                                bio: profile.bio || '',
                                                city: profile.city || '',
                                                website: profile.website || ''
                                            });
                                        }}
                                        className="btn-secondary"
                                    >
                                        Отмена
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>

                {/* Вкладки */}
                <div className="flex flex-wrap gap-2 mt-6 border-b border-gray-200 dark:border-gray-700 pb-2">
                    <button
                        onClick={() => setActiveTab('recipes')}
                        className={`px-4 py-2 rounded-xl transition-all ${
                            activeTab === 'recipes'
                                ? 'bg-primary-500 text-white'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                    >
                        📝 Мои рецепты
                    </button>
                    <button
                        onClick={() => setActiveTab('carts')}
                        className={`px-4 py-2 rounded-xl transition-all ${
                            activeTab === 'carts'
                                ? 'bg-primary-500 text-white'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                    >
                        🛒 Мои корзины
                    </button>
                    <button
                        onClick={() => setActiveTab('favorites')}
                        className={`px-4 py-2 rounded-xl transition-all ${
                            activeTab === 'favorites'
                                ? 'bg-primary-500 text-white'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                    >
                        ⭐ Избранное
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('settings');
                            setEditing(false);
                            setError('');
                            setSuccess('');
                            setFormData({
                                username: profile.username || '',
                                bio: profile.bio || '',
                                city: profile.city || '',
                                website: profile.website || ''
                            });
                        }}
                        className={`px-4 py-2 rounded-xl transition-all ${
                            activeTab === 'settings'
                                ? 'bg-primary-500 text-white'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                    >
                        ⚙️ Настройки
                    </button>
                </div>

                {/* Контент вкладок */}
                <div className="mt-6">
                    {renderTabContent()}
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;