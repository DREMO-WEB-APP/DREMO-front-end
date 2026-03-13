import api from './api';

const authService = {
    login: async (credentials) => {
        const response = await api.post('/api/v1/authentication/sign-in', credentials);
        return response.data;
    },

    register: async (studentData) => {
        // studentData must now include instituteId
        const response = await api.post('/api/v1/profiles/students', studentData);
        return response.data;
    },

    logout: async (accountId) => {
        return await api.post(`/api/v1/authentication/logout/account/${accountId}`);
    },

    getCurrentUser: async () => {
        const response = await api.post('/api/v1/authentication/me');
        return response.data;
    }
};

export default authService;
