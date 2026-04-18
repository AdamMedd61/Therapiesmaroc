import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api', // Laravel standard dev URL
    withCredentials: true, // Necessary for Sanctum CSRF cookies if tracking sessions
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
});

// Interceptor to attach token automatically
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;
