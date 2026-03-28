const logger = require('../utils/logger');

exports.errorHandler = (err, req, res, next) => {
  logger.error('Error:', err);

  const status = err.status || 500;
  const message = err.message || 'Internal server error';

  res.status(status).json({
    error: {
      status,
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};

exports.notFound = (req, res) => {
  res.status(404).json({
    error: {
      status: 404,
      message: 'Route not found',
    },
  });
};
