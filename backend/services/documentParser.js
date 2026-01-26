import mammoth from 'mammoth';
import pdfParse from 'pdf-parse';
import fs from 'fs/promises';

export async function parseDocument(filePath, mimeType) {
  try {
    let text = '';
    let html = '';
    let metadata = {
      title: '',
      author: '',
      sections: [],
      wordCount: 0,
      pageCount: 0
    };

    if (mimeType === 'application/pdf' || filePath.endsWith('.pdf')) {
      // Parse PDF
      const dataBuffer = await fs.readFile(filePath);
      const pdfData = await pdfParse(dataBuffer);
      
      text = pdfData.text;
      html = convertTextToHTML(text);
      metadata.pageCount = pdfData.numpages;
      metadata.title = pdfData.info?.Title || extractTitle(text);
      metadata.author = pdfData.info?.Author || '';
      
    } else if (
      mimeType.includes('wordprocessingml') || 
      mimeType === 'application/msword' ||
      filePath.endsWith('.docx') ||
      filePath.endsWith('.doc')
    ) {
      // Parse Word document
      const dataBuffer = await fs.readFile(filePath);
      const result = await mammoth.extractRawText({ buffer: dataBuffer });
      const htmlResult = await mammoth.convertToHtml({ buffer: dataBuffer });
      
      text = result.value;
      html = htmlResult.value;
      metadata.title = extractTitle(text);
      
      // Extract sections from HTML
      metadata.sections = extractSections(html);
    }

    // Clean and process text
    text = cleanText(text);
    html = cleanHTML(html);
    
    // Calculate word count
    metadata.wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
    
    // Detect sections if not already extracted
    if (metadata.sections.length === 0) {
      metadata.sections = detectSections(text);
    }

    return {
      text,
      html,
      metadata
    };

  } catch (error) {
    console.error('Document parsing error:', error);
    throw new Error(`Failed to parse document: ${error.message}`);
  }
}

function convertTextToHTML(text) {
  // Convert plain text to basic HTML
  const paragraphs = text
    .split(/\n\s*\n/)
    .filter(p => p.trim().length > 0)
    .map(p => `<p>${escapeHTML(p.trim())}</p>`)
    .join('\n');
  
  return `<div>${paragraphs}</div>`;
}

function cleanText(text) {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function cleanHTML(html) {
  // Remove excessive whitespace
  return html
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><')
    .trim();
}

function extractTitle(text) {
  // Try to extract title from first line or first sentence
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  if (lines.length > 0) {
    const firstLine = lines[0].trim();
    if (firstLine.length < 200) {
      return firstLine;
    }
  }
  return 'Untitled Document';
}

function extractSections(html) {
  const sections = [];
  const headingRegex = /<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi;
  let match;
  
  while ((match = headingRegex.exec(html)) !== null) {
    sections.push({
      level: parseInt(match[0].match(/h([1-6])/)[1]),
      title: match[1].replace(/<[^>]+>/g, '').trim()
    });
  }
  
  return sections;
}

function detectSections(text) {
  const sections = [];
  const lines = text.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    // Detect potential headings (short lines, all caps, numbered, etc.)
    if (line.length > 0 && line.length < 100 && 
        (line.match(/^[A-Z][A-Z\s]+$/) || 
         line.match(/^\d+\.?\s+[A-Z]/) ||
         line.match(/^[A-Z][^.!?]+$/))) {
      sections.push({
        level: line.match(/^\d+/) ? 1 : 2,
        title: line
      });
    }
  }
  
  return sections;
}

function escapeHTML(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}
