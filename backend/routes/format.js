import express from 'express';
import { formatDocument } from '../services/documentFormatter.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { content, formatType } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const formattedResult = await formatDocument({
      text: content,
      html: content
    }, formatType);

    res.json({
      formattedContent: formattedResult.html,
      summary: formattedResult.summary
    });

  } catch (error) {
    console.error('Format error:', error);
    res.status(500).json({ 
      error: 'Failed to format document',
      message: error.message 
    });
  }
});

export default router;
