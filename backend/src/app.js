import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import authRoutes from './routes/authRoutes.js';
import adminPartnerRoutes from './routes/adminPartnerRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import receiptRoutes from './routes/receiptRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '100kb' }));
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, limit: 200, standardHeaders: 'draft-8', legacyHeaders: false }));

app.get('/api/health', (_request, response) => {
  response.json({ success: true, message: 'eCafeHimachal API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminPartnerRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/admin', adminRoutes);

app.use((_request, response) => response.status(404).json({ success: false, message: 'Route not found' }));

app.use((error, _request, response, _next) => {
  console.error(error);
  if (error.name === 'ZodError') return response.status(400).json({ success: false, message: error.issues[0]?.message || 'Invalid request data.' });
  if (error.code === 11000) return response.status(409).json({ success: false, message: 'An account already uses this mobile number or email.' });
  response.status(error.statusCode || 500).json({ success: false, message: error.statusCode ? error.message : 'Something went wrong' });
});

export default app;
