import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
    const isAuthenticated = !!localStorage.getItem('access_token');

    return (
        <footer className="bg-gray-800 text-gray-300 mt-12">
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Колонка 1: О проекте */}
                    <div>
                        <h3 className="text-white text-lg font-bold mb-3 flex items-center gap-2">
                            <span className="bg-green-600 rounded-full w-6 h-6 flex items-center justify-center text-sm">🍲</span>
                            Recartly
                        </h3>
                        <p className="text-sm text-gray-400">
                            Платформа для обмена рецептами, продуктовыми корзинами и отзывами.
                            Готовьте с умом, экономьте с нами.
                        </p>
                    </div>

                    {/* Колонка 2: Навигация */}
                    <div>
                        <h3 className="text-white font-semibold mb-3">📌 Навигация</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/" className="hover:text-green-400 transition-colors">Главная</Link></li>
                            <li><Link to="/carts" className="hover:text-green-400 transition-colors">Корзины</Link></li>
                            <li><Link to="/search" className="hover:text-green-400 transition-colors">Поиск</Link></li>
                        </ul>
                    </div>

                    {/* Колонка 3: Аккаунт (только для авторизованных) */}
                    <div>
                        <h3 className="text-white font-semibold mb-3">👤 Аккаунт</h3>
                        {isAuthenticated ? (
                            <ul className="space-y-2 text-sm">
                                <li><Link to="/profile" className="hover:text-green-400 transition-colors">Мой профиль</Link></li>
                                <li><Link to="/my-recipes" className="hover:text-green-400 transition-colors">Мои рецепты</Link></li>
                                <li><Link to="/my-carts" className="hover:text-green-400 transition-colors">Мои корзины</Link></li>
                                <li><Link to="/favorites" className="hover:text-green-400 transition-colors">Избранное</Link></li>
                                <li><Link to="/settings" className="hover:text-green-400 transition-colors">Настройки</Link></li>
                            </ul>
                        ) : (
                            <ul className="space-y-2 text-sm">
                                <li><Link to="/login" className="hover:text-green-400 transition-colors">Войти</Link></li>
                                <li><Link to="/register" className="hover:text-green-400 transition-colors">Регистрация</Link></li>
                            </ul>
                        )}
                    </div>

                    {/* Колонка 4: Соцсети и контакты */}
                    <div>
                        <h3 className="text-white font-semibold mb-3">📱 Мы в соцсетях</h3>
                        <div className="flex gap-3 mb-4">
                            <a href="#" className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors">
                                <span className="text-sm">📱</span>
                            </a>
                            <a href="#" className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors">
                                <span className="text-sm">📘</span>
                            </a>
                            <a href="#" className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors">
                                <span className="text-sm">▶️</span>
                            </a>
                            <a href="#" className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors">
                                <span className="text-sm">💬</span>
                            </a>
                        </div>
                        <p className="text-xs text-gray-500">
                            📧 support@recartly.ru
                        </p>
                    </div>
                </div>

                {/* Копирайт */}
                <div className="border-t border-gray-700 mt-6 pt-6 text-center text-xs text-gray-500">
                    © 2026 Recartly. Все права защищены.
                </div>
            </div>
        </footer>
    );
}

export default Footer;