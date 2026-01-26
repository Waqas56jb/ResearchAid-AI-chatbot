import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Get the upload directory path
 * Always uses /tmp in serverless environments (Vercel, AWS Lambda, etc.)
 * Uses local uploads directory for local development
 */
export function getUploadDir() {
  // Check for serverless environment indicators
  const isServerless = 
    process.env.VERCEL || 
    process.env.VERCEL_ENV || 
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.LAMBDA_TASK_ROOT ||
    process.env.FUNCTION_TARGET;
  
  if (isServerless) {
    return '/tmp';
  }
  
  // For local development
  return path.join(__dirname, '../uploads');
}

/**
 * Ensure upload directory exists
 * Falls back to /tmp if creation fails (for serverless environments)
 */
export async function ensureUploadDir() {
  const uploadDir = getUploadDir();
  
  try {
    await fs.mkdir(uploadDir, { recursive: true });
    return uploadDir;
  } catch (error) {
    // If mkdir fails, try /tmp as fallback
    if (error.code === 'ENOENT' || error.code === 'EACCES' || error.code === 'EROFS') {
      console.warn(`Failed to create ${uploadDir}, using /tmp instead:`, error.message);
      try {
        await fs.mkdir('/tmp', { recursive: true });
        return '/tmp';
      } catch (tmpError) {
        throw new Error(`Failed to create upload directory: ${tmpError.message}`);
      }
    }
    throw error;
  }
}
