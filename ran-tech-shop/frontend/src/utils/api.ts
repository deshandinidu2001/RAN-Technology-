import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage (zustand persist stores it there)
    try {
      const authStorage = localStorage.getItem('ran-auth-storage');
      if (authStorage) {
        const { state } = JSON.parse(authStorage);
        if (state?.token) {
          config.headers.Authorization = `Bearer ${state.token}`;
        }
      }
    } catch (e) {
      // Ignore parse errors
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Unauthorized - clear auth state and redirect to login
          if (typeof window !== 'undefined') {
            // Don't redirect if already on auth pages
            const isAuthPage = window.location.pathname.includes('/login') ||
                               window.location.pathname.includes('/register');
            if (!isAuthPage) {
              // The auth store will handle clearing state
              console.log('Authentication required');
            }
          }
          break;
        case 403:
          console.error('Access forbidden');
          break;
        case 404:
          console.error('Resource not found');
          break;
        case 422:
          console.error('Validation error:', data.errors);
          break;
        case 500:
          console.error('Server error');
          break;
        default:
          console.error('API error:', data.message);
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network error - no response received');
    } else {
      // Error in setting up request
      console.error('Request error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
