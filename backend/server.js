import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fileUpload from 'express-fileupload';
import uploadRoutes from './routes/upload.js';
import formatRoutes from './routes/format.js';
import downloadRoutes from './routes/download.js';
import researchRoutes from './routes/research.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// CORS configuration - allow all origins for now (can be restricted later)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Increase JSON payload limit
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// File upload configuration
// Use /tmp for Vercel serverless functions (read-only filesystem except /tmp)
// CRITICAL: Always use /tmp in production/serverless to avoid filesystem errors
// Check multiple indicators to ensure we detect Vercel correctly
const isVercel = process.env.VERCEL || process.env.VERCEL_ENV;
const isProduction = process.env.NODE_ENV === 'production';
const tempDir = (isVercel || isProduction) ? '/tmp' : './uploads/temp';

console.log('File upload temp directory configuration:');
console.log('  VERCEL:', process.env.VERCEL);
console.log('  VERCEL_ENV:', process.env.VERCEL_ENV);
console.log('  NODE_ENV:', process.env.NODE_ENV);
console.log('  isVercel:', isVercel);
console.log('  isProduction:', isProduction);
console.log('  tempDir:', tempDir);

app.use(fileUpload({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  createParentPath: false, // CRITICAL: Don't create parent paths - /tmp already exists
  tempFileDir: tempDir,
  useTempFiles: false // Use memory storage (files are in memory, not on disk)
}));

// Routes
app.use('/api/upload', uploadRoutes);
app.use('/api/format', formatRoutes);
app.use('/api/download', downloadRoutes);
app.use('/api/research', researchRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'DocuFormat AI Backend is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Export app for Vercel serverless functions (required)
export default app;

// Start server only for local development (not in Vercel)
// Vercel sets VERCEL=1 automatically, so we check for that
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
