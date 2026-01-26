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
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  createParentPath: true,
  tempFileDir: './uploads/temp'
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
