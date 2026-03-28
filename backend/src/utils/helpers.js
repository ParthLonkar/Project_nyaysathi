module.exports = {
  formatError: (error) => {
    return {
      message: error.message,
      status: error.status || 500,
    };
  },

  asyncHandler: (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  },

  validateEmail: (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },

  calculateComplaintMetrics: (complaints) => {
    return {
      total: complaints.length,
      avgProcessingTime: complaints.reduce((sum, c) => sum + (c.processing_time || 0), 0) / complaints.length,
      successRate: (complaints.filter(c => c.status === 'resolved').length / complaints.length) * 100,
    };
  },
};
