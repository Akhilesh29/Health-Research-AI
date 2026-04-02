import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import router from './routes';
import { errorMiddleware } from './middleware/error.middleware';

const app = express();

// Railway/Vercel run behind reverse proxies; trust proxy so rate-limit sees real client IPs.
app.set('trust proxy', 1);

// Security
app.use(helmet());
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);

// Rate limiting
app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 100,
    message: { error: 'Too many requests, please try again later' },
  })
);

// Strict rate limit for AI endpoint
app.use(
  '/api/symptoms',
  rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20,
    message: { error: 'AI analysis limit reached, try again in an hour' },
  })
);

// Body parsing
app.use(express.json({ limit: '10kb' }));

// Routes
app.use('/api', router);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use(errorMiddleware);

export default app;
