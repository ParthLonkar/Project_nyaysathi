import express from 'express';
import cors from 'cors';
import { logger } from './utils/logger.js';
import { errorHandler, notFound } from './middleware/error.middleware.js';
import complaintRoutes from './routes/complaint.routes.js';
import aiRoutes from './routes/ai.routes.js';
import adminRoutes from './routes/admin.routes.js';
import authRoutes from './routes/auth.routes.js';
import staffRoutes from './routes/staff.routes.js';
import statusRoutes from './routes/status.routes.js';
import { extractUser } from './middleware/auth.middleware.js';

const app = express();

// Middleware
// CORS configuration - allow credentials with specific origins
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(extractUser);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// API Routes
app.use('/api/complaints', complaintRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/status', statusRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

logger.info('Express app configured');

export default app;

