const jwt = require('jsonwebtoken');
const config = require('../config/env');
const logger = require('../utils/logger');

exports.authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Missing or invalid authorization header' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, config.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Authentication error:', error.message);
    res.status(401).json({ message: 'Invalid token' });
  }
};

exports.authorize = (requiredRole) => {
  return (req, res, next) => {
    if (req.user.role !== requiredRole) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };
};
