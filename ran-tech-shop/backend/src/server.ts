import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables. Try multiple paths so it works in both
// local (ts-node from src/) and deployed (compiled, possibly flattened) layouts.
// dotenv.config() without options also loads from process.cwd() as a fallback.
dotenv.config(); // loads .env from cwd if present
dotenv.config({ path: path.resolve(__dirname, '../.env') }); // src/../  or dist/../
dotenv.config({ path: path.resolve(__dirname, '../../.env') }); // dist/X/../../  variants
dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') }); // monorepo root cwd

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE env vars not loaded. Searched paths:', [
    process.cwd() + '/.env',
    path.resolve(__dirname, '../.env'),
    path.resolve(__dirname, '../../.env'),
    path.resolve(process.cwd(), 'backend/.env'),
  ]);
}

import { startReminderScheduler } from './jobs/repairReminders';
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';
import repairRoutes from './routes/repairs';
import quoteRoutes from './routes/quotes';
import filterCategoryRoutes from './routes/filterCategories';
import uploadRoutes from './routes/uploads';
import userRoutes from './routes/users';
import notificationRoutes from './routes/notifications';
import repairCategoryRoutes from './routes/repairCategories';
import contactRoutes from './routes/contact';

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
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
    timestamp: new Date().toISOString(),
  });
});

// Diagnostic endpoint — reports which env vars are present (no values exposed).
app.get('/api/diag', (_req: Request, res: Response) => {
  res.json({
    cwd: process.cwd(),
    nodeEnv: process.env.NODE_ENV,
    env: {
      SUPABASE_URL: !!process.env.SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      JWT_SECRET: !!process.env.JWT_SECRET,
      CLOUDINARY_CLOUD_NAME: !!process.env.CLOUDINARY_CLOUD_NAME,
      FRONTEND_URL: process.env.FRONTEND_URL || null,
    },
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/repairs', repairRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/filter-categories', filterCategoryRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/repair-categories', repairCategoryRoutes);
app.use('/api/contact', contactRoutes);

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
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
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
  ║   Database: Supabase                                  ║
  ║   Image storage: Cloudinary                           ║
  ║                                                       ║
  ╚═══════════════════════════════════════════════════════╝
  `);
  startReminderScheduler();
});

export default app;
