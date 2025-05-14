import axios from 'axios';

// Use the correct backend URL 
const instance = axios.create({
    baseURL: 'https://task-management-application-five-beta.vercel.app/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    },
    // Add timeout to prevent long-hanging requests
    timeout: 10000
});

// Debug interceptor to log all requests
instance.interceptors.request.use(
    config => {
        console.log('Request URL:', config.baseURL + config.url);

        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('Token attached to request');
        } else {
            console.log('No token found in localStorage');
        }
        return config;
    },
    error => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor with better error logging
instance.interceptors.response.use(
    response => {
        console.log('Response received:', response.status);
        return response;
    },
    error => {
        if (error.response) {
            // Server responded with error status
            console.error('Response error:', {
                status: error.response.status,
                data: error.response.data,
                headers: error.response.headers
            });

            if (error.response.status === 401) {
                console.log('Unauthorized - clearing token');
                localStorage.removeItem('token');
                // You might want to redirect to login page here
            }
        } else if (error.request) {
            // Request was made but no response
            console.error('Network error - no response received');
            console.error(error.request);
        } else {
            // Error in request setup
            console.error('Request setup error:', error.message);
        }
        return Promise.reject(error);
    }
);

export default instance;