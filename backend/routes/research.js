import express from 'express';
import { parseDocument } from '../services/documentParser.js';
import {
  summarizePaper,
  generateResearchQuestions,
  critiqueArguments,
  generateCitations,
  generateDissertationOutline,
  generateAssignmentResponse
} from '../services/researchAidService.js';
import { generatePDF, generateDOCX } from '../services/documentGenerator.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { ensureUploadDir } from '../utils/fileUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

/**
 * POST /api/research/summarize
 * Summarize an uploaded academic paper
 */
router.post('/summarize', async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.files.file;
    
    // Parse document
    // Use utility function to get upload directory (handles Vercel/serverless)
    const uploadDir = await ensureUploadDir();
    const filePath = path.join(uploadDir, `temp_${Date.now()}_${file.name}`);
    await file.mv(filePath);

    const parsedContent = await parseDocument(filePath, file.mimetype);
    
    // Summarize
    const summaryResult = await summarizePaper(parsedContent.text, {
      model: req.body.model || 'gpt-3.5-turbo'
    });

    // Clean up temp file
    await fs.unlink(filePath).catch(() => {});

    res.json({
      summary: summaryResult.summary,
      metadata: {
        originalWordCount: summaryResult.wordCount,
        model: summaryResult.model
      }
    });

  } catch (error) {
    console.error('Summarize error:', error);
    res.status(500).json({
      error: 'Failed to summarize paper',
      message: error.message
    });
  }
});

/**
 * POST /api/research/questions
 * Generate research questions from paper or topic
 */
router.post('/questions', async (req, res) => {
  try {
    const { topic, file } = req.body;
    let text = '';

    // If file is uploaded, parse it
    if (req.files && req.files.file) {
      const uploadedFile = req.files.file;
      // Use utility function to get upload directory (handles Vercel/serverless)
      const uploadDir = await ensureUploadDir();
      const filePath = path.join(uploadDir, `temp_${Date.now()}_${uploadedFile.name}`);
      await uploadedFile.mv(filePath);
      
      const parsedContent = await parseDocument(filePath, uploadedFile.mimetype);
      text = parsedContent.text;
      
      await fs.unlink(filePath).catch(() => {});
    }

    const questionsResult = await generateResearchQuestions(text, topic, {
      model: req.body.model || 'gpt-3.5-turbo'
    });

    res.json({
      questions: questionsResult.questions,
      count: questionsResult.count,
      source: topic ? 'topic' : 'paper'
    });

  } catch (error) {
    console.error('Research questions error:', error);
    res.status(500).json({
      error: 'Failed to generate research questions',
      message: error.message
    });
  }
});

/**
 * POST /api/research/critique
 * Critique arguments in an academic paper
 */
router.post('/critique', async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.files.file;
    
    // Parse document
    // Use utility function to get upload directory (handles Vercel/serverless)
    const uploadDir = await ensureUploadDir();
    const filePath = path.join(uploadDir, `temp_${Date.now()}_${file.name}`);
    await file.mv(filePath);

    const parsedContent = await parseDocument(filePath, file.mimetype);
    
    // Critique
    const critiqueResult = await critiqueArguments(parsedContent.text, {
      model: req.body.model || 'gpt-3.5-turbo'
    });

    // Clean up
    await fs.unlink(filePath).catch(() => {});

    res.json({
      critique: critiqueResult.critique,
      metadata: {
        originalWordCount: critiqueResult.wordCount
      }
    });

  } catch (error) {
    console.error('Critique error:', error);
    res.status(500).json({
      error: 'Failed to critique arguments',
      message: error.message
    });
  }
});

/**
 * POST /api/research/citations
 * Generate formatted citations
 */
router.post('/citations', async (req, res) => {
  try {
    const { paperInfo, format } = req.body;

    if (!paperInfo) {
      return res.status(400).json({ error: 'Paper information is required' });
    }

    const citationResult = await generateCitations(paperInfo, format || 'APA', {
      model: req.body.model || 'gpt-3.5-turbo'
    });

    res.json({
      citation: citationResult.citation,
      format: citationResult.format,
      paperInfo: citationResult.paperInfo
    });

  } catch (error) {
    console.error('Citation generation error:', error);
    res.status(500).json({
      error: 'Failed to generate citation',
      message: error.message
    });
  }
});

/**
 * POST /api/research/outline
 * Generate dissertation outline from topic
 */
router.post('/outline', async (req, res) => {
  try {
    const { topic, field } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const outlineResult = await generateDissertationOutline(
      topic,
      field || 'Computer Science',
      {
        model: req.body.model || 'gpt-3.5-turbo'
      }
    );

    res.json({
      outline: outlineResult.outline,
      topic: outlineResult.topic,
      field: outlineResult.field
    });

  } catch (error) {
    console.error('Dissertation outline error:', error);
    res.status(500).json({
      error: 'Failed to generate dissertation outline',
      message: error.message
    });
  }
});

/**
 * POST /api/research/assignment
 * Generate comprehensive assignment response from requirements document
 */
router.post('/assignment', async (req, res) => {
  try {
    console.log('Assignment request received:', {
      hasFile: !!req.files?.file,
      hasText: !!req.body?.assignmentText,
      contentType: req.headers['content-type']
    });

    // Check OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key not configured');
      return res.status(500).json({
        error: 'Server configuration error',
        message: 'OpenAI API key is not configured. Please contact the administrator.'
      });
    }

    let assignmentText = '';

    // If file is uploaded, parse it
    if (req.files && req.files.file) {
      const file = req.files.file;
      console.log('Processing uploaded file:', file.name, file.mimetype);
      
      // Use utility function to get upload directory (handles Vercel/serverless)
      const uploadDir = await ensureUploadDir();
      const filePath = path.join(uploadDir, `temp_${Date.now()}_${file.name}`);
      await file.mv(filePath);
      
      const parsedContent = await parseDocument(filePath, file.mimetype);
      assignmentText = parsedContent.text;
      
      await fs.unlink(filePath).catch(() => {});
    } else if (req.body.assignmentText) {
      // If text is provided directly
      assignmentText = req.body.assignmentText;
      console.log('Processing text input, length:', assignmentText.length);
    } else {
      return res.status(400).json({ 
        error: 'Assignment file or text is required' 
      });
    }

    if (!assignmentText.trim()) {
      return res.status(400).json({ 
        error: 'Assignment content cannot be empty' 
      });
    }

    console.log('Starting assignment generation...');
    const startTime = Date.now();
    
    const responseResult = await generateAssignmentResponse(assignmentText, {
      model: req.body.model || 'gpt-4-turbo-preview'
    });

    const duration = Date.now() - startTime;
    console.log('Assignment generation completed in', duration, 'ms');

    res.json({
      response: responseResult.response,
      wordCount: responseResult.wordCount,
      sections: responseResult.sections,
      model: responseResult.model
    });

  } catch (error) {
    console.error('Assignment response generation error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code
    });

    // Provide more detailed error information
    let errorMessage = 'Failed to generate assignment response';
    let statusCode = 500;

    if (error.message.includes('API key')) {
      errorMessage = 'OpenAI API key is not configured';
      statusCode = 500;
    } else if (error.message.includes('timeout') || error.code === 'ETIMEDOUT') {
      errorMessage = 'Request timeout. The assignment generation is taking too long. Please try with a shorter assignment brief.';
      statusCode = 504;
    } else if (error.message.includes('rate limit')) {
      errorMessage = 'Rate limit exceeded. Please try again in a few moments.';
      statusCode = 429;
    } else if (error.message) {
      errorMessage = error.message;
    }

    res.status(statusCode).json({
      error: errorMessage,
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * POST /api/research/assignment/download
 * Download assignment response as PDF or DOCX
 */
router.post('/assignment/download', async (req, res) => {
  try {
    const { content, format } = req.body;

    if (!content) {
      return res.status(400).json({ 
        error: 'Content is required' 
      });
    }

    if (!['pdf', 'docx'].includes(format)) {
      return res.status(400).json({ 
        error: 'Invalid format. Use "pdf" or "docx"' 
      });
    }

    let fileBuffer;
    let contentType;
    let fileName;

    if (format === 'pdf') {
      fileBuffer = await generatePDF(content, {});
      contentType = 'application/pdf';
      fileName = 'assignment_response.pdf';
    } else {
      fileBuffer = await generateDOCX(content, {});
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      fileName = 'assignment_response.docx';
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(fileBuffer);

  } catch (error) {
    console.error('Assignment download error:', error);
    res.status(500).json({ 
      error: 'Failed to generate download file',
      message: error.message 
    });
  }
});

export default router;
