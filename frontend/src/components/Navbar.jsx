import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

function Navbar() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [addDropdownOpen, setAddDropdownOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [username, setUsername] = useState('');
    const [avatarUrl, setAvatarUrl] = useState(null);

    const addDropdownRef = useRef(null);

    const updateAuthState = () => {
        const token = localStorage.getItem('access_token');
        const savedUsername = localStorage.getItem('username');
        const savedAvatar = localStorage.getItem('avatar_url');

        setIsAuthenticated(!!token);
        setUsername(savedUsername || '');
        setAvatarUrl(savedAvatar || null);
    };

    useEffect(() => {
        updateAuthState();

        const token = localStorage.getItem('access_token');
        if (token && !localStorage.getItem('username')) {
            loadUserData();
        }
    }, []);

    useEffect(() => {
        const handleStorageChange = () => {
            updateAuthState();
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    useEffect(() => {
        const handleAuthChange = () => {
            updateAuthState();
            setAddDropdownOpen(false);
        };
        window.addEventListener('authChange', handleAuthChange);
        return () => window.removeEventListener('authChange', handleAuthChange);
    }, []);

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
        const handleClickOutside = (event) => {
            if (addDropdownRef.current && !addDropdownRef.current.contains(event.target)) {
                setAddDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    const handleAddDropdownToggle = () => {
        setAddDropdownOpen(!addDropdownOpen);
    };

    const getInitials = () => {
        return username ? username[0].toUpperCase() : '?';
    };

    const getAvatarDisplay = () => {
        if (avatarUrl && avatarUrl.startsWith('emoji:')) {
            const parts = avatarUrl.split(':');
            const emoji = parts[1];
            const bg = parts[2] || 'bg-primary-100';
            const textColor = parts[3] || 'text-primary-600';
            return (
                <div className={`w-8 h-8 rounded-full ${bg} ${textColor} flex items-center justify-center text-sm`}>
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
            <div className="w-8 h-8 bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center font-bold">
                {getInitials()}
            </div>
        );
    };

    return (
        <nav className="bg-primary-600 dark:bg-gray-800 shadow-lg sticky top-0 z-50">
            <div className="container mx-auto px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Link to="/" className="text-white text-2xl font-bold flex items-center gap-2">
                        <span className="bg-white dark:bg-primary-500 text-primary-600 dark:text-white rounded-full w-8 h-8 flex items-center justify-center">🍲</span>
                        Recartly
                    </Link>

                    <form onSubmit={handleSearch} className="flex-1 max-w-md">
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Поиск рецептов..."
                                className="w-full px-4 py-2 pr-10 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                🔍
                            </button>
                        </div>
                    </form>

                    <div className="flex items-center space-x-3">
                        <ThemeToggle />

                        {isAuthenticated ? (
                            <>
                                <div className="relative" ref={addDropdownRef}>
                                    <button
                                        onClick={handleAddDropdownToggle}
                                        className="text-white hover:text-gray-200 transition-colors flex items-center gap-1"
                                    >
                                        Добавить
                                        <span className="text-xs">▼</span>
                                    </button>
                                    {addDropdownOpen && (
                                        <div className="absolute right-0 mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-lg py-2 min-w-44 z-50 border border-gray-100 dark:border-gray-700">
                                            <Link
                                                to="/create"
                                                className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                onClick={() => setAddDropdownOpen(false)}
                                            >
                                                📝 Рецепт
                                            </Link>
                                            <Link
                                                to="/create-cart"
                                                className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                onClick={() => setAddDropdownOpen(false)}
                                            >
                                                🛒 Корзина
                                            </Link>
                                            <Link
                                                to="/create-review"
                                                className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                onClick={() => setAddDropdownOpen(false)}
                                            >
                                                ⭐ Отзыв
                                            </Link>
                                        </div>
                                    )}
                                </div>

                                <Link
                                    to="/profile"
                                    className="flex items-center gap-2 text-white hover:text-gray-200 transition-colors"
                                >
                                    {getAvatarDisplay()}
                                    <span className="hidden sm:inline">{username}</span>
                                </Link>
                            </>
                        ) : (
                            <Link to="/login" className="text-white hover:text-gray-200 transition-colors">
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