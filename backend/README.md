# DocuFormat AI - Backend

Node.js + Express backend API for the DocuFormat AI document formatting system.

## Features

- Document upload and parsing (PDF, DOCX)
- AI-powered formatting using OpenAI GPT
- Real-time document processing
- PDF and DOCX generation
- RESTful API endpoints

## Installation

```bash
npm install
```

## Configuration

1. Copy `.env.example` to `.env`
2. Add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_key_here
   ```

## Development

```bash
npm run dev
```

The server will run on `http://localhost:5000`

## API Endpoints

### Health Check
- `GET /api/health` - Server health status

### Upload Document
- `POST /api/upload` - Upload and process document
  - Body: FormData with `file` field
  - Returns: Document ID, formatted content, metadata

### Format Document
- `POST /api/format` - Format document content
  - Body: `{ content: string, formatType?: string }`
  - Returns: Formatted content and summary

### Download Document
- `POST /api/download` - Download formatted document
  - Body: `{ documentId: string, format: 'pdf' | 'docx' }`
  - Returns: File buffer

## Deployment

For Vercel deployment, see `vercel.json` configuration.
