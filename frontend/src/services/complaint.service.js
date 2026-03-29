import api from './api';

export const complaintService = {
  submitComplaint: async (formData) => {
    const complaintText = formData.complaintText || formData.description || '';
    const generatedTitle = complaintText.trim()
      ? complaintText.trim().split('.').shift().slice(0, 80)
      : 'Civic complaint';

    const payload = {
      complaint_text: complaintText,
      title: formData.title || generatedTitle || 'Civic complaint',
      description: formData.description || complaintText,
      location: formData.location,
      location_coordinates: formData.location_coordinates || null,
      userId: formData.userId || 'demo-user',
      name: formData.name || formData.fullName || '',
      phone: formData.phone || '',
      attachment_meta: (formData.attachments || []).map((file) => ({
        name: file.name,
        type: file.type,
        size: file.size,
      })),
    };

    let response;
    if ((formData.attachments || []).length > 0) {
      const multipart = new FormData();
      multipart.append('complaint_text', payload.complaint_text);
      multipart.append('title', payload.title);
      multipart.append('description', payload.description);
      multipart.append('location', payload.location);
      multipart.append('location_coordinates', JSON.stringify(payload.location_coordinates));
      multipart.append('userId', payload.userId);
      multipart.append('name', payload.name);
      multipart.append('phone', payload.phone);
      multipart.append('attachment_meta', JSON.stringify(payload.attachment_meta));

      (formData.attachments || []).forEach((file) => {
        multipart.append('attachments', file);
      });

      response = await api.post('/complaints', multipart, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } else {
      response = await api.post('/complaints', payload);
    }

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

  getPublicSolvedCasesMapData: async (limit = 800) => {
    const response = await api.get('/complaints/public/solved-map', { params: { limit } });
    return response.data;
  },

  getComplaintById: async (id) => {
    const response = await api.get(`/complaints/${id}`);
    return response.data;
  },

  trackByReferenceId: async (referenceId) => {
    const response = await api.get(`/complaints/track/${encodeURIComponent(referenceId)}`);
    return response.data;
  },

  updateComplaintStatus: async (id, status) => {
    const response = await api.patch(`/complaints/${id}/status`, { status });
    return response.data;
  },
};

