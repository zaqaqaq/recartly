import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateRecipe from './pages/CreateRecipe';
import RecipePage from './pages/RecipePage';
import SearchPage from './pages/SearchPage';
import ProfilePage from './pages/ProfilePage';
import MyRecipes from './pages/MyRecipes';
import Favorites from './pages/Favorites';
import SettingsPage from './pages/SettingsPage';
import CartsPage from './pages/CartsPage';
import CreateCart from './pages/CreateCart';
import CartPage from './pages/CartPage';
import MyCarts from './pages/MyCarts';
import CreateReview from './pages/CreateReview';
import ReviewPage from './pages/ReviewPage';

function App() {
    const isAuthenticated = !!localStorage.getItem('access_token');

    return (
        <Router>
            <div className="min-h-screen bg-gray-100 flex flex-col">
                <Navbar />
                <div className="flex-1 container mx-auto px-4 py-8">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/search" element={<SearchPage />} />
                        <Route
                            path="/create"
                            element={isAuthenticated ? <CreateRecipe /> : <Navigate to="/login" />}
                        />
                        <Route path="/recipe/:id" element={<RecipePage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/my-recipes" element={<MyRecipes />} />
                        <Route path="/favorites" element={<Favorites />} />
                        <Route path="/settings" element={<SettingsPage />} />
                        <Route path="/carts" element={<CartsPage />} />
                        <Route path="/create-cart" element={isAuthenticated ? <CreateCart /> : <Navigate to="/login" />} />
                        <Route path="/cart/:id" element={<CartPage />} />
                        <Route path="/my-carts" element={<MyCarts />} />
                        <Route path="/create-review" element={isAuthenticated ? <CreateReview /> : <Navigate to="/login" />} />
                        <Route path="/review/:id" element={<ReviewPage />} />
                    </Routes>
                </div>
                <Footer />
            </div>
        </Router>
    );
}

export default App;