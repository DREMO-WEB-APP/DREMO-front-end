import api from './api';

const studentService = {
    getProfileByAccount: async (accountId) => {
        const response = await api.get(`/api/v1/profiles/students/by-account/${accountId}`);
        return response.data;
    },

    getEmailDetails: async (email) => {
        const response = await api.get(`/api/v1/emails?email=${email}`);
        return response.data;
    },

    activateStudent: async (profileId) => {
        const response = await api.patch(`/api/v1/profiles/students/${profileId}/activate`);
        return response.data;
    },

    createEmailRequest: async (studentId) => {
        const response = await api.post(`/api/v1/requests/${studentId}`);
        return response.data;
    },

    getEmailRequestStatus: async (studentId) => {
        const response = await api.get(`/api/v1/requests?studentId=${studentId}`, {
            skipErrorNotification: true
        });
        return response.data;
    },

    getStudentsByInstitute: async (instituteId) => {
        const response = await api.get(`/api/v1/profiles/students/by-institute/${instituteId}`);
        return response.data;
    },

    reviewRequest: async (requestId, adminId, response, comment = '') => {
        const res = await api.post(`/api/v1/requests/${requestId}/review`, {
            adminId,
            response,
            comment,
        });
        return res.data;
    }
};

export default studentService;
