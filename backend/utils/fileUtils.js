import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { cwd } from 'process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Ensure upload directory exists
 * ULTRA-SIMPLIFIED: Always use /tmp if we detect ANY serverless indicator
 * This function is called by all file upload endpoints
 */
export async function ensureUploadDir() {
  // Get current working directory for detection
  const currentDir = cwd();
  
  // Check for serverless environment - MULTIPLE indicators
  const isServerlessPath = 
    __dirname.includes('/var/task') || 
    __dirname.includes('\\var\\task') ||
    currentDir.includes('/var/task') ||
    currentDir.includes('\\var\\task');
  
  const isProduction = process.env.NODE_ENV === 'production';
  const hasVercelEnv = process.env.VERCEL || process.env.VERCEL_ENV;
  
  // LOG everything for debugging
  console.log('=== ensureUploadDir() called ===');
  console.log('__dirname:', __dirname);
  console.log('cwd():', currentDir);
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('VERCEL:', process.env.VERCEL);
  console.log('VERCEL_ENV:', process.env.VERCEL_ENV);
  console.log('isServerlessPath:', isServerlessPath);
  console.log('isProduction:', isProduction);
  console.log('hasVercelEnv:', hasVercelEnv);
  
  // CRITICAL: If ANY serverless indicator, IMMEDIATELY use /tmp (skip all other logic)
  if (isServerlessPath || isProduction || hasVercelEnv) {
    console.log('>>> FORCING /tmp (Serverless/Production Detected) <<<');
    
    try {
      await fs.mkdir('/tmp', { recursive: true });
      console.log('✓ Successfully created/verified /tmp directory');
      return '/tmp';
    } catch (tmpError) {
      console.error('✗ CRITICAL ERROR: Failed to create /tmp:', tmpError);
      console.error('Error code:', tmpError.code);
      console.error('Error message:', tmpError.message);
      throw new Error(`Failed to create /tmp directory: ${tmpError.message}`);
    }
  }
  
  // Only for local development (when NONE of the serverless indicators are true)
  const localDir = path.join(__dirname, '../uploads');
  console.log('>>> Local development mode - attempting:', localDir);
  
  // Double-check: if localDir contains /var/task, force /tmp
  if (localDir.includes('/var/task') || localDir.includes('\\var\\task')) {
    console.log('>>> CRITICAL: localDir contains /var/task, forcing /tmp <<<');
    try {
      await fs.mkdir('/tmp', { recursive: true });
      return '/tmp';
    } catch (tmpError) {
      throw new Error(`Failed to create /tmp directory: ${tmpError.message}`);
    }
  }
  
  try {
    await fs.mkdir(localDir, { recursive: true });
    console.log('✓ Using local upload directory:', localDir);
    return localDir;
  } catch (error) {
    // If local dir fails, fallback to /tmp
    console.warn(`Failed to create ${localDir}, falling back to /tmp:`, error.message);
    try {
      await fs.mkdir('/tmp', { recursive: true });
      console.log('✓ Fallback to /tmp successful');
      return '/tmp';
    } catch (tmpError) {
      throw new Error(`Failed to create upload directory (tried ${localDir} and /tmp): ${tmpError.message}`);
    }
  }
}

// Keep getUploadDir for backwards compatibility (not used anymore)
export function getUploadDir() {
  return '/tmp'; // Always return /tmp to be safe
}
