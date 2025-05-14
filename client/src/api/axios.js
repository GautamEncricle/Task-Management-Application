import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://task-management-application-mocha.vercel.app/api',
    withCredentials: true, //make browser to access the cookie
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