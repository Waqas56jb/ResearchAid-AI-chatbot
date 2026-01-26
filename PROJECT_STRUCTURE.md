# Project Structure

Complete overview of the DocuFormat AI project structure.

## Directory Tree

```
ResearchAid-AI-chatbot/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── Header.jsx
│   │   │   ├── FileUpload.jsx
│   │   │   ├── DocumentPreview.jsx
│   │   │   └── DocumentEditor.jsx
│   │   ├── config/          # Configuration files
│   │   │   └── api.js       # API client configuration
│   │   ├── App.jsx          # Main app component
│   │   ├── main.jsx         # Entry point
│   │   └── index.css        # Global styles with Tailwind
│   ├── index.html           # HTML template
│   ├── package.json         # Frontend dependencies
│   ├── vite.config.js       # Vite configuration
│   ├── tailwind.config.js   # Tailwind CSS configuration
│   ├── postcss.config.js    # PostCSS configuration
│   ├── vercel.json          # Vercel deployment config
│   ├── .env.example         # Environment variables template
│   └── README.md            # Frontend documentation
│
├── backend/                 # Node.js backend API
│   ├── routes/              # Express routes
│   │   ├── upload.js        # Document upload endpoint
│   │   ├── format.js        # Document formatting endpoint
│   │   └── download.js      # Document download endpoint
│   ├── services/             # Business logic services
│   │   ├── documentParser.js      # PDF/DOCX parsing
│   │   ├── documentFormatter.js  # AI formatting
│   │   ├── documentGenerator.js  # PDF/DOCX generation
│   │   └── documentStore.js       # In-memory storage
│   ├── uploads/             # Temporary file storage (gitignored)
│   ├── server.js            # Express server entry point
│   ├── package.json         # Backend dependencies
│   ├── vercel.json          # Vercel serverless config
│   ├── .env.example         # Environment variables template
│   └── README.md            # Backend documentation
│
├── .gitignore              # Git ignore rules
├── package.json            # Root package.json with scripts
├── README.md               # Main project documentation
├── DEPLOYMENT.md           # Deployment guide
├── QUICKSTART.md           # Quick start guide
└── PROJECT_STRUCTURE.md    # This file
```

## Frontend Structure

### Components

- **Header.jsx**: Application header with branding
- **FileUpload.jsx**: Drag-and-drop file upload with progress
- **DocumentPreview.jsx**: Formatted document preview with download options
- **DocumentEditor.jsx**: Inline document editor with undo/redo

### Configuration

- **api.js**: Centralized API client with interceptors
- **vite.config.js**: Development server and build configuration
- **tailwind.config.js**: Custom Tailwind theme and colors

## Backend Structure

### Routes

- **upload.js**: Handles file upload, parsing, and formatting
- **format.js**: Standalone formatting endpoint
- **download.js**: Generates and serves PDF/DOCX files

### Services

- **documentParser.js**: 
  - Parses PDF using `pdf-parse`
  - Parses DOCX using `mammoth`
  - Extracts metadata, sections, and content

- **documentFormatter.js**:
  - Applies basic formatting rules
  - Uses OpenAI API for AI-powered corrections
  - Generates formatting summary

- **documentGenerator.js**:
  - Generates PDF using Puppeteer
  - Generates DOCX using `docx` library

- **documentStore.js**:
  - In-memory document storage
  - Can be replaced with database in production

## Key Files

### Configuration Files

- **.env.example**: Template for environment variables
- **vercel.json**: Vercel deployment configuration
- **package.json**: Dependencies and scripts

### Documentation

- **README.md**: Main project documentation
- **DEPLOYMENT.md**: Step-by-step deployment guide
- **QUICKSTART.md**: Quick start instructions

## Data Flow

1. **Upload**: User uploads file → Backend parses → Formats with AI → Returns formatted content
2. **Preview**: Frontend displays formatted content with toggle for original view
3. **Edit**: User edits content → Changes saved to state → Can undo/redo
4. **Download**: User requests download → Backend generates PDF/DOCX → Returns file blob

## Technology Choices

### Frontend
- **Vite**: Fast build tool and dev server
- **React**: Component-based UI framework
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client with interceptors

### Backend
- **Express**: Minimal web framework
- **Mammoth**: DOCX to HTML conversion
- **pdf-parse**: PDF text extraction
- **OpenAI API**: AI-powered formatting
- **Puppeteer**: PDF generation (may need alternative for Vercel)
- **docx**: DOCX file generation

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

### Backend (.env)
```
PORT=5000
NODE_ENV=development
OPENAI_API_KEY=your_key_here
```

## Deployment Considerations

- Frontend: Static site, can deploy to Vercel, Netlify, etc.
- Backend: Serverless functions on Vercel (with limitations)
- Database: Currently in-memory, needs database for production
- File Storage: Currently local, needs cloud storage for production
