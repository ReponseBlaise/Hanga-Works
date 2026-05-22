import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Load environment variables
dotenv.config();

// Import routes
import authRouter from './routes/auth.routes';
import courseRouter from './routes/course.routes';
import jobRouter from './routes/job.routes';
import applicationRouter from './routes/application.routes';
import certificateRouter from './routes/certificate.routes';
import employerRouter from './routes/employer.routes';
import analyticsRouter from './routes/analytics.routes';

import { createServer } from 'http';
import { initSocket } from './utils/socket';

const app = express();
const PORT = process.env.PORT || 5000;

// Security: HTTP Headers
app.use(helmet());

// Security: Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { status: 'error', message: 'Too many requests, please try again later.' }
});
app.use('/api', limiter);

// Create HTTP server to wrap the Express app
const httpServer = createServer(app);

// Initialize Socket.IO with the HTTP server
initSocket(httpServer);

// Enable CORS for frontend requests
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'], // Add your frontend URLs
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Cookie parser
app.use(cookieParser());

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize app (Auth is handled by routes)

// Root route
app.get('/', (_req: Request, res: Response) => {
  res.json({
    status: 'success',
    message: 'Welcome to the HANGA WORKS Workforce Intelligence API',
    version: '2.0.0',
    endpoints: {
      auth: '/api/v1/auth',
      courses: '/api/v1/courses',
      jobs: '/api/v1/jobs',
      applications: '/api/v1/applications',
      certificates: '/api/v1/certificates',
      employer: '/api/v1/employer',
      analytics: '/api/v1/analytics'
    }
  });
});

// Mount routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/courses', courseRouter);
app.use('/api/v1/jobs', jobRouter);
app.use('/api/v1/applications', applicationRouter);
app.use('/api/v1/certificates', certificateRouter);
app.use('/api/v1/employer', employerRouter);
app.use('/api/v1/analytics', analyticsRouter);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'An internal server error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
  console.log(`[Socket.IO]: WebSocket Gateway initialized`);
});
