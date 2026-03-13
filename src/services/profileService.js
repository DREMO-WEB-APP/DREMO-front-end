import api from './api';

const profileService = {
    // Get profile based on role
    getProfileByRole: async (accountId, role) => {
        if (role === 'STUDENT') {
            const response = await api.get(`/api/v1/profiles/students/by-account/${accountId}`);
            return response.data;
        } else if (role === 'TEACHER') {
            const response = await api.get(`/api/v1/teacher-profile/by-account/${accountId}`);
            return response.data;
        } else if (role === 'ADMIN') {
            // Admins may use a different endpoint; fallback to basic user info
            try {
                const response = await api.get(`/api/v1/teacher-profile/by-account/${accountId}`);
                return response.data;
            } catch {
                return null;
            }
        }
        return null;
    }
};

export default profileService;
