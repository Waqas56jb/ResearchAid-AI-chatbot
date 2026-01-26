# Deployment Guide for DocuFormat AI

This guide explains how to deploy both the frontend and backend to Vercel.

## Prerequisites

- GitHub account
- Vercel account (sign up at vercel.com)
- OpenAI API key (for AI formatting features)

## Backend Deployment

### Step 1: Prepare Backend

1. Navigate to the `backend` folder
2. Create a `.env` file with your configuration:
   ```
   PORT=5000
   NODE_ENV=production
   OPENAI_API_KEY=your_openai_api_key_here
   ```

### Step 2: Deploy to Vercel

1. Install Vercel CLI (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. Navigate to the backend directory:
   ```bash
   cd backend
   ```

3. Login to Vercel:
   ```bash
   vercel login
   ```

4. Deploy:
   ```bash
   vercel
   ```

5. Follow the prompts:
   - Set up and deploy? **Yes**
   - Which scope? (Select your account)
   - Link to existing project? **No**
   - Project name: `docuformat-ai-backend`
   - Directory: `./`
   - Override settings? **No**

6. Add environment variables in Vercel dashboard:
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add:
     - `OPENAI_API_KEY` = your OpenAI API key
     - `NODE_ENV` = `production`

7. Note your backend URL (e.g., `https://docuformat-ai-backend.vercel.app`)

## Frontend Deployment

### Step 1: Update API Configuration

1. Navigate to the `frontend` folder
2. Create a `.env` file:
   ```
   VITE_API_URL=https://your-backend-url.vercel.app/api
   ```
   Replace `your-backend-url.vercel.app` with your actual backend URL from Step 2.

### Step 2: Deploy to Vercel

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Follow the prompts:
   - Set up and deploy? **Yes**
   - Project name: `docuformat-ai-frontend`
   - Directory: `./`
   - Override settings? **No**

4. Add environment variables in Vercel dashboard:
   - `VITE_API_URL` = your backend URL (e.g., `https://docuformat-ai-backend.vercel.app/api`)

5. Note your frontend URL (e.g., `https://docuformat-ai-frontend.vercel.app`)

## Alternative: Deploy via GitHub

### Backend

1. Push your code to GitHub
2. Go to Vercel dashboard
3. Click "New Project"
4. Import your GitHub repository
5. Configure:
   - **Root Directory**: `backend`
   - **Framework Preset**: Other
   - **Build Command**: (leave empty or `npm install`)
   - **Output Directory**: (leave empty)
6. Add environment variables
7. Deploy

### Frontend

1. Push your code to GitHub
2. Go to Vercel dashboard
3. Click "New Project"
4. Import your GitHub repository
5. Configure:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Add environment variables
7. Deploy

## Important Notes

### Backend Considerations

- **Puppeteer Limitation**: Puppeteer (used for PDF generation) may not work in Vercel serverless functions. Consider alternatives:
  - Use `@sparticuz/chromium` for Vercel-compatible PDF generation
  - Use external PDF service (PDFShift, HTMLtoPDF API)
  - Generate PDFs client-side using browser APIs
- Vercel serverless functions have execution time limits (10 seconds on free tier, 60 seconds on Pro)
- Large document processing might timeout - consider using a queue system (Bull.js) or external service
- File uploads are limited to 4.5MB on free tier
- For production, consider using a database (MongoDB Atlas, PostgreSQL) instead of in-memory storage

### Frontend Considerations

- Make sure `VITE_API_URL` is set correctly in production
- CORS is configured in the backend to allow frontend requests
- Update `vercel.json` rewrite rules with your actual backend URL

## Testing Deployment

1. Visit your frontend URL
2. Upload a test document (PDF or DOCX)
3. Verify formatting works
4. Test download functionality

## Troubleshooting

### Backend Issues

- **Timeout errors**: Document too large or processing too slow
  - Solution: Optimize parsing, use streaming, or increase timeout
- **Missing environment variables
  - Solution: Check Vercel environment variables are set correctly

### Frontend Issues

- **API connection errors**: CORS or URL issues
  - Solution: Verify `VITE_API_URL` and backend CORS settings
- **Build errors**: Missing dependencies
  - Solution: Check `package.json` and ensure all dependencies are listed

## Production Recommendations

1. **Database**: Replace in-memory storage with MongoDB or PostgreSQL
2. **File Storage**: Use AWS S3 or similar for document storage
3. **Queue System**: Implement Bull.js or similar for async processing
4. **Caching**: Add Redis for document caching
5. **Monitoring**: Set up error tracking (Sentry, LogRocket)
6. **Rate Limiting**: Add rate limiting to prevent abuse
7. **Security**: Implement authentication and authorization
