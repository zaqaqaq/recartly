import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateRecipe from './pages/CreateRecipe';
import RecipePage from './pages/RecipePage';
import SearchPage from './pages/SearchPage';

function App() {
    const isAuthenticated = !!localStorage.getItem('access_token');

    return (
        <Router>
            <div className="min-h-screen bg-gray-100">
                <Navbar />
                <div className="container mx-auto px-4 py-8">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route
                            path="/create"
                            element={isAuthenticated ? <CreateRecipe /> : <Navigate to="/login" />}
                        />
                        <Route path="/recipe/:id" element={<RecipePage />} />
                        <Route path="/search" element={<SearchPage />} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
}

export default App;