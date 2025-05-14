import axios from 'axios';

const instance = axios.create({
    baseURL: 'https://task-management-application-five-beta.vercel.app/api',
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

// Add response interceptor to handle common errors
instance.interceptors.response.use(
    response => response,
    error => {
        if (error.response) {
            // Log the error for debugging
            console.error('API Error:', error.response.status, error.response.data);

            // Handle unauthorized errors (token expired)
            if (error.response.status === 401) {
                localStorage.removeItem('token');
                // You might want to redirect to login page here
            }
        } else if (error.request) {
            // Request was made but no response was received
            console.error('Network Error:', error.request);
        } else {
            // Something else happened while setting up the request
            console.error('Error:', error.message);
        }
        return Promise.reject(error);
    }
);

export default instance;