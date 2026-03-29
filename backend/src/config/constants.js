module.exports = {
  COMPLAINT_CATEGORIES: ['general', 'employment', 'consumer', 'family', 'property'],
  COMPLAINT_STATUSES: ['new', 'processing', 'escalated', 'resolved'],
  PRIORITY_LEVELS: ['low', 'medium', 'high', 'critical'],
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: ['pdf', 'doc', 'docx', 'txt', 'jpg', 'png'],
  JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret_key_demo', // Centralized JWT secret
};
