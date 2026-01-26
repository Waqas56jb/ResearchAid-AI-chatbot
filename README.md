# ResearchAid AI: GPT-Powered Assistant for Automated Academic Analysis and Writing Support

A full-stack web application that integrates natural language processing with document parsing to support students and researchers in managing and enhancing their research process. The system provides AI-powered academic analysis tools including paper summarization, research question generation, argument critique, citation formatting, and dissertation outlining.

## Features

- 📄 **Paper Summarization**: Upload academic papers (PDF/DOCX) and get comprehensive AI-generated summaries
- ❓ **Research Questions Generator**: Generate research questions from topics or academic papers
- 🔍 **Argument Critique**: Critical analysis of arguments, evidence, and reasoning in academic papers
- 📚 **Citation Generator**: Create properly formatted citations in APA, MLA, Harvard, or Chicago style
- 📋 **Dissertation Outline Generator**: Generate comprehensive dissertation outlines from research topics
- 📝 **Assignment Response Generator**: Generate complete, well-structured academic assignment responses from requirements documents
- 🎨 **Professional UI**: Modern, responsive design with Tailwind CSS

## Project Structure

```
.
├── frontend/          # React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/
│   │   │   ├── PaperSummarizer.jsx
│   │   │   ├── ResearchQuestions.jsx
│   │   │   ├── ArgumentCritique.jsx
│   │   │   ├── CitationGenerator.jsx
│   │   │   └── DissertationOutline.jsx
│   │   ├── config/
│   │   └── App.jsx
│   └── package.json
│
├── backend/           # Node.js + Express
│   ├── routes/
│   │   └── research.js
│   ├── services/
│   │   ├── documentParser.js
│   │   └── researchAidService.js
│   └── server.js
│
└── README.md
```

## Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Dropzone** - File upload

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **Mammoth** - DOCX parsing
- **pdf-parse** - PDF parsing
- **OpenAI API** - GPT-powered AI features

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- OpenAI API key (for AI features)

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file:
   ```bash
   cp .env.example .env
   ```

4. Add your OpenAI API key to `.env`:
   ```
   OPENAI_API_KEY=your_key_here
   PORT=5000
   ```

5. Start the server:
   ```bash
   npm run dev
   ```

   Server runs on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with backend URL:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

5. Start development server:
   ```bash
   npm run dev
   ```

   App runs on `http://localhost:3000`

## API Endpoints

### Health Check
- `GET /api/health` - Server health status

### Paper Summarization
- `POST /api/research/summarize` - Summarize an academic paper
  - Body: FormData with `file` field (PDF/DOCX)
  - Returns: Summary and metadata

### Research Questions
- `POST /api/research/questions` - Generate research questions
  - Body: `{ topic: string }` OR FormData with `file` field
  - Returns: Generated questions and count

### Argument Critique
- `POST /api/research/critique` - Critique arguments in a paper
  - Body: FormData with `file` field (PDF/DOCX)
  - Returns: Critical analysis

### Citation Generator
- `POST /api/research/citations` - Generate formatted citations
  - Body: `{ paperInfo: object, format: 'APA'|'MLA'|'Harvard'|'Chicago' }`
  - Returns: Formatted citation

### Dissertation Outline
- `POST /api/research/outline` - Generate dissertation outline
  - Body: `{ topic: string, field: string }`
  - Returns: Comprehensive outline

### Assignment Response Generator
- `POST /api/research/assignment` - Generate comprehensive assignment response
  - Body: FormData with `file` field (PDF/DOCX/TXT) OR `{ assignmentText: string }`
  - Returns: Complete assignment response with word count, sections, and formatted content

## Features in Detail

### Paper Summarization
- Extracts key information from academic papers
- Provides structured summaries with main findings
- Identifies methodology, contributions, and conclusions
- Uses GPT-3.5-turbo for intelligent summarization

### Research Questions Generator
- Generates 5-8 high-quality research questions
- Works from topics or paper content
- Covers theoretical, methodological, and practical aspects
- Questions are specific, answerable, and researchable

### Argument Critique
- Identifies main arguments and claims
- Evaluates strength of evidence and reasoning
- Points out weaknesses, limitations, and gaps
- Suggests improvements and alternative perspectives

### Citation Generator
- Supports multiple formats: APA, MLA, Harvard, Chicago
- Properly formatted according to style guidelines
- Includes in-text and full reference formats
- Handles missing information gracefully

### Dissertation Outline Generator
- Creates comprehensive chapter structures
- Includes standard dissertation sections
- Provides descriptions for each section
- Tailored to specific research fields

### Assignment Response Generator
- Generates complete, publication-quality assignment responses
- Includes all required sections (Introduction, Literature Review, Implementation, etc.)
- Properly formatted with Harvard citations
- Word count: 2500-3000 words (MSc level)
- Demonstrates deep understanding and critical analysis
- Ready for academic submission

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions to Vercel.

### Quick Deploy

**Backend:**
```bash
cd backend
vercel
```

**Frontend:**
```bash
cd frontend
vercel
```

## Development

### Backend Development
```bash
cd backend
npm run dev  # Uses nodemon for auto-reload
```

### Frontend Development
```bash
cd frontend
npm run dev  # Vite dev server with HMR
```

## Environment Variables

### Backend
- `PORT` - Server port (default: 5000)
- `OPENAI_API_KEY` - OpenAI API key (required for AI features)
- `NODE_ENV` - Environment (development/production)

### Frontend
- `VITE_API_URL` - Backend API URL

## Limitations

- File size limit: 10MB
- Processing time depends on document size and AI model
- AI features require OpenAI API key
- In-memory storage (not persistent across server restarts)

## Future Enhancements

- [ ] Database integration for persistent storage
- [ ] User authentication and session management
- [ ] Document history and versioning
- [ ] Batch processing for multiple papers
- [ ] Export summaries and critiques as PDF
- [ ] Custom citation styles
- [ ] Collaboration features
- [ ] Integration with reference managers

## Project Context

This project is part of the Final Year Project (6500CSQR) for BSc Computer Science at Oryx University in partnership with Liverpool John Moores University.

**Project Title:** ResearchAid AI: A GPT-Powered Assistant for Automated Academic Analysis and Writing Support

**Student:** Sultan Al-Amer (102641)  
**Supervisor:** Professor Jihad Mohamad Al Jaam

## License

This project is for educational purposes as part of the Final Year Project.

## Author

Sultan Al-Amer - BSc Computer Science
