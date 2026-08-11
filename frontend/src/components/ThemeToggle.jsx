import React, { useState, useEffect } from 'react';

function ThemeToggle() {
    const [isDark, setIsDark] = useState(() => {
        const saved = localStorage.getItem('theme');
        if (saved) return saved === 'dark';
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    return (
        <button
            onClick={() => setIsDark(!isDark)}
            className="text-white hover:text-gray-200 transition-colors p-1.5 rounded-full hover:bg-white/10"
            aria-label="Переключить тему"
        >
            {isDark ? '☀️' : '🌙'}
        </button>
    );
}

export default ThemeToggle;