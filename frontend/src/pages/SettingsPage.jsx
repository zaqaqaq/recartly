import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyProfile, updatePassword } from '../services/api';

function SettingsPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);

    // Смена пароля
    const [passwordData, setPasswordData] = useState({
        old_password: '',
        new_password: '',
        confirm_password: ''
    });
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const data = await getMyProfile();
            setProfile(data);
        } catch (err) {
            console.error('Ошибка загрузки профиля:', err);
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = (e) => {
        setPasswordData({
            ...passwordData,
            [e.target.name]: e.target.value
        });
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');

        if (passwordData.new_password !== passwordData.confirm_password) {
            setPasswordError('Пароли не совпадают');
            return;
        }

        if (passwordData.new_password.length < 6) {
            setPasswordError('Новый пароль должен содержать минимум 6 символов');
            return;
        }

        setPasswordLoading(true);

        try {
            await updatePassword({
                old_password: passwordData.old_password,
                new_password: passwordData.new_password
            });
            setPasswordSuccess('Пароль успешно изменён!');
            setPasswordData({
                old_password: '',
                new_password: '',
                confirm_password: ''
            });
            setTimeout(() => setPasswordSuccess(''), 3000);
        } catch (err) {
            setPasswordError(err.response?.data?.detail || 'Ошибка смены пароля');
        } finally {
            setPasswordLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="text-center py-10">
                <p className="text-gray-600 dark:text-gray-400">Загрузка...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="mb-6">
                    <h1 className="heading-2 border-l-4 border-primary-500 pl-4">
                        ⚙️ Настройки
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 ml-4">Управление аккаунтом и безопасностью</p>
                </div>

                {/* Смена пароля */}
                <div className="card p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        🔑 Смена пароля
                    </h2>

                    {passwordError && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm mb-4">
                            {passwordError}
                        </div>
                    )}
                    {passwordSuccess && (
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-4 py-3 rounded-xl text-sm mb-4">
                            {passwordSuccess}
                        </div>
                    )}

                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Текущий пароль
                            </label>
                            <input
                                type="password"
                                name="old_password"
                                value={passwordData.old_password}
                                onChange={handlePasswordChange}
                                className="input"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Новый пароль
                            </label>
                            <input
                                type="password"
                                name="new_password"
                                value={passwordData.new_password}
                                onChange={handlePasswordChange}
                                className="input"
                                required
                                minLength="6"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Подтверждение нового пароля
                            </label>
                            <input
                                type="password"
                                name="confirm_password"
                                value={passwordData.confirm_password}
                                onChange={handlePasswordChange}
                                className="input"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={passwordLoading}
                            className="btn-primary"
                        >
                            {passwordLoading ? 'Сохранение...' : 'Сменить пароль'}
                        </button>
                    </form>
                </div>

                {/* Уведомления (заглушка) */}
                <div className="card p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        🔔 Уведомления
                    </h2>
                    <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4 text-center text-gray-500 dark:text-gray-400">
                        <p className="text-sm">🚧 Раздел в разработке</p>
                        <p className="text-xs mt-1">Скоро здесь будут настройки уведомлений</p>
                    </div>
                </div>

                {/* О сайте */}
                <div className="card p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        ℹ️ О сайте
                    </h2>
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                        <p><span className="font-medium">Название:</span> Recartly</p>
                        <p><span className="font-medium">Версия:</span> 1.0.0</p>
                        <p><span className="font-medium">Описание:</span> Платформа для обмена рецептами, продуктовыми корзинами и отзывами</p>
                        <p><span className="font-medium">Контакты:</span> support@recartly.ru</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                            © 2026 Recartly. Все права защищены.
                        </p>
                    </div>
                </div>

                {/* Назад */}
                <div className="mt-6">
                    <button
                        onClick={() => navigate('/profile')}
                        className="btn-secondary"
                    >
                        ← Назад в профиль
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SettingsPage;