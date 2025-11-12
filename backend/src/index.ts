import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { initDatabase } from './db';
import { errorHandler } from './middleware/errorHandler';
import { apiKeyAuth } from './middleware/auth';
import sessionRoutes from './routes/session';
import enrollRoutes from './routes/enroll';
import healthRoutes from './routes/health';
import metricsRoutes from './routes/metrics';
import aiRoutes from './routes/ai';
import policyRoutes from './routes/policy';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(',') || 'http://localhost:5173',
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// Body parsing
app.use(express.json({ limit: '1mb' }));

// Metrics middleware
import { metricsMiddleware } from './middleware/metricsMiddleware';
app.use('/api', metricsMiddleware);

// Initialize database
initDatabase();

// Insert fake data for demo (only in development)
if (process.env.NODE_ENV !== 'production' && process.env.SKIP_FAKE_DATA !== 'true') {
    try {
        const { insertFakeData } = require('./scripts/insertFakeData');
        insertFakeData();
    } catch (error) {
        console.warn('⚠️  Could not insert fake data:', error);
    }
}

// Public routes
app.use('/api/health', healthRoutes);

// Protected routes (require API key)
app.use('/api/session', apiKeyAuth, sessionRoutes);
app.use('/api/sessions', apiKeyAuth, sessionRoutes); // Also mount on /sessions for GET routes (includes /metadata)
app.use('/api/enroll', apiKeyAuth, enrollRoutes);

// Public metrics routes (transparency)
app.use('/api/metrics', metricsRoutes);

// AI-powered analysis routes
app.use('/api/ai', apiKeyAuth, aiRoutes);

// Policy engine routes
app.use('/api/policy', apiKeyAuth, policyRoutes);

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`🚀 BIaaS Backend running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔒 API Key auth: ${process.env.API_KEY ? 'enabled' : 'MISSING - SET API_KEY'}`);
});

export default app;
