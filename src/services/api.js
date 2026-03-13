import axios from 'axios';

// Note: We need a way to access the showNotification function outside of the React component tree
// or we need to pass it in. For this implementation, we'll export the setup function.

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '',
    withCredentials: true, // Important for cookies
});

export const setupInterceptors = (showNotification) => {
    api.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.config?.skipErrorNotification) {
                return Promise.reject(error);
            }

            let message = 'An unexpected error occurred';

            if (error.response) {
                // Server responded with a status code outside of 2xx
                message = error.response.data?.message || `Error: ${error.response.statusText}`;
            } else if (error.request) {
                // Request was made but no response received
                message = 'Network error: No response from server';
            } else {
                message = error.message;
            }

            showNotification(message, 'error');
            return Promise.reject(error);
        }
    );
};

export default api;