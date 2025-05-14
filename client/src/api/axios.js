import axios from 'axios';

const instance = axios.create({
    baseURL: 'https://task-management-application-five-beta.vercel.app/api', // Must match your actual backend URL
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
})

// Interceptor to attach JWT token to all requests
instance.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
)

export default instance;