import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const isAuthenticated = !!localStorage.getItem('access_token');

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        navigate('/login');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    // Закрытие дропдауна при клике вне
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setDropdownOpen(!dropdownOpen)}
                                        className="text-white hover:text-green-200 transition-colors flex items-center gap-1"
                                    >
                                        Добавить
                                        <span className="text-xs">▼</span>
                                    </button>
                                    {dropdownOpen && (
                                        <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-lg py-2 min-w-40 z-50">
                                            <Link
                                                to="/create"
                                                className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                                                onClick={() => setDropdownOpen(false)}
                                            >
                                                📝 Рецепт
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
                                <button onClick={handleLogout} className="text-white hover:text-green-200 transition-colors">
                                    Выйти
                                </button>
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