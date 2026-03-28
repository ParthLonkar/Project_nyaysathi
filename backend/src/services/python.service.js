const axios = require('axios');
const config = require('../config/env');
const logger = require('../utils/logger');

const pythonClient = axios.create({
  baseURL: config.PYTHON_SERVICE_URL,
  timeout: 30000, // 30 seconds
});

exports.processComplaint = async (complaintId, complaintData) => {
  try {
    logger.info(`Sending complaint ${complaintId} to Python service`);
    
    const response = await pythonClient.post('/api/process', {
      complaint_id: complaintId,
      ...complaintData,
    });

    return response.data;
  } catch (error) {
    logger.error('Python service error:', error.message);
    throw new Error('Failed to process complaint with AI service');
  }
};

exports.getProcessingStatus = async (complaintId) => {
  try {
    const response = await pythonClient.get(`/api/status/${complaintId}`);
    return response.data;
  } catch (error) {
    logger.error('Failed to get processing status:', error.message);
    throw error;
  }
};

exports.escalateComplaint = async (complaintId, reason) => {
  try {
    const response = await pythonClient.post(`/api/escalate`, {
      complaint_id: complaintId,
      reason,
    });
    return response.data;
  } catch (error) {
    logger.error('Failed to escalate complaint:', error.message);
    throw error;
  }
};
