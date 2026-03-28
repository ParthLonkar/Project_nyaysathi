import api from './api';

export const complaintService = {
  submitComplaint: async (formData) => {
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('category', formData.category);
    if (formData.attachment) {
      data.append('attachment', formData.attachment);
    }

    const response = await api.post('/complaints', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
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
