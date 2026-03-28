const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

exports.sendNotification = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@nyaysathi.com',
      to,
      subject,
      html,
    });
    logger.info(`Notification sent to ${to}`);
  } catch (error) {
    logger.error('Failed to send notification:', error);
  }
};

exports.sendComplaintConfirmation = async (email, complaintId) => {
  const html = `
    <h2>Complaint Received</h2>
    <p>Your complaint has been received and will be analyzed by our AI system.</p>
    <p>Complaint ID: ${complaintId}</p>
    <p>You will receive updates as your complaint is processed.</p>
  `;
  return exports.sendNotification(email, 'Complaint Confirmation - NyaySathi', html);
};

exports.sendComplaintStatusUpdate = async (email, complaintId, status) => {
  const html = `
    <h2>Complaint Status Update</h2>
    <p>Your complaint status has been updated to: <strong>${status}</strong></p>
    <p>Complaint ID: ${complaintId}</p>
  `;
  return exports.sendNotification(email, 'Status Update - NyaySathi', html);
};
