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

export const register = (email, username, password) =>
    request('/auth/register', 'POST', { email, username, password });

export const login = async (email, password) => {
    const data = await request('/auth/login', 'POST', { email, password });
    if (data.access_token) {
        localStorage.setItem('access_token', data.access_token);
    }
    return data;
};

export const getCurrentUser = () =>
    request('/auth/me', 'GET', null, true);

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

export const likeRecipe = (recipeId) =>
    request(`/likes/${recipeId}`, 'POST', null, true);

export const unlikeRecipe = (recipeId) =>
    request(`/likes/${recipeId}`, 'DELETE', null, true);

export const getLikesCount = (recipeId) =>
    request(`/likes/${recipeId}/count`, 'GET');

export const userLikedRecipe = (recipeId) =>
    request(`/likes/${recipeId}/user-liked`, 'GET', null, true);

export const getComments = (recipeId, skip = 0, limit = 50) =>
    request(`/comments/${recipeId}?skip=${skip}&limit=${limit}`, 'GET');

export const createComment = (recipeId, text) =>
    request(`/comments/${recipeId}`, 'POST', { text }, true);

export const deleteComment = (commentId) =>
    request(`/comments/${commentId}`, 'DELETE', null, true);

export const getLatestComments = (limit = 10) =>
    request(`/comments/latest?limit=${limit}`, 'GET');

export default { request };