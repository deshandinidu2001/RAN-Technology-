"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@prisma/client");
const path_1 = __importDefault(require("path"));
const auth_1 = __importDefault(require("./routes/auth"));
const products_1 = __importDefault(require("./routes/products"));
const orders_1 = __importDefault(require("./routes/orders"));
const repairs_1 = __importDefault(require("./routes/repairs"));
// Load environment variables from the backend folder in both src and dist builds.
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../.env') });
const bundledDatabaseUrl = `file:${path_1.default.resolve(__dirname, '../prisma/dev.db')}`;
// In development default to an included SQLite DB when DATABASE_URL is missing.
// In production we must NOT silently override DATABASE_URL — require it to be
// provided via environment variables (Vercel project settings).
if (process.env.NODE_ENV === 'development') {
    if (!process.env.DATABASE_URL) {
        process.env.DATABASE_URL = bundledDatabaseUrl;
    }
}
else {
    if (!process.env.DATABASE_URL) {
        console.warn('⚠️  No DATABASE_URL set for production. Set DATABASE_URL in environment.');
    }
}
// Initialize Prisma client
exports.prisma = new client_1.PrismaClient();
// Create Express app
const app = (0, express_1.default)();
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
app.use((0, cors_1.default)({
    origin: corsOrigins,
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Request logging middleware
app.use((req, _res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});
// Health check endpoint
app.get('/api/health', (_req, res) => {
    res.json({
        status: 'ok',
        message: 'RAN Tech Shop API is running',
        timestamp: new Date().toISOString()
    });
});
const users_1 = __importDefault(require("./routes/users"));
// API Routes
app.use('/api/auth', auth_1.default);
app.use('/api/users', users_1.default);
app.use('/api/products', products_1.default);
app.use('/api/orders', orders_1.default);
app.use('/api/repairs', repairs_1.default);
// 404 handler
app.use((_req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
// Global error handler
app.use((err, _req, res, _next) => {
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
    await exports.prisma.$disconnect();
    process.exit(0);
});
process.on('SIGTERM', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    await exports.prisma.$disconnect();
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
exports.default = app;
//# sourceMappingURL=server.js.map