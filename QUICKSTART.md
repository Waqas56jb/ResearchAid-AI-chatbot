# Quick Start Guide

Get DocuFormat AI up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- OpenAI API key (get one at https://platform.openai.com/)

## Step 1: Clone and Install

```bash
# Install all dependencies
npm run install:all
```

Or manually:
```bash
cd frontend && npm install
cd ../backend && npm install
```

## Step 2: Configure Backend

1. Go to `backend` folder
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Edit `.env` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=sk-your-key-here
   PORT=5000
   ```

## Step 3: Configure Frontend

1. Go to `frontend` folder
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
3. The default `.env` should work for local development:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

## Step 4: Start Development Servers

### Terminal 1 - Backend:
```bash
cd backend
npm run dev
```
Backend will run on http://localhost:5000

### Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```
Frontend will run on http://localhost:3000

## Step 5: Test the Application

1. Open http://localhost:3000 in your browser
2. Upload a test PDF or Word document
3. Wait for processing (may take a few seconds)
4. Review the formatted document
5. Try editing and downloading

## Troubleshooting

### Backend won't start
- Check if port 5000 is available
- Verify `.env` file exists and has `OPENAI_API_KEY`
- Run `npm install` in backend folder

### Frontend can't connect to backend
- Ensure backend is running on port 5000
- Check `VITE_API_URL` in frontend `.env`
- Check browser console for CORS errors

### Document processing fails
- Verify OpenAI API key is valid
- Check file size (max 10MB)
- Ensure file is PDF or DOCX format

### PDF download doesn't work
- Puppeteer requires additional setup on some systems
- For Vercel deployment, consider using alternative PDF generation

## Next Steps

- See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment
- Check [README.md](./README.md) for full documentation
