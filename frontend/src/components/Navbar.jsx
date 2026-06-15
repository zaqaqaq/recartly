import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [addDropdownOpen, setAddDropdownOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [username, setUsername] = useState('');
    const [avatarUrl, setAvatarUrl] = useState(null);

    const addDropdownRef = useRef(null);
    const userMenuRef = useRef(null);

    const loadUserData = async () => {
        const token = localStorage.getItem('access_token');
        if (token) {
            try {
                const response = await fetch('http://localhost:8000/profile/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setUsername(data.username);
                    setAvatarUrl(data.avatar_url);
                    localStorage.setItem('username', data.username);
                    if (data.avatar_url) {
                        localStorage.setItem('avatar_url', data.avatar_url);
                    } else {
                        localStorage.removeItem('avatar_url');
                    }
                } else if (response.status === 401) {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('username');
                    localStorage.removeItem('avatar_url');
                    setIsAuthenticated(false);
                }
            } catch (err) {
                console.error('Failed to load user data:', err);
            }
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        const savedUsername = localStorage.getItem('username');
        const savedAvatar = localStorage.getItem('avatar_url');

        setIsAuthenticated(!!token);

        if (savedUsername) {
            setUsername(savedUsername);
        }
        if (savedAvatar) {
            setAvatarUrl(savedAvatar);
        }

        if (token && (!savedUsername || !savedAvatar)) {
            loadUserData();
        }
    }, []);

    useEffect(() => {
        const handleStorageChange = () => {
            const token = localStorage.getItem('access_token');
            const savedUsername = localStorage.getItem('username');
            const savedAvatar = localStorage.getItem('avatar_url');

            setIsAuthenticated(!!token);
            setUsername(savedUsername || '');
            setAvatarUrl(savedAvatar || null);
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (addDropdownRef.current && !addDropdownRef.current.contains(event.target)) {
                setAddDropdownOpen(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('username');
        localStorage.removeItem('avatar_url');
        setIsAuthenticated(false);
        setUsername('');
        setAvatarUrl(null);
        navigate('/login');
        window.dispatchEvent(new Event('storage'));
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    const handleAddDropdownToggle = () => {
        setAddDropdownOpen(!addDropdownOpen);
        if (userMenuOpen) setUserMenuOpen(false);
    };

    const handleUserMenuToggle = () => {
        setUserMenuOpen(!userMenuOpen);
        if (addDropdownOpen) setAddDropdownOpen(false);
    };

    const getInitials = () => {
        return username ? username[0].toUpperCase() : '?';
    };

    const getAvatarDisplay = () => {
        if (avatarUrl && avatarUrl.startsWith('emoji:')) {
            const parts = avatarUrl.split(':');
            const emoji = parts[1];
            const bg = parts[2] || 'bg-green-100';
            const textColor = parts[3] || 'text-green-600';
            return (
                <div className={`w-8 h-8 rounded-full ${bg} flex items-center justify-center text-sm ${textColor}`}>
                    {emoji}
                </div>
            );
        } else if (avatarUrl) {
            return (
                <img
                    src={`http://localhost:8000${avatarUrl}`}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full object-cover"
                />
            );
        }
        return (
            <div className="w-8 h-8 bg-white text-green-600 rounded-full flex items-center justify-center font-bold">
                {getInitials()}
            </div>
        );
    };

    return (
        <nav className="bg-green-600 shadow-lg sticky top-0 z-50">
            <div className="container mx-auto px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Link to="/" className="text-white text-2xl font-bold flex items-center gap-2">
                        <span className="bg-white text-green-600 rounded-full w-8 h-8 flex items-center justify-center">🍲</span>
                        Recartly
                    </Link>

                    <form onSubmit={handleSearch} className="flex-1 max-w-md">
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Поиск рецептов..."
                                className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                🔍
                            </button>
                        </div>
                    </form>

                    <div className="flex items-center space-x-4">
                        {isAuthenticated ? (
                            <>
                                <div className="relative" ref={addDropdownRef}>
                                    <button
                                        onClick={handleAddDropdownToggle}
                                        className="text-white hover:text-green-200 transition-colors flex items-center gap-1"
                                    >
                                        Добавить
                                        <span className="text-xs">▼</span>
                                    </button>
                                    {addDropdownOpen && (
                                        <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-lg py-2 min-w-40 z-50">
                                            <Link
                                                to="/create"
                                                className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                                                onClick={() => setAddDropdownOpen(false)}
                                            >
                                                📝 Рецепт
                                            </Link>
                                            <Link
                                                to="/create-cart"
                                                className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                                                onClick={() => setAddDropdownOpen(false)}
                                            >
                                                🛒 Корзина
                                            </Link>
                                            <button
                                                className="block w-full text-left px-4 py-2 text-gray-400 bg-gray-50 cursor-not-allowed"
                                                disabled
                                            >
                                                ⭐ Отзыв (скоро)
                                            </button>
                                            <button
                                                className="block w-full text-left px-4 py-2 text-gray-400 bg-gray-50 cursor-not-allowed"
                                                disabled
                                            >
                                                🏷️ Скидка (скоро)
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="relative" ref={userMenuRef}>
                                    <button
                                        onClick={handleUserMenuToggle}
                                        className="flex items-center gap-2 text-white hover:text-green-200 transition-colors"
                                    >
                                        {getAvatarDisplay()}
                                        <span>{username}</span>
                                        <span className="text-xs">▼</span>
                                    </button>
                                    {userMenuOpen && (
                                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-50">
                                            <Link
                                                to="/profile"
                                                className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                                                onClick={() => setUserMenuOpen(false)}
                                            >
                                                👤 Мой профиль
                                            </Link>
                                            <Link
                                                to="/my-recipes"
                                                className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                                                onClick={() => setUserMenuOpen(false)}
                                            >
                                                📝 Мои рецепты
                                            </Link>
                                            <Link
                                                to="/my-carts"
                                                className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                                                onClick={() => setUserMenuOpen(false)}
                                            >
                                                🛒 Мои корзины
                                            </Link>
                                            <Link
                                                to="/favorites"
                                                className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                                                onClick={() => setUserMenuOpen(false)}
                                            >
                                                ⭐ Избранное
                                            </Link>
                                            <Link
                                                to="/settings"
                                                className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                                                onClick={() => setUserMenuOpen(false)}
                                            >
                                                ⚙️ Настройки
                                            </Link>
                                            <hr className="my-1" />
                                            <button
                                                onClick={handleLogout}
                                                className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                                            >
                                                🚪 Выйти
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <Link to="/login" className="text-white hover:text-green-200 transition-colors">
                                Войти
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;