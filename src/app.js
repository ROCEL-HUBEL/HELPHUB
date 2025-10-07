import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB } from './config/mongoose.js'; // ✅ MongoDB connection
import { initIO } from './realtime.js';

// Routes
import authRoutes from './routes/auth.js';
import customerRoutes from './routes/customers.js';
import providerRoutes from './routes/providers.js';
import adminRoutes from './routes/admin.js';
import bookingRoutes from './routes/bookings.js';
import serviceRoutes from './routes/services.js';
import messageRoutes from './routes/messages.js';
import feedbackRoutes from './routes/feedback.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Connect MongoDB
connectDB();

// Security + Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 400 });
app.use(limiter);

// Static uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/feedback', feedbackRoutes);

// Start Server
const server = app.listen(PORT, () => {
  console.log(`🚀 HelpHub API running on http://localhost:${PORT}`);
});

initIO(server);
