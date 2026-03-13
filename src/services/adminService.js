import api from './api';

const adminService = {
    // Generates an invitation token for a new teacher
    createTeacherInvitation: async (instituteId) => {
        const response = await api.post('/api/v1/profiles/teacher-profiles/invitations', { instituteId });
        return response.data;
    },

    // Verifies if an invitation token is valid
    verifyTeacherInvitation: async (token) => {
        // According to instructions, this is a GET request with query param ?token=
        const response = await api.get(`/api/v1/profiles/teacher-profiles/invitations/verify?token=${token}`);
        return response.data; // Expected output: "valid" string
    },

    // Accepts the invitation and creates the new teacher
    acceptTeacherInvitation: async (data) => {
        // data should include: invitationToken, username, password, names, lastNames, dni
        const response = await api.post('/api/v1/profiles/teacher-profiles/invitations/accept', data);
        return response.data;
    }
};

export default adminService;
