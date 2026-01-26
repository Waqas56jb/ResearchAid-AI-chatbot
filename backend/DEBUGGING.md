# Backend API Debugging Guide

## Common Issues and Solutions

### 1. 500 Internal Server Error on `/api/research/assignment`

#### Possible Causes:

**A. Missing OpenAI API Key in Vercel**
- **Check**: Go to Vercel Dashboard → Your Project → Settings → Environment Variables
- **Fix**: Add `OPENAI_API_KEY` with your OpenAI API key value
- **Verify**: Redeploy after adding the environment variable

**B. Vercel Function Timeout**
- **Issue**: Assignment generation takes 30-60 seconds (3 API calls)
- **Vercel Limits**: 
  - Hobby Plan: 10 seconds max
  - Pro Plan: 60 seconds max
- **Fix**: Upgrade to Pro plan OR optimize the code to use fewer API calls

**C. Request Size Limit**
- **Issue**: Assignment text might be too large
- **Fix**: The code limits to 15,000 characters, but Vercel has payload limits
- **Check**: Ensure request body is under 4.5MB (Vercel limit)

**D. CORS Issues**
- **Check**: Browser console for CORS errors
- **Fix**: CORS is configured to allow all origins, but verify frontend URL is correct

### 2. How to Debug

#### Check Vercel Logs:
1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on the latest deployment
3. Click "Functions" tab
4. Check the logs for error messages

#### Test in Postman:
```json
POST https://research-aid-ai-chatbot.vercel.app/api/research/assignment
Content-Type: application/json

{
  "assignmentText": "Write a short report on cloud computing (test)",
  "model": "gpt-3.5-turbo"
}
```

#### Check Environment Variables:
```bash
# In Vercel Dashboard → Settings → Environment Variables
OPENAI_API_KEY=sk-... (should be set)
NODE_ENV=production (optional)
```

### 3. Quick Fixes Applied

✅ Enhanced error logging
✅ Better error messages
✅ CORS configuration improved
✅ Request size limits increased
✅ Function timeout set to 60 seconds (requires Pro plan)

### 4. Next Steps

1. **Verify Environment Variables in Vercel**
2. **Check Vercel Logs** for specific error messages
3. **Test with shorter assignment text** to avoid timeouts
4. **Consider using `gpt-3.5-turbo`** instead of `gpt-4-turbo-preview` for faster responses

### 5. Test Endpoints

**Health Check:**
```
GET https://research-aid-ai-chatbot.vercel.app/api/health
```

**Simple Assignment (should work):**
```
POST https://research-aid-ai-chatbot.vercel.app/api/research/assignment
Content-Type: application/json

{
  "assignmentText": "Write 500 words about AI",
  "model": "gpt-3.5-turbo"
}
```
