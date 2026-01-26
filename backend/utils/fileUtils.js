import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { cwd } from 'process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Get the upload directory path
 * Always uses /tmp in serverless environments (Vercel, AWS Lambda, etc.)
 * Uses local uploads directory for local development
 */
export function getUploadDir() {
  // Check for serverless environment indicators
  const currentDir = cwd();
  const isServerless = 
    process.env.VERCEL || 
    process.env.VERCEL_ENV || 
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.LAMBDA_TASK_ROOT ||
    process.env.FUNCTION_TARGET ||
    __dirname.includes('/var/task') ||  // Vercel serverless path
    __dirname.includes('\\var\\task') || // Windows path format
    currentDir.includes('/var/task') ||  // Check current working directory
    currentDir.includes('\\var\\task');  // Windows path format
  
  if (isServerless) {
    console.log('Detected serverless environment, using /tmp');
    console.log('__dirname:', __dirname);
    console.log('cwd:', currentDir);
    return '/tmp';
  }
  
  // For local development
  const localDir = path.join(__dirname, '../uploads');
  
  // CRITICAL: Double-check - if localDir contains /var/task, use /tmp instead
  if (localDir.includes('/var/task') || localDir.includes('\\var\\task')) {
    console.log('CRITICAL: Local dir path contains /var/task, using /tmp instead');
    console.log('Local dir was:', localDir);
    return '/tmp';
  }
  
  console.log('Using local upload directory:', localDir);
  return localDir;
}

/**
 * Ensure upload directory exists
 * Falls back to /tmp if creation fails (for serverless environments)
 */
export async function ensureUploadDir() {
  let uploadDir = getUploadDir();
  
  // CRITICAL: If uploadDir contains /var/task, immediately use /tmp
  // This catches cases where detection didn't work
  if (uploadDir.includes('/var/task') || uploadDir.includes('\\var\\task')) {
    console.log('CRITICAL: Upload dir contains /var/task, forcing /tmp');
    uploadDir = '/tmp';
  }
  
  // If we're in /var/task (Vercel), always use /tmp
  if (__dirname.includes('/var/task') || __dirname.includes('\\var\\task')) {
    console.log('Detected /var/task path, forcing /tmp usage');
    uploadDir = '/tmp';
  }
  
  try {
    await fs.mkdir(uploadDir, { recursive: true });
    console.log('Upload directory ready:', uploadDir);
    return uploadDir;
  } catch (error) {
    // If mkdir fails, ALWAYS try /tmp as fallback
    // This is especially important for Vercel
    console.warn(`Failed to create ${uploadDir}, using /tmp instead:`, error.message);
    console.warn('Error code:', error.code);
    
    // If error mentions /var/task, definitely use /tmp
    if (error.message && error.message.includes('/var/task')) {
      console.log('Error message contains /var/task, forcing /tmp');
      uploadDir = '/tmp';
    }
    
    try {
      await fs.mkdir('/tmp', { recursive: true });
      console.log('Using /tmp as fallback');
      return '/tmp';
    } catch (tmpError) {
      // Even /tmp failed - this is very unusual
      console.error('Failed to create /tmp directory:', tmpError);
      throw new Error(`Failed to create upload directory. Tried ${uploadDir} and /tmp: ${tmpError.message}`);
    }
  }
}
