import axios from 'axios';
import { logger } from '../utils/logger.js';

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';

const pythonClient = axios.create({
  baseURL: PYTHON_SERVICE_URL,
  timeout: 30000, // 30 seconds
});

export const pythonService = {
  callAIService: async (data) => {
    try {
      const response = await axios.post(`${PYTHON_SERVICE_URL}/process-complaint`, data, {
        timeout: 30000,
      });
      return response.data;
    } catch (error) {
      logger.error('AI service call failed:', error.message);

      const message = error.response?.data?.detail
        || error.response?.data?.message
        || 'Failed to call AI service';

      const wrappedError = new Error(message);
      wrappedError.status = error.response?.status || 502;
      throw wrappedError;
    }
  },

  processComplaint: async (complaintId, complaintData) => {
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
  },

  getProcessingStatus: async (complaintId) => {
    try {
      const response = await pythonClient.get(`/api/status/${complaintId}`);
      return response.data;
    } catch (error) {
      logger.error('Failed to get processing status:', error.message);
      throw error;
    }
  },

  escalateComplaint: async (complaintId, reason) => {
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
  }
};
