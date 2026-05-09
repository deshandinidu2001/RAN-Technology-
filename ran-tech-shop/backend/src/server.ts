import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import path from 'path';

import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';
import repairRoutes from './routes/repairs';

// Load environment variables from the backend folder in both src and dist builds.
dotenv.config({ path: path.resolve(__dirname, '../.env') });
const bundledDatabaseUrl = `file:${path.resolve(__dirname, '../prisma/dev.db')}`;
// In development default to an included SQLite DB when DATABASE_URL is missing.
// In production we must NOT silently override DATABASE_URL — require it to be
// provided via environment variables (Vercel project settings).
if (process.env.NODE_ENV === 'development') {
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = bundledDatabaseUrl;
  }
} else {
  if (!process.env.DATABASE_URL) {
    console.warn('⚠️  No DATABASE_URL set for production. Set DATABASE_URL in environment.');
  }
}

// Initialize Prisma client
export const prisma = new PrismaClient();

// Create Express app
const app: Express = express();
const PORT = process.env.PORT || 3001;

// Middleware
// Configure allowed CORS origins via `ALLOWED_ORIGINS` (comma-separated)
// or `FRONTEND_URL`. If none provided, default to localhost origins for dev.
const allowedFromEnv = (process.env.ALLOWED_ORIGINS || process.env.FRONTEND_URL || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const defaultLocalOrigins = ['http://localhost:5173', 'http://localhost:3000'];
const corsOrigins = allowedFromEnv.length ? allowedFromEnv : defaultLocalOrigins;
console.log('CORS allowed origins:', corsOrigins);

app.use(cors({
  origin: corsOrigins,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    message: 'RAN Tech Shop API is running',
    timestamp: new Date().toISOString()
  });
});

import userRoutes from './routes/users';

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/repairs', repairRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════════════════╗
  ║                                                       ║
  ║   🚀 RAN Tech Shop API Server                        ║
  ║                                                       ║
  ║   Server running at: http://localhost:${PORT}          ║
  ║   Environment: ${process.env.NODE_ENV || 'development'}                       ║
  ║                                                       ║
  ╚═══════════════════════════════════════════════════════╝
  `);
});

export default app;
