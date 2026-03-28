import api from './api';

export const complaintService = {
  submitComplaint: async (formData) => {
    const payload = {
      title: formData.title,
      description: formData.description,
      location: formData.location,
      userId: formData.userId || 'demo-user',
    };

    const response = await api.post('/complaints', payload);
    return response.data;
  },

  getMyComplaints: async () => {
    const response = await api.get('/complaints/my');
    return response.data;
  },

  getAllComplaints: async (filter = 'all') => {
    const response = await api.get('/complaints', { params: { filter } });
    return response.data;
  },

  getComplaintById: async (id) => {
    const response = await api.get(`/complaints/${id}`);
    return response.data;
  },

  updateComplaintStatus: async (id, status) => {
    const response = await api.patch(`/complaints/${id}/status`, { status });
    return response.data;
  },
};
