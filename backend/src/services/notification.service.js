import nodemailer from 'nodemailer';
import { logger } from '../utils/logger.js';

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const notificationService = {
  sendNotification: async (to, subject, html) => {
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
  },

  sendComplaintConfirmation: async (email, complaintId) => {
    const html = `
      <h2>Complaint Received</h2>
      <p>Your complaint has been received and will be analyzed by our AI system.</p>
      <p>Complaint ID: ${complaintId}</p>
      <p>You will receive updates as your complaint is processed.</p>
    `;
    return notificationService.sendNotification(email, 'Complaint Confirmation - NyaySathi', html);
  },

  sendComplaintStatusUpdate: async (email, complaintId, status) => {
    const html = `
      <h2>Complaint Status Update</h2>
      <p>Your complaint status has been updated to: <strong>${status}</strong></p>
      <p>Complaint ID: ${complaintId}</p>
    `;
    return notificationService.sendNotification(email, 'Status Update - NyaySathi', html);
  }
};
