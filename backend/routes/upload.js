import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { parseDocument } from '../services/documentParser.js';
import { formatDocument } from '../services/documentFormatter.js';
import { saveDocument, getDocument } from '../services/documentStore.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { ensureUploadDir } from '../utils/fileUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.files.file;
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({ 
        error: 'Invalid file type. Please upload a PDF or Word document.' 
      });
    }

    // Generate unique document ID
    const documentId = uuidv4();
    
    // Save uploaded file temporarily
    // Use utility function to get upload directory (handles Vercel/serverless)
    const uploadDir = await ensureUploadDir();
    const filePath = path.join(uploadDir, `${documentId}_${file.name}`);
    await file.mv(filePath);

    // Parse document
    console.log('Parsing document...');
    const parsedContent = await parseDocument(filePath, file.mimetype);

    // Format document
    console.log('Formatting document...');
    const formattedResult = await formatDocument(parsedContent);

    // Store document data
    const documentData = {
      documentId,
      fileName: file.name,
      originalContent: parsedContent.html,
      formattedContent: formattedResult.html,
      metadata: parsedContent.metadata,
      formattingSummary: formattedResult.summary,
      filePath,
      createdAt: new Date().toISOString()
    };

    saveDocument(documentId, documentData);

    // Clean up file after processing (optional - you might want to keep it for download)
    // await fs.unlink(filePath);

    res.json({
      documentId,
      originalContent: documentData.originalContent,
      formattedContent: documentData.formattedContent,
      formattingSummary: documentData.formattingSummary,
      metadata: documentData.metadata
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Failed to process document',
      message: error.message 
    });
  }
});

// Get document by ID
router.get('/:documentId', (req, res) => {
  const { documentId } = req.params;
  const document = getDocument(documentId);
  
  if (!document) {
    return res.status(404).json({ error: 'Document not found' });
  }

  res.json(document);
});

export default router;
