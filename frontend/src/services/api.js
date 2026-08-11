const API_URL = 'http://localhost:8000';

async function request(endpoint, method = 'GET', body = null, requiresAuth = false, isFormData = false) {
    const headers = {};

    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }

    if (requiresAuth) {
        const token = localStorage.getItem('access_token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }

    const options = {
        method,
        headers,
    };

    if (body) {
        if (isFormData) {
            options.body = body;
        } else {
            options.body = JSON.stringify(body);
        }
    }

    const response = await fetch(`${API_URL}${endpoint}`, options);

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || `HTTP ${response.status}`);
    }

    if (response.status === 204) {
        return null;
    }

    return await response.json();
}

// ========== АВТОРИЗАЦИЯ ==========
export const register = (email, username, password) =>
    request('/auth/register', 'POST', { email, username, password });

export const login = async (email, password) => {
    const data = await request('/auth/login', 'POST', { email, password });
    if (data.access_token) {
        localStorage.setItem('access_token', data.access_token);
        try {
            const userData = await getMyProfile();
            localStorage.setItem('username', userData.username);
            if (userData.avatar_url) {
                localStorage.setItem('avatar_url', userData.avatar_url);
            }
        } catch (e) {
            console.error('Failed to get user data', e);
        }
    }
    return data;
};

export const getCurrentUser = () =>
    request('/auth/me', 'GET', null, true);

// ========== РЕЦЕПТЫ ==========
export const getRecipes = (skip = 0, limit = 20) =>
    request(`/recipes?skip=${skip}&limit=${limit}`, 'GET');

export const searchRecipes = (q = '', minPrice = null, maxPrice = null, skip = 0, limit = 20) => {
    let url = `/recipes/search?q=${encodeURIComponent(q)}&skip=${skip}&limit=${limit}`;
    if (minPrice !== null) url += `&min_price=${minPrice}`;
    if (maxPrice !== null) url += `&max_price=${maxPrice}`;
    return request(url, 'GET');
};

export const getRecipe = (id) =>
    request(`/recipes/${id}`, 'GET');

export const createRecipe = (recipeData) =>
    request('/recipes/', 'POST', recipeData, true);

export const deleteRecipe = (id) =>
    request(`/recipes/${id}`, 'DELETE', null, true);

export const uploadPhoto = (formData) =>
    request('/recipes/upload-photo', 'POST', formData, true, true);

export const getMyRecipes = () =>
    request('/recipes/my', 'GET', null, true);

// ========== ИЗБРАННОЕ ==========
export const addFavorite = (recipeId) =>
    request(`/favorites/${recipeId}`, 'POST', null, true);

export const removeFavorite = (recipeId) =>
    request(`/favorites/${recipeId}`, 'DELETE', null, true);

export const getFavorites = () =>
    request('/favorites/', 'GET', null, true);

// ========== КОММЕНТАРИИ К РЕЦЕПТАМ ==========
export const getComments = (recipeId, skip = 0, limit = 50) =>
    request(`/comments/${recipeId}?skip=${skip}&limit=${limit}`, 'GET');

export const createComment = (recipeId, text) =>
    request(`/comments/${recipeId}`, 'POST', { text }, true);

export const deleteComment = (commentId) =>
    request(`/comments/${commentId}`, 'DELETE', null, true);

export const getLatestComments = (limit = 10) =>
    request(`/comments/latest?limit=${limit}`, 'GET');

// ========== ПРОФИЛЬ ==========
export const getMyProfile = () =>
    request('/profile/me', 'GET', null, true);

export const updateProfile = (data) =>
    request('/profile/me', 'PUT', data, true);

export const getUserProfile = (userId) =>
    request(`/profile/${userId}`, 'GET');

export const uploadAvatar = (formData) =>
    request('/profile/upload-avatar', 'POST', formData, true, true);

// ========== НАСТРОЙКИ ==========
export const updatePassword = (data) =>
    request('/profile/change-password', 'POST', data, true);

// ========== КОРЗИНЫ ==========
export const getCarts = (skip = 0, limit = 20) =>
    request(`/carts?skip=${skip}&limit=${limit}`, 'GET');

export const getMyCarts = () =>
    request('/carts/my', 'GET', null, true);

export const getCart = (id) =>
    request(`/carts/${id}`, 'GET');

export const createCart = (cartData) =>
    request('/carts/', 'POST', cartData, true);

export const deleteCart = (id) =>
    request(`/carts/${id}`, 'DELETE', null, true);

export const likeCart = (cartId) =>
    request(`/carts/${cartId}/like`, 'POST', null, true);

export const unlikeCart = (cartId) =>
    request(`/carts/${cartId}/like`, 'DELETE', null, true);

export const getCartComments = (cartId, skip = 0, limit = 50) =>
    request(`/carts/${cartId}/comments?skip=${skip}&limit=${limit}`, 'GET');

export const createCartComment = (cartId, text) =>
    request(`/carts/${cartId}/comments`, 'POST', { text }, true);

export const deleteCartComment = (cartId, commentId) =>
    request(`/carts/${cartId}/comments/${commentId}`, 'DELETE', null, true);

// ========== ОТЗЫВЫ ==========
export const getReviews = (skip = 0, limit = 20, targetType = null) => {
    let url = `/reviews?skip=${skip}&limit=${limit}`;
    if (targetType) url += `&target_type=${targetType}`;
    return request(url, 'GET');
};

export const getReview = (id) =>
    request(`/reviews/${id}`, 'GET');

export const createReview = (reviewData) =>
    request('/reviews/', 'POST', reviewData, true);

export const deleteReview = (id) =>
    request(`/reviews/${id}`, 'DELETE', null, true);

export const likeReview = (reviewId) =>
    request(`/reviews/${reviewId}/like`, 'POST', null, true);

export const unlikeReview = (reviewId) =>
    request(`/reviews/${reviewId}/like`, 'DELETE', null, true);

export const getReviewComments = (reviewId, skip = 0, limit = 50) =>
    request(`/reviews/${reviewId}/comments?skip=${skip}&limit=${limit}`, 'GET');

export const createReviewComment = (reviewId, text) =>
    request(`/reviews/${reviewId}/comments`, 'POST', { text }, true);

export const deleteReviewComment = (reviewId, commentId) =>
    request(`/reviews/${reviewId}/comments/${commentId}`, 'DELETE', null, true);

// ========== ДОСТИЖЕНИЯ ==========
export const getMyAchievements = () =>
    request('/profile/me/achievements', 'GET', null, true);

export default { request };