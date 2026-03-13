import api from './api';

const instituteService = {
    searchInstitutes: async (name, nivMod) => {
        const params = new URLSearchParams();
        if (name) params.append('name', name);
        if (nivMod) params.append('nivMod', nivMod);

        const response = await api.get(`/api/v1/institutes/by-query?${params.toString()}`);
        return response.data;
    }
};

export default instituteService;
