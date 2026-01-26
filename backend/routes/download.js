import express from 'express';
import { generatePDF, generateDOCX } from '../services/documentGenerator.js';
import { getDocument } from '../services/documentStore.js';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { documentId, format } = req.body;

    if (!documentId || !format) {
      return res.status(400).json({ 
        error: 'Document ID and format are required' 
      });
    }

    if (!['pdf', 'docx'].includes(format)) {
      return res.status(400).json({ 
        error: 'Invalid format. Use "pdf" or "docx"' 
      });
    }

    // Get document from store
    const document = getDocument(documentId);

    if (!document) {
      return res.status(404).json({ 
        error: 'Document not found' 
      });
    }

    const { formattedContent, metadata } = document;

    let fileBuffer;
    let contentType;
    let fileName;

    if (format === 'pdf') {
      fileBuffer = await generatePDF(formattedContent, metadata);
      contentType = 'application/pdf';
      fileName = 'formatted_document.pdf';
    } else {
      fileBuffer = await generateDOCX(formattedContent, metadata);
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      fileName = 'formatted_document.docx';
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(fileBuffer);

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ 
      error: 'Failed to generate download file',
      message: error.message 
    });
  }
});

export default router;
