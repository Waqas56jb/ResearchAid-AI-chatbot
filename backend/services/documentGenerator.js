// Use puppeteer-core for Vercel compatibility (doesn't bundle Chromium)
import puppeteer from 'puppeteer-core';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import fs from 'fs/promises';

export async function generatePDF(htmlContent, metadata = {}) {
  const isVercel = process.env.VERCEL || process.env.VERCEL_ENV;
  
  // Try Puppeteer first, fallback to Playwright, then PDFKit
  try {
    return await generatePDFWithPuppeteer(htmlContent, metadata, isVercel);
  } catch (puppeteerError) {
    // If Puppeteer fails with system library error, try Playwright
    if (puppeteerError.message && (puppeteerError.message.includes('libnss3.so') || puppeteerError.message.includes('shared libraries'))) {
      console.log('Puppeteer failed with system library error, trying Playwright...');
      try {
        return await generatePDFWithPlaywright(htmlContent, metadata, isVercel);
      } catch (playwrightError) {
        console.log('Playwright also failed, using PDFKit fallback...');
        // Final fallback: Use PDFKit (pure Node.js, no browser needed)
        return await generatePDFWithPDFKit(htmlContent, metadata);
      }
    }
    throw puppeteerError;
  }
}

async function generatePDFWithPuppeteer(htmlContent, metadata = {}, isVercel = false) {
  let browser = null;
  try {
    
    const launchOptions = {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    };

    // For Vercel, MUST use @sparticuz/chromium
    if (isVercel) {
      try {
        // Import @sparticuz/chromium (default export)
        const chromiumModule = await import('@sparticuz/chromium');
        const chromium = chromiumModule.default || chromiumModule;
        
        // Check if chromium is available
        if (!chromium) {
          throw new Error('@sparticuz/chromium import returned null/undefined');
        }
        
        // Set graphics mode to false (required for serverless)
        if (typeof chromium.setGraphicsMode === 'function') {
          chromium.setGraphicsMode(false);
        }
        
        // Get executable path
        if (typeof chromium.executablePath === 'function') {
          launchOptions.executablePath = await chromium.executablePath();
        } else if (typeof chromium.executablePath === 'string') {
          launchOptions.executablePath = chromium.executablePath;
        } else {
          throw new Error('chromium.executablePath is not available');
        }
        
        // Use chromium's optimized args for serverless (CRITICAL for Vercel)
        if (chromium.args && Array.isArray(chromium.args)) {
          launchOptions.args = [...chromium.args];
        } else {
          // Fallback args if chromium.args is not available
          launchOptions.args = [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu',
            '--disable-software-rasterizer',
            '--disable-extensions',
            '--disable-background-networking',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-breakpad',
            '--disable-client-side-phishing-detection',
            '--disable-component-update',
            '--disable-default-apps',
            '--disable-features=TranslateUI',
            '--disable-hang-monitor',
            '--disable-ipc-flooding-protection',
            '--disable-popup-blocking',
            '--disable-prompt-on-repost',
            '--disable-renderer-backgrounding',
            '--disable-sync',
            '--disable-translate',
            '--metrics-recording-only',
            '--mute-audio',
            '--no-default-browser-check',
            '--no-pings',
            '--use-mock-keychain',
            '--hide-scrollbars',
            '--ignore-certificate-errors',
            '--ignore-ssl-errors',
            '--ignore-certificate-errors-spki-list'
          ];
        }
        
        // Additional Vercel-specific configuration
        launchOptions.ignoreHTTPSErrors = true;
        launchOptions.headless = true;
        
        console.log('Using @sparticuz/chromium for Vercel');
        console.log('Executable path:', launchOptions.executablePath);
        console.log('Args count:', launchOptions.args.length);
      } catch (chromiumError) {
        console.error('CRITICAL: @sparticuz/chromium import/usage failed:');
        console.error('Error name:', chromiumError.name);
        console.error('Error message:', chromiumError.message);
        console.error('Error code:', chromiumError.code);
        console.error('Error stack:', chromiumError.stack);
        console.error('Is Vercel:', isVercel);
        console.error('VERCEL env:', process.env.VERCEL);
        console.error('VERCEL_ENV:', process.env.VERCEL_ENV);
        throw new Error(`PDF generation requires @sparticuz/chromium on Vercel. Error: ${chromiumError.message}`);
      }
    } else {
      // For local development, try to get Chromium path from puppeteer if available
      try {
        const puppeteerFull = await import('puppeteer');
        // Get the executable path from puppeteer
        const executablePath = puppeteerFull.executablePath();
        if (executablePath) {
          launchOptions.executablePath = executablePath;
          console.log('Using local Puppeteer Chromium');
        }
      } catch (localError) {
        console.warn('Local puppeteer not available, will try system Chrome or default path');
      }
    }

    console.log('Launching Puppeteer browser...', { 
      isVercel, 
      hasExecutablePath: !!launchOptions.executablePath 
    });
    
    if (!launchOptions.executablePath && !isVercel) {
      throw new Error('Chromium executable path not found. For local development, install puppeteer: npm install puppeteer');
    }
    
    browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();
    
    // Convert markdown to HTML if needed
    let html = typeof htmlContent === 'string' ? htmlContent : htmlContent.toString();
    
    // Convert markdown to HTML
    html = convertMarkdownToHTML(html);
    
    // Set content with proper styling
    const fullHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            @page {
              margin: 2.5cm;
            }
            body {
              font-family: 'Times New Roman', serif;
              font-size: 12pt;
              line-height: 1.6;
              color: #000;
              max-width: 100%;
              margin: 0;
              padding: 0;
            }
            h1 { 
              font-family: 'Times New Roman', serif;
              font-size: 26pt; 
              font-weight: bold; 
              text-align: left; 
              margin-top: 35px;
              margin-bottom: 20px;
              padding-left: 0;
            }
            h2 { 
              font-family: 'Times New Roman', serif;
              font-size: 18pt; 
              font-weight: bold; 
              margin-top: 28px; 
              margin-bottom: 18px;
              padding-left: 0;
            }
            h3 { 
              font-family: 'Times New Roman', serif;
              font-size: 16pt; 
              font-weight: bold; 
              margin-top: 20px; 
              margin-bottom: 12px;
              padding-left: 0;
            }
            h4 { 
              font-family: 'Times New Roman', serif;
              font-size: 14pt; 
              font-weight: bold; 
              margin-top: 16px; 
              margin-bottom: 10px;
              padding-left: 0;
            }
            p { 
              text-align: justify; 
              margin-bottom: 12px; 
              text-indent: 0;
              line-height: 1.6;
            }
            ul, ol {
              margin-left: 30px;
              margin-bottom: 12px;
            }
            li {
              margin-bottom: 6px;
            }
            strong {
              font-weight: bold;
            }
            code {
              background-color: #f5f5f5;
              padding: 2px 4px;
              border-radius: 3px;
              font-family: 'Courier New', monospace;
              font-size: 10pt;
            }
            pre {
              background-color: #f5f5f5;
              padding: 12px;
              border-radius: 4px;
              overflow-x: auto;
              margin: 12px 0;
              font-family: 'Courier New', monospace;
              font-size: 10pt;
            }
            .toc {
              page-break-after: always;
              margin-bottom: 40px;
              padding: 30px 20px;
            }
            .toc h1 {
              margin-bottom: 30px;
              text-align: center;
              font-size: 18pt;
              font-weight: bold;
            }
            .toc-entry {
              margin-bottom: 12px;
              text-align: left;
              line-height: 2.0;
              page-break-inside: avoid;
            }
            .toc-title {
              display: inline-block;
            }
            .toc-dots {
              display: inline-block;
              margin: 0 8px;
              color: #999;
              min-width: 20px;
            }
            .toc-page {
              float: right;
              margin-left: 10px;
              color: #666;
            }
            .document-title {
              text-align: center;
              font-size: 22pt;
              font-weight: bold;
              margin-top: 0;
              margin-bottom: 30px;
              line-height: 1.4;
              page-break-after: avoid;
            }
            .document-title {
              text-align: center;
              font-size: 22pt;
              font-weight: bold;
              margin-top: 0;
              margin-bottom: 30px;
              line-height: 1.4;
              page-break-after: avoid;
            }
            .abstract-heading {
              font-size: 18pt;
              font-weight: bold;
              text-align: left;
              margin-top: 30px;
              margin-bottom: 20px;
            }
            h1.numbered-heading {
              font-family: 'Times New Roman', serif;
              font-size: 26pt;
              font-weight: bold;
              margin-top: 35px;
              margin-bottom: 20px;
              text-align: left;
              padding-left: 0;
            }
            h2.numbered-heading {
              font-family: 'Times New Roman', serif;
              font-size: 18pt;
              font-weight: bold;
              margin-top: 28px;
              margin-bottom: 18px;
              text-align: left;
              padding-left: 0;
            }
            h3.numbered-heading {
              font-family: 'Times New Roman', serif;
              font-size: 16pt;
              font-weight: bold;
              margin-top: 20px;
              margin-bottom: 12px;
              text-align: left;
              padding-left: 0;
            }
            h4.numbered-heading {
              font-family: 'Times New Roman', serif;
              font-size: 14pt;
              font-weight: bold;
              margin-top: 16px;
              margin-bottom: 10px;
              text-align: left;
              padding-left: 0;
            }
            .flowchart-box {
              display: inline-block;
              background-color: #e8f4f8;
              border: 1px solid #4a90e2;
              padding: 4px 8px;
              margin: 2px;
              border-radius: 3px;
              font-family: 'Courier New', monospace;
            }
            .flowchart-arrow {
              text-align: center;
              font-size: 16pt;
              margin: 5px 0;
              color: #4a90e2;
            }
            .flowchart-arrow-inline {
              color: #4a90e2;
              font-weight: bold;
              margin: 0 5px;
            }
            .reference-entry {
              text-align: left;
              margin-left: 20px;
              text-indent: -20px;
              padding-left: 20px;
              margin-bottom: 10px;
              font-weight: normal !important;
              font-family: 'Times New Roman', serif;
              cursor: pointer;
              transition: background-color 0.2s ease;
            }
            .reference-entry:hover {
              background-color: #f0f0f0;
            }
            .reference-entry strong {
              font-weight: normal !important;
            }
            p {
              font-weight: normal !important;
            }
            p strong {
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `;

    await page.setContent(fullHTML, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '25mm',
        right: '25mm',
        bottom: '25mm',
        left: '25mm'
      }
    });

    await browser.close();
    return pdfBuffer;

  } catch (error) {
    console.error('Puppeteer PDF generation error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Ensure browser is closed even on error
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('Error closing browser:', closeError);
      }
    }
    
    throw error; // Re-throw to allow fallback
  }
}

async function generatePDFWithPlaywright(htmlContent, metadata = {}, isVercel = false) {
  let browser = null;
  try {
    const { chromium } = await import('playwright-core');
    
    // Convert markdown to HTML if needed
    let html = typeof htmlContent === 'string' ? htmlContent : htmlContent.toString();
    html = convertMarkdownToHTML(html);
    
    // Set content with proper styling (same as Puppeteer version)
    const fullHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            @page {
              margin: 2.5cm;
            }
            body {
              font-family: 'Times New Roman', serif;
              font-size: 12pt;
              line-height: 1.6;
              color: #000;
              max-width: 100%;
              margin: 0;
              padding: 0;
            }
            h1 { 
              font-family: 'Times New Roman', serif;
              font-size: 26pt; 
              font-weight: bold; 
              text-align: left; 
              margin-top: 35px;
              margin-bottom: 20px;
              padding-left: 0;
            }
            h2 { 
              font-family: 'Times New Roman', serif;
              font-size: 18pt; 
              font-weight: bold; 
              margin-top: 28px; 
              margin-bottom: 18px;
              padding-left: 0;
            }
            h3 { 
              font-family: 'Times New Roman', serif;
              font-size: 16pt; 
              font-weight: bold; 
              margin-top: 20px; 
              margin-bottom: 12px;
              padding-left: 0;
            }
            h4 { 
              font-family: 'Times New Roman', serif;
              font-size: 14pt; 
              font-weight: bold; 
              margin-top: 16px; 
              margin-bottom: 10px;
              padding-left: 0;
            }
            p { 
              text-align: justify; 
              margin-bottom: 12px; 
              text-indent: 0;
              line-height: 1.6;
            }
            ul, ol {
              margin-left: 30px;
              margin-bottom: 12px;
            }
            li {
              margin-bottom: 6px;
            }
            strong {
              font-weight: bold;
            }
            code {
              background-color: #f5f5f5;
              padding: 2px 4px;
              border-radius: 3px;
              font-family: 'Courier New', monospace;
              font-size: 10pt;
            }
            pre {
              background-color: #f5f5f5;
              padding: 12px;
              border-radius: 4px;
              overflow-x: auto;
              margin: 12px 0;
              font-family: 'Courier New', monospace;
              font-size: 10pt;
            }
            .reference-entry {
              text-align: left;
              margin-left: 20px;
              text-indent: -20px;
              padding-left: 20px;
              margin-bottom: 10px;
              font-weight: normal !important;
              font-family: 'Times New Roman', serif;
            }
            .reference-entry:hover {
              background-color: #f0f0f0;
            }
          </style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `;

    // For Vercel, use @playwright/browser-chromium
    let launchOptions = {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    };

    if (isVercel) {
      try {
        const chromiumBrowser = await import('@playwright/browser-chromium');
        launchOptions.executablePath = chromiumBrowser.executablePath();
        console.log('Using @playwright/browser-chromium for Vercel');
      } catch (e) {
        console.warn('@playwright/browser-chromium not available, using default');
      }
    }

    browser = await chromium.launch(launchOptions);
    const page = await browser.newPage();
    await page.setContent(fullHTML, { waitUntil: 'networkidle' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '25mm',
        right: '25mm',
        bottom: '25mm',
        left: '25mm'
      }
    });

    await browser.close();
    return pdfBuffer;

  } catch (error) {
    console.error('Playwright PDF generation error:', error);
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('Error closing browser:', closeError);
      }
    }
    throw error;
  }
}

async function generatePDFWithPDFKit(htmlContent, metadata = {}) {
  return new Promise(async (resolve, reject) => {
    try {
      // Dynamic import for PDFKit (CommonJS module)
      const pdfkitModule = await import('pdfkit');
      const PDFDocument = pdfkitModule.default || pdfkitModule;
      
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 70, bottom: 70, left: 70, right: 70 }
      });
      
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);
      
      // Convert HTML/markdown to plain text for PDFKit
      let content = typeof htmlContent === 'string' ? htmlContent : htmlContent.toString();
      
      // Remove Table of Contents
      content = content.replace(/^# Table of Contents[\s\S]*?---/gim, '');
      content = content.replace(/^Table of Contents[\s\S]*?---/gim, '');
      
      // Remove extra dashes
      content = content.replace(/^---+$/gm, '');
      content = content.replace(/^--+$/gm, '');
      
      // Process markdown headings and content
      const lines = content.split('\n');
      let currentParagraph = [];
      
      doc.font('Times-Roman').fontSize(12);
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (!line) {
          if (currentParagraph.length > 0) {
            // Output accumulated paragraph
            const paragraphText = currentParagraph.join(' ').trim();
            if (paragraphText) {
              doc.fontSize(12).font('Times-Roman');
              doc.text(paragraphText, { 
                align: 'justify',
                lineGap: 2
              });
              doc.moveDown(0.5);
            }
            currentParagraph = [];
          }
          continue;
        }
        
        // Detect headings (numbered headings like "1. Introduction" or "# Heading")
        const headingMatch = line.match(/^(\d+\.\s*)(.+)$/) || line.match(/^#{1,6}\s+(.+)$/);
        if (headingMatch) {
          // Output any accumulated paragraph first
          if (currentParagraph.length > 0) {
            const paragraphText = currentParagraph.join(' ').trim();
            if (paragraphText) {
              doc.fontSize(12).font('Times-Roman');
              doc.text(paragraphText, { align: 'justify', lineGap: 2 });
              doc.moveDown(0.5);
            }
            currentParagraph = [];
          }
          
          // Output heading
          const headingText = headingMatch[2] || headingMatch[1];
          const headingLevel = line.match(/^#+/)?.[0]?.length || (line.match(/^\d+\./) ? 1 : 1);
          const fontSize = headingLevel === 1 ? 18 : headingLevel === 2 ? 16 : 14;
          
          doc.fontSize(fontSize).font('Times-Bold');
          doc.text(headingText.trim(), { align: 'left' });
          doc.moveDown(0.5);
          doc.fontSize(12).font('Times-Roman');
        } else {
          // Regular text - remove markdown formatting
          let cleanLine = line
            .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
            .replace(/\*([^*]+)\*/g, '$1') // Remove italic (but preserve in references)
            .replace(/`([^`]+)`/g, '$1') // Remove code
            .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1'); // Remove links
          
          currentParagraph.push(cleanLine);
        }
      }
      
      // Output any remaining paragraph
      if (currentParagraph.length > 0) {
        const paragraphText = currentParagraph.join(' ').trim();
        if (paragraphText) {
          doc.fontSize(12).font('Times-Roman');
          doc.text(paragraphText, { align: 'justify', lineGap: 2 });
        }
      }
      
      doc.end();
    } catch (error) {
      console.error('PDFKit generation error:', error);
      reject(new Error(`PDFKit generation failed: ${error.message}`));
    }
  });
}

function convertMarkdownToHTML(markdown) {
  let html = markdown;
  
  // Remove extra dashes and lines
  html = html.replace(/^---+$/gim, '');
  html = html.replace(/^--+$/gim, '');
  
  // Remove Table of Contents section completely - no TOC needed
  html = html.replace(/^# Table of Contents[\s\S]*?---/gim, '');
  html = html.replace(/^Table of Contents[\s\S]*?---/gim, '');
  html = html.replace(/^## Table of Contents[\s\S]*?---/gim, '');
  html = html.replace(/^### Table of Contents[\s\S]*?---/gim, '');
  
  // Check if this is a critique (has structured sections like "Summary of Main Arguments:", "Strengths:", etc.)
  const isCritique = html.match(/\*\*Summary of Main Arguments:\*\*/) || 
                     html.match(/\*\*Strengths:\*\*/) || 
                     html.match(/\*\*Weaknesses/) ||
                     html.match(/\*\*Critical Analysis:\*\*/) ||
                     html.match(/\*\*Suggestions for Improvement:\*\*/);
  
  // Check if this is a dissertation outline (has hierarchical numbered structure like "1.", "1.1", "1.1.1")
  // CRITICAL: Make detection VERY strict - ONLY trigger for actual dissertation outline requests
  // NEVER trigger for assignment responses - they have different structure
  // Assignment responses have: Requirements Analysis, System Architecture, Implementation, Testing, Deployment, Evaluation, Conclusion, References
  // Dissertation outlines have: Abstract, Chapter 1: Introduction, Chapter 2: Literature Review, etc.
  const hasAssignmentKeywords = html.match(/Requirements Analysis|System Architecture|Implementation|Testing|Deployment|Evaluation|Assignment Response|Assignment Brief/i);
  const hasDissertationKeywords = html.match(/Chapter\s+\d+:|Dissertation Outline|Dissertation Topic|Research Field/i);
  
  // ONLY detect as dissertation outline if:
  // 1. It has dissertation-specific keywords AND
  // 2. It does NOT have assignment-specific keywords AND
  // 3. It has hierarchical structure (1.1, 1.2, etc.) OR explicit "Dissertation Outline" text
  const isDissertationOutline = !hasAssignmentKeywords && 
                                hasDissertationKeywords && 
                                (html.match(/^\d+\.\d+\s+/m) || html.match(/Dissertation Outline:/i) || html.match(/Chapter\s+\d+:/i));
  
  // Check if this is research questions (has numbered questions like "1. Question text..." or "1. **Question:**")
  const isResearchQuestions = html.match(/^\d+\.\s+[A-Z][^0-9]{20,}/m) && 
                              !html.match(/^\d+\.\s+[A-Z][a-z]+,\s*\d{4}/m) && // Not references
                              html.length < 10000 && // Typically shorter than full assignments
                              !html.match(/^\d+\.\d+\s+/m) && // Not hierarchical outline
                              !isDissertationOutline; // Not a dissertation outline
  
  // Check if this is a summary - simple paragraph-based overview without structured format
  // Summaries should NOT have: numbered headings (1., 2.), markdown headers (#), structured labels (**Title:**), or numbered lists
  const hasNumberedHeadings = html.match(/^\d+\.\s+[A-Z]/m);
  const hasMarkdownHeaders = html.match(/^#+\s+/m);
  const hasStructuredLabels = html.match(/^\*\*[A-Z][A-Za-z\s/]+:\*\*/m);
  const hasNumberedLists = html.match(/^\d+\.\s+[a-z]/m);
  const isShortContent = html.length < 5000;
  
  // It's a summary if it's short, has no structured elements, and is just paragraphs (but not a critique, research questions, or outline)
  const isSummary = isShortContent && !hasNumberedHeadings && !hasMarkdownHeaders && !hasStructuredLabels && !hasNumberedLists && !isCritique && !isResearchQuestions && !isDissertationOutline;
  
  if (isSummary) {
    // For summaries, format as simple paragraphs only - skip all structured formatting
    // Remove any numbered lists, bullets, or structured elements that might have been added
    html = html.replace(/^\d+\.\s+/gm, ''); // Remove numbered list items
    html = html.replace(/^[\*\-\+]\s+/gm, ''); // Remove bullet points
    html = html.replace(/\*\*([^*]+)\*\*/g, '$1'); // Remove bold markdown
    html = html.replace(/(?<!\*)\*(?!\*)([^*\n]+?)(?<!\*)\*(?!\*)/g, '$1'); // Remove italic markdown
    
    // Split into paragraphs and format simply
    const summaryParagraphs = html.split(/\n\n+/).filter(p => {
      const trimmed = p.trim();
      return trimmed.length > 0;
    });
    
    const formattedParagraphs = summaryParagraphs.map(para => {
      const cleanPara = para.trim().replace(/\n/g, ' ').replace(/\s+/g, ' ');
      // Format as simple paragraph
      if (cleanPara.length > 0) {
        return `<p style="font-family: 'Times New Roman', serif; font-size: 12pt; text-align: justify; line-height: 1.6; margin-bottom: 15px;">${cleanPara}</p>`;
      }
      return '';
    }).filter(p => p.length > 0);
    
    // Add the Project Summary heading at the very top, before all paragraphs
    html = '<h1 class="document-title" style="text-align: center; font-family: \'Times New Roman\', serif; font-size: 22pt; font-weight: bold; margin-top: 0; margin-bottom: 30px; line-height: 1.4;">Project Summary</h1>\n\n' + formattedParagraphs.join('\n');
    
    // Return early for summaries - skip all other formatting
    return html;
  }
  
  // Handle critique format - convert structured sections to headings
  if (isCritique) {
    // Add title at the top
    html = '<h1 class="document-title" style="text-align: center; font-family: \'Times New Roman\', serif; font-size: 22pt; font-weight: bold; margin-top: 0; margin-bottom: 30px; line-height: 1.4;">Argument Critique</h1>\n\n' + html;
    
    // Process line by line to handle critique structure properly
    const critiqueLines = html.split('\n');
    const formattedLines = [];
    
    for (let i = 0; i < critiqueLines.length; i++) {
      const line = critiqueLines[i].trim();
      const originalLine = critiqueLines[i];
      
      // Skip empty lines
      if (!line) {
        continue;
      }
      
      // Check if it's a main section heading (e.g., **Summary of Main Arguments:**)
      const sectionMatch = line.match(/^\*\*([A-Z][A-Za-z\s/]+):\*\*\s*(.*)$/);
      if (sectionMatch) {
        const [, label, content] = sectionMatch;
        // Convert to h2 heading
        formattedLines.push(`<h2 style="font-family: 'Times New Roman', serif; font-size: 18pt; font-weight: bold; margin-top: 28px; margin-bottom: 18px; text-align: left; padding-left: 0;">${label}</h2>`);
        
        // If there's content on the same line, add it as a paragraph
        if (content && content.trim()) {
          formattedLines.push(`<p style="font-family: 'Times New Roman', serif; font-size: 12pt; text-align: justify; line-height: 1.6; margin-bottom: 12px;">${content.trim()}</p>`);
        }
        continue;
      }
      
      // Check if it's a numbered list item (e.g., "1. **Comprehensive Scope:** text")
      const numberedMatch = line.match(/^(\d+\.)\s+\*\*([^*]+)\*\*:\s*(.+)$/);
      if (numberedMatch) {
        const [, number, title, content] = numberedMatch;
        formattedLines.push(`<p style="font-family: 'Times New Roman', serif; font-size: 12pt; margin-bottom: 10px; text-align: justify; margin-left: 20px; line-height: 1.6; text-indent: -10px; padding-left: 30px;"><strong style="font-weight: bold;">${number} ${title}:</strong> ${content.trim()}</p>`);
        continue;
      }
      
      // Check if it's already formatted (heading or paragraph)
      if (line.match(/^<h[12]/) || line.match(/^<p/)) {
        formattedLines.push(originalLine);
        continue;
      }
      
      // Format as regular paragraph (remove any remaining markdown)
      if (line.length > 0) {
        const cleanLine = line.replace(/\*\*/g, '').replace(/(?<!\*)\*(?!\*)([^*\n]+?)(?<!\*)\*(?!\*)/g, '$1');
        formattedLines.push(`<p style="font-family: 'Times New Roman', serif; font-size: 12pt; text-align: justify; line-height: 1.6; margin-bottom: 12px;">${cleanLine}</p>`);
      }
    }
    
    html = formattedLines.join('\n');
    return html;
  }
  
  // Handle research questions format - format numbered questions properly
  if (isResearchQuestions) {
    // Add title at the top
    html = '<h1 class="document-title" style="text-align: center; font-family: \'Times New Roman\', serif; font-size: 22pt; font-weight: bold; margin-top: 0; margin-bottom: 30px; line-height: 1.4;">Research Questions</h1>\n\n' + html;
    
    // Process line by line to handle research questions structure
    const questionLines = html.split('\n');
    const formattedLines = [];
    
    for (let i = 0; i < questionLines.length; i++) {
      const line = questionLines[i].trim();
      const originalLine = questionLines[i];
      
      // Skip empty lines
      if (!line) {
        continue;
      }
      
      // Check if it's already formatted (heading)
      if (line.match(/^<h1/)) {
        formattedLines.push(originalLine);
        continue;
      }
      
      // Check if it's a numbered question (e.g., "1. What is the impact of...")
      const questionMatch = line.match(/^(\d+\.)\s+(.+)$/);
      if (questionMatch) {
        const [, number, questionText] = questionMatch;
        // Remove any bold markdown from question text
        const cleanQuestion = questionText.replace(/\*\*/g, '').replace(/\*/g, '').trim();
        // Format as paragraph with proper indentation
        formattedLines.push(`<p style="font-family: 'Times New Roman', serif; font-size: 12pt; margin-bottom: 15px; text-align: justify; margin-left: 20px; line-height: 1.6; text-indent: -10px; padding-left: 30px;"><strong style="font-weight: bold;">${number}</strong> ${cleanQuestion}</p>`);
        continue;
      }
      
      // Check if it's a question with bold label (e.g., "1. **Question:** text")
      const questionWithLabelMatch = line.match(/^(\d+\.)\s+\*\*([^*]+):\*\*\s*(.+)$/);
      if (questionWithLabelMatch) {
        const [, number, label, questionText] = questionWithLabelMatch;
        formattedLines.push(`<p style="font-family: 'Times New Roman', serif; font-size: 12pt; margin-bottom: 15px; text-align: justify; margin-left: 20px; line-height: 1.6; text-indent: -10px; padding-left: 30px;"><strong style="font-weight: bold;">${number} ${label}:</strong> ${questionText.trim()}</p>`);
        continue;
      }
      
      // Check if it's already formatted as paragraph
      if (line.match(/^<p/)) {
        formattedLines.push(originalLine);
        continue;
      }
      
      // Format as regular paragraph (remove any remaining markdown)
      if (line.length > 0) {
        const cleanLine = line.replace(/\*\*/g, '').replace(/(?<!\*)\*(?!\*)([^*\n]+?)(?<!\*)\*(?!\*)/g, '$1');
        formattedLines.push(`<p style="font-family: 'Times New Roman', serif; font-size: 12pt; text-align: justify; line-height: 1.6; margin-bottom: 12px;">${cleanLine}</p>`);
      }
    }
    
    html = formattedLines.join('\n');
    return html;
  }
  
  // Handle dissertation outline format - format hierarchical structure properly
  if (isDissertationOutline) {
    // First, remove the title line if it exists (e.g., "**Dissertation Outline: ...**")
    html = html.replace(/^\*\*Dissertation Outline:[^*]+\*\*\s*/gim, '');
    html = html.replace(/^Dissertation Outline:[^\n]+\n/gim, '');
    
    // Remove ALL markdown asterisks globally from the entire content BEFORE processing
    html = html.replace(/\*\*/g, '').replace(/\*/g, '');
    
    // Add title at the top
    html = '<h1 class="document-title" style="text-align: center; font-family: \'Times New Roman\', serif; font-size: 22pt; font-weight: bold; margin-top: 0; margin-bottom: 30px; line-height: 1.4;">Dissertation Outline</h1>\n\n' + html;
    
    // Process line by line to handle hierarchical outline structure
    const outlineLines = html.split('\n');
    const formattedLines = [];
    let skipNextIfNumbered = false; // Flag to skip incorrectly numbered items at start
    
    for (let i = 0; i < outlineLines.length; i++) {
      let line = outlineLines[i].trim();
      const originalLine = outlineLines[i];
      
      // Skip empty lines
      if (!line) {
        continue;
      }
      
      // Check if it's already formatted (heading)
      if (line.match(/^<h1/)) {
        formattedLines.push(originalLine);
        continue;
      }
      
      // Remove any remaining markdown or special characters (double-check)
      line = line.replace(/\*\*/g, '').replace(/\*/g, '').trim();
      
      // Skip lines that are just numbers
      if (line.match(/^\d+\.?\s*$/)) {
        continue;
      }
      
      // Skip the title line if it says "Dissertation Outline:" (already have title at top)
      if (line.match(/^Dissertation Outline:/i) && i < 5) {
        continue;
      }
      
      // Check if it's a chapter heading with "Chapter X:" format (e.g., "Chapter 1: Introduction")
      // This pattern should be checked early
      const chapterHeadingMatch = line.match(/^(Chapter\s+\d+:\s+.+)$/i);
      if (chapterHeadingMatch) {
        formattedLines.push(`<h2 style="font-family: 'Times New Roman', serif; font-size: 18pt; font-weight: bold; margin-top: 28px; margin-bottom: 18px; text-align: left; padding-left: 0;">${chapterHeadingMatch[1]}</h2>`);
        continue;
      }
      
      // Check if it's a standalone section label (e.g., "Abstract", "Introduction", "Conclusion", "References")
      // These should be on their own line
      const standaloneLabelMatch = line.match(/^(Abstract|Introduction|Conclusion|References)$/i);
      if (standaloneLabelMatch && line.length < 30) {
        formattedLines.push(`<h2 style="font-family: 'Times New Roman', serif; font-size: 18pt; font-weight: bold; margin-top: 28px; margin-bottom: 18px; text-align: left; padding-left: 0;">${standaloneLabelMatch[1]}</h2>`);
        continue;
      }
      
      // Check if it's a numbered list item with space before period (e.g., "7 . Brief overview")
      // These should be formatted as list items, NOT headings - check this FIRST before main chapters
      const listItemWithSpaceMatch = line.match(/^(\d+)\s+\.\s+(.+)$/);
      if (listItemWithSpaceMatch) {
        const [, number, content] = listItemWithSpaceMatch;
        const cleanContent = content.trim();
        formattedLines.push(`<p style="font-family: 'Times New Roman', serif; font-size: 12pt; margin-bottom: 10px; text-align: justify; margin-left: 30px; line-height: 1.6; text-indent: -15px; padding-left: 45px;">${number}. ${cleanContent}</p>`);
        continue;
      }
      
      // Check if it's a main chapter heading (e.g., "1. Introduction", "2. Chapter 1: Literature Review")
      // Pattern: starts with number, period (NO space), then text
      const mainChapterMatch = line.match(/^(\d+)\.\s+(.+)$/);
      if (mainChapterMatch) {
        const [, number, title] = mainChapterMatch;
        const cleanTitle = title.trim();
        
        // Skip if it's the title line that was incorrectly numbered (e.g., "7. Dissertation Outline:")
        if (i < 3 && cleanTitle.match(/^Dissertation Outline:/i)) {
          continue;
        }
        
        // Check if it looks like a main chapter (has "Chapter" or is a major section, or is long enough)
        if (cleanTitle.match(/^(Chapter\s+\d+|Abstract|Introduction|Literature Review|Methodology|Results|Discussion|Conclusion|References)/i) || 
            (cleanTitle.length > 15 && !cleanTitle.match(/^\d+\./))) {
          formattedLines.push(`<h2 style="font-family: 'Times New Roman', serif; font-size: 18pt; font-weight: bold; margin-top: 28px; margin-bottom: 18px; text-align: left; padding-left: 0;">${number}. ${cleanTitle}</h2>`);
          continue;
        }
      }
      
      // Check if it's a hierarchical numbered heading (e.g., "1.1", "1.1.1", "2.1", etc.)
      const hierarchicalMatch = line.match(/^(\d+(?:\.\d+)+)\s+(.+)$/);
      if (hierarchicalMatch) {
        const [, number, title] = hierarchicalMatch;
        const level = number.split('.').length;
        const headingTag = Math.min(level, 4);
        
        // Determine font size based on level
        const fontSize = level === 2 ? '16pt' : level === 3 ? '14pt' : '12pt';
        const marginTop = level === 2 ? '22px' : level === 3 ? '18px' : '15px';
        const marginBottom = level === 2 ? '15px' : level === 3 ? '12px' : '10px';
        
        const cleanTitle = title.trim();
        
        formattedLines.push(`<h${headingTag} style="font-family: 'Times New Roman', serif; font-size: ${fontSize}; font-weight: bold; margin-top: ${marginTop}; margin-bottom: ${marginBottom}; text-align: left; padding-left: 0;">${number} ${cleanTitle}</h${headingTag}>`);
        continue;
      }
      
      // Check if it's a bullet list item (e.g., "- Planning and preparation" or "• Planning")
      const bulletItemMatch = line.match(/^[-•]\s+(.+)$/);
      if (bulletItemMatch) {
        const [, content] = bulletItemMatch;
        const cleanContent = content.trim();
        // Split if there are multiple items separated by " - " in the same line
        // Use a regex that splits on " - " followed by a capital letter (new item) but not " - " in the middle of a phrase
        const items = cleanContent.split(/\s+-\s+(?=[A-Z][a-z])/);
        if (items.length > 1) {
          items.forEach(item => {
            const trimmed = item.trim();
            if (trimmed && trimmed.length > 2) {
              formattedLines.push(`<p style="font-family: 'Times New Roman', serif; font-size: 12pt; margin-bottom: 10px; text-align: justify; margin-left: 30px; line-height: 1.6; text-indent: -15px; padding-left: 45px;">• ${trimmed}</p>`);
            }
          });
        } else {
          formattedLines.push(`<p style="font-family: 'Times New Roman', serif; font-size: 12pt; margin-bottom: 10px; text-align: justify; margin-left: 30px; line-height: 1.6; text-indent: -15px; padding-left: 45px;">• ${cleanContent}</p>`);
        }
        continue;
      }
      
      // Check if it's already formatted as paragraph or heading
      if (line.match(/^<p/) || line.match(/^<h/)) {
        formattedLines.push(originalLine);
        continue;
      }
      
      // Format as regular paragraph
      if (line.length > 0) {
        const cleanLine = line.trim();
        // Skip if it's just a number or very short
        if (cleanLine.match(/^\d+\.?\s*$/) || cleanLine.length < 3) {
          continue;
        }
        formattedLines.push(`<p style="font-family: 'Times New Roman', serif; font-size: 12pt; text-align: justify; line-height: 1.6; margin-bottom: 12px;">${cleanLine}</p>`);
      }
    }
    
    html = formattedLines.join('\n');
    return html;
  }
  
  // Format document title (first line that looks like a title - long, capitalized, contains "AI" or project name)
  html = html.replace(/^(ResearchAid AI[^\n]+(?:Support|Assistant|Analysis)[^\n]*)$/gim, (match) => {
    return `<h1 class="document-title" style="text-align: center; font-family: 'Times New Roman', serif; font-size: 22pt; font-weight: bold; margin-top: 0; margin-bottom: 30px; line-height: 1.4;">${match.trim()}</h1>`;
  });
  
  // Abstract (special handling) - must be on its own line
  html = html.replace(/^Abstract\s*$/gim, '<h1 class="abstract-heading" style="font-family: \'Times New Roman\', serif;">Abstract</h1>');
  
  // First, clean up markdown bold from headings (remove **text** from numbered headings)
  // Also handle cases like "9. \*Conclusions:**" - remove all markdown asterisks
  // Process numbered headings more comprehensively
  html = html.replace(/^(\d+(?:\.\d+)*)\s+([^\n]+)$/gim, (match, number, title) => {
    // Skip if already formatted as HTML
    if (match.includes('<h') || match.includes('</h')) {
      return match;
    }
    
    // Clean title from any remaining markdown asterisks
    title = title.replace(/\*\*/g, '').replace(/\*/g, '').trim();
    
    // Only process if it looks like a heading (not just any numbered line)
    if (title.length > 0 && title.length < 100 && !title.match(/^[a-z]/)) {
      const level = number.split('.').length;
      const headingTag = Math.min(level, 4);
      const fontSize = level === 1 ? '26pt' : level === 2 ? '18pt' : level === 3 ? '16pt' : '14pt';
      return `<h${headingTag} class="numbered-heading" style="font-family: 'Times New Roman', serif; font-size: ${fontSize} !important; font-weight: bold !important; text-align: left; margin-top: ${level === 1 ? '35px' : level === 2 ? '28px' : level === 3 ? '20px' : '16px'}; margin-bottom: ${level === 1 ? '20px' : level === 2 ? '18px' : level === 3 ? '12px' : '10px'}; padding-left: 0;">${number} ${title}</h${headingTag}>`;
    }
    return match;
  });
  
  // Fix bullet points that should be headings - comprehensive list
  const mainSections = [
    { pattern: /introduction/i, number: '1. ' },
    { pattern: /literature review/i, number: '2. ' },
    { pattern: /requirements analysis/i, number: '3. ' },
    { pattern: /system architecture/i, number: '4. ' },
    { pattern: /implementation/i, number: '5. ' },
    { pattern: /testing/i, number: '6. ' },
    { pattern: /deployment/i, number: '7. ' },
    { pattern: /evaluation/i, number: '8. ' },
    { pattern: /conclusion/i, number: '9. ' },
    { pattern: /references/i, number: '10. ' }
  ];
  
  // Fix headings missing numbers - catch ALL main sections that appear without numbers
  // This must happen BEFORE numbered heading processing
  html = html.replace(/^(Introduction|Literature Review|Requirements Analysis|System Architecture\/Design|Implementation|Testing|Deployment|Evaluation|Conclusion|References)$/gim, (match, title) => {
    for (const section of mainSections) {
      if (section.pattern.test(title)) {
        const level = 1;
        const fontSize = '20pt';
        const marginTop = '30px';
        const marginBottom = '20px';
        return `<h1 class="numbered-heading" style="font-size: ${fontSize}; font-weight: bold; margin-top: ${marginTop}; margin-bottom: ${marginBottom}; text-align: left;">${section.number}${title}</h1>`;
      }
    }
    return match;
  });
  
  // Also catch patterns like "Introduction" on a line by itself (not already a heading)
  html = html.replace(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*$/gm, (match, title) => {
    // Skip if it's already formatted as a heading or if it's too short/long
    if (match.includes('<h') || match.includes('</h') || title.length < 5 || title.length > 50) {
      return match;
    }
    
    // Check if it matches any main section
    for (const section of mainSections) {
      if (section.pattern.test(title)) {
        return `<h1 class="numbered-heading" style="font-size: 26pt; font-weight: bold; margin-top: 35px; margin-bottom: 20px; text-align: left; padding-left: 0;">${section.number}${title}</h1>`;
      }
    }
    return match;
  });
  
  // Fix bullet points that should be headings - do this BEFORE numbered headings
  html = html.replace(/^[\*\-\+]\s*(.+)$/gim, (match, title) => {
    // Remove markdown bold from title
    title = title.replace(/\*\*(.+?)\*\*/g, '$1');
    
    // Check if it's Abstract
    if (title.match(/^Abstract$/i)) {
      return '<h1 class="abstract-heading">Abstract</h1>';
    }
    
    // Check if it matches any main section
    for (const section of mainSections) {
      if (section.pattern.test(title)) {
        return `<h1 class="numbered-heading" style="font-size: 26pt; font-weight: bold; margin-top: 35px; margin-bottom: 20px; text-align: left; padding-left: 0;">${section.number}${title}</h1>`;
      }
    }
    
    // If it looks like a main heading (capitalized, standalone), try to match
    if (title.match(/^[A-Z][A-Za-z\s/]+$/) && title.length > 5 && title.length < 80) {
      for (const section of mainSections) {
        if (section.pattern.test(title)) {
          return `<h1 class="numbered-heading" style="font-size: 26pt; font-weight: bold; margin-top: 35px; margin-bottom: 20px; text-align: left; padding-left: 0;">${section.number}${title}</h1>`;
        }
      }
    }
    
    // Return original if no match
    return match;
  });
  
  // Numbered headings (1., 1.1, 1.1.1, etc.) - must be on their own line
  // CRITICAL: Main headings (level 1) must be LARGER, BOLD, and positioned at start
  html = html.replace(/^(\d+(?:\.\d+)*)\s+(.+)$/gim, (match, number, title) => {
    // Remove any bold markdown from title
    title = title.replace(/\*\*(.+?)\*\*/g, '$1').trim();
    
    const level = number.split('.').length;
    // CRITICAL FIX: Level 1 (e.g., "2.") should use h1, Level 2 (e.g., "2.1") should use h2
    // NOT level + 1, but directly map: level 1 → h1, level 2 → h2, etc.
    const headingTag = Math.min(level, 4); // Level 1 → h1, Level 2 → h2, Level 3 → h3, Level 4 → h4
    const isMajorSection = ['Introduction', 'Conclusion', 'References'].some(s => 
      title.toLowerCase().includes(s.toLowerCase())
    );
    
    // Main headings (level 1): 26pt (LARGER), bold, larger margins, aligned at start
    // Subheadings (level 2): 18pt (SMALLER), bold, smaller margins
    // Level 3: 16pt, bold
    // Level 4: 14pt, bold
    const fontSize = level === 1 ? '26pt' : level === 2 ? '18pt' : level === 3 ? '16pt' : '14pt';
    const marginTop = level === 1 ? (isMajorSection ? '40px' : '35px') : level === 2 ? '28px' : '22px';
    const marginBottom = level === 1 ? '20px' : level === 2 ? '18px' : '15px';
    
    return `<h${headingTag} class="numbered-heading" style="font-family: 'Times New Roman', serif; font-size: ${fontSize}; font-weight: bold; margin-top: ${marginTop}; margin-bottom: ${marginBottom}; text-align: left; padding-left: 0;">${number} ${title}</h${headingTag}>`;
  });
  
  // Markdown headers (fallback)
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
  
  // Flowchart boxes [Component]
  html = html.replace(/\[([^\]]+)\]/g, '<span class="flowchart-box">[$1]</span>');
  
  // Flowchart arrows
  html = html.replace(/\s+↓\s+/g, '<div class="flowchart-arrow">↓</div>');
  html = html.replace(/\s+→\s+/g, '<span class="flowchart-arrow-inline">→</span>');
  
  // Bold - ONLY apply to headings, NOT to regular text or list items
  // We'll handle bold separately to avoid bolding regular paragraph text
  // For now, remove bold from regular text - only headings should be bold
  
  // Remove italic markdown from body text (but preserve in references for titles)
  // Only convert to <em> if it's clearly a reference title pattern (e.g., "*Title*" in references)
  // For general body text, just remove the asterisks
  html = html.replace(/(?<!\*)\*(?!\*)([^*\n]+?)(?<!\*)\*(?!\*)/g, (match, content) => {
    // Only keep italics if it's in a reference context (after a number, author, year pattern)
    if (match.match(/\d+\.\s+[^,]+,\s+\d{4}\.\s+\*/)) {
      return `<em>${content}</em>`;
    }
    // Otherwise, just remove the asterisks (no italics for body text)
    return content;
  });
  
  // Remove URLs from references - comprehensive removal
  html = html.replace(/https?:\/\/[^\s\)]+/gi, ''); // Remove all URLs
  html = html.replace(/\[online\]\s*Available at:\s*<[^>]+>\s*\[Accessed[^\]]+\]/gi, ''); // Remove online source format
  html = html.replace(/\[online\]\s*Available at:\s*https?:\/\/[^\s]+/gi, ''); // Remove online URLs
  html = html.replace(/<https?:\/\/[^>]+>/gi, ''); // Remove URLs in angle brackets
  html = html.replace(/\(https?:\/\/[^\)]+\)/gi, ''); // Remove URLs in parentheses
  
  // Code blocks
  html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // Format summary-style content (e.g., **Title:**, **Authors:**, **Abstract/Overview:**)
  // Process line by line to handle multi-line content properly
  const summaryLines = html.split('\n');
  const formattedSummaryLines = [];
  let currentSummaryLabel = null;
  let currentSummaryContent = [];
  let inKeyFindings = false;
  let keyFindingsLabelOutput = false;
  
  for (let i = 0; i < summaryLines.length; i++) {
    const line = summaryLines[i].trim();
    const originalLine = summaryLines[i];
    
    // Check if it's a summary label (e.g., **Title:**, **Authors:**, **Key Findings:**)
    const labelMatch = line.match(/^\*\*([A-Z][A-Za-z\s/]+):\*\*\s*(.*)$/);
    if (labelMatch) {
      // Save previous label's content if exists
      if (currentSummaryLabel && currentSummaryContent.length > 0) {
        const content = currentSummaryContent.join(' ').trim();
        if (content) {
          // Check if content contains numbered items that need to be split
          if (inKeyFindings && content.match(/\d+\.\s+\*\*[^*]+\*\*:/)) {
            // Split numbered items in Key Findings
            const items = content.split(/(\d+\.\s+\*\*[^*]+\*\*:[^0-9]+)/);
            let regularContent = '';
            for (const item of items) {
              if (item.match(/^\d+\.\s+\*\*[^*]+\*\*:/)) {
                // This is a numbered item - format it separately
                const itemMatch = item.match(/^(\d+\.)\s+\*\*([^*]+)\*\*:\s*(.+)$/);
                if (itemMatch) {
                  const [, number, title, itemContent] = itemMatch;
                  formattedSummaryLines.push(`<p style="font-family: 'Times New Roman', serif; font-size: 12pt; margin-bottom: 10px; text-align: justify; margin-left: 20px; line-height: 1.6; text-indent: -10px; padding-left: 30px;"><strong style="font-weight: bold;">${number} ${title}:</strong> ${itemContent.trim()}</p>`);
                }
              } else if (item.trim()) {
                regularContent += item.trim() + ' ';
              }
            }
            if (regularContent.trim()) {
              formattedSummaryLines.push(`<p style="font-family: 'Times New Roman', serif; font-size: 12pt; margin-bottom: 12px; text-align: justify; line-height: 1.6;"><strong style="font-weight: bold; font-size: 12pt;">${currentSummaryLabel}:</strong> ${regularContent.trim()}</p>`);
            }
          } else {
            formattedSummaryLines.push(`<p style="font-family: 'Times New Roman', serif; font-size: 12pt; margin-bottom: 12px; text-align: justify; line-height: 1.6;"><strong style="font-weight: bold; font-size: 12pt;">${currentSummaryLabel}:</strong> ${content}</p>`);
          }
        }
        currentSummaryContent = [];
      }
      
      // Start new label
      currentSummaryLabel = labelMatch[1];
      inKeyFindings = (labelMatch[1].toLowerCase().includes('key findings'));
      keyFindingsLabelOutput = false;
      
      if (labelMatch[2]) {
        currentSummaryContent.push(labelMatch[2].trim());
      }
      continue;
    }
    
    // Check if it's a numbered list item (e.g., "1. **Significance of AI...**")
    const numberedMatch = line.match(/^(\d+\.)\s+\*\*([^*]+)\*\*:\s*(.+)$/);
    if (numberedMatch) {
      // If we're in Key Findings section, format as numbered item
      if (inKeyFindings || (currentSummaryLabel && currentSummaryLabel.toLowerCase().includes('key findings'))) {
        // If Key Findings label hasn't been output yet, output it first
        if (!keyFindingsLabelOutput && currentSummaryLabel && currentSummaryLabel.toLowerCase().includes('key findings')) {
          formattedSummaryLines.push(`<p style="font-family: 'Times New Roman', serif; font-size: 12pt; margin-bottom: 12px; text-align: justify; line-height: 1.6;"><strong style="font-weight: bold; font-size: 12pt;">${currentSummaryLabel}:</strong></p>`);
          keyFindingsLabelOutput = true;
        } else if (currentSummaryLabel && !currentSummaryLabel.toLowerCase().includes('key findings') && currentSummaryContent.length > 0) {
          // Save previous label's content if exists (but not if it's Key Findings label itself)
          const content = currentSummaryContent.join(' ').trim();
          if (content) {
            formattedSummaryLines.push(`<p style="font-family: 'Times New Roman', serif; font-size: 12pt; margin-bottom: 12px; text-align: justify; line-height: 1.6;"><strong style="font-weight: bold; font-size: 12pt;">${currentSummaryLabel}:</strong> ${content}</p>`);
          }
          currentSummaryContent = [];
        }
        
        // Format numbered item with proper indentation
        const [, number, title, content] = numberedMatch;
        formattedSummaryLines.push(`<p style="font-family: 'Times New Roman', serif; font-size: 12pt; margin-bottom: 10px; text-align: justify; margin-left: 20px; line-height: 1.6; text-indent: -10px; padding-left: 30px;"><strong style="font-weight: bold;">${number} ${title}:</strong> ${content.trim()}</p>`);
        continue;
      } else {
        // Not in Key Findings, but still a numbered item - format it
        const [, number, title, content] = numberedMatch;
        formattedSummaryLines.push(`<p style="font-family: 'Times New Roman', serif; font-size: 12pt; margin-bottom: 10px; text-align: justify; margin-left: 20px; line-height: 1.6; text-indent: -10px; padding-left: 30px;"><strong style="font-weight: bold;">${number} ${title}:</strong> ${content.trim()}</p>`);
        continue;
      }
    }
    
    // If we're collecting content for a label, add this line (but not if it's a numbered item or new label)
    if (currentSummaryLabel && line && !line.match(/^\*\*/) && !line.match(/^\d+\.\s+\*\*/)) {
      // Don't add if it's a numbered item
      if (!line.match(/^\d+\./)) {
        currentSummaryContent.push(line);
        continue;
      }
    }
    
    // If we hit a blank line or new section, save current label content
    if (currentSummaryLabel && (!line || line.match(/^\*\*/))) {
      const content = currentSummaryContent.join(' ').trim();
      if (content) {
        // Check if content contains numbered items that need to be split (for Key Findings)
        if (inKeyFindings && content.match(/\d+\.\s+\*\*[^*]+\*\*:/)) {
          // Split numbered items in Key Findings
          if (!keyFindingsLabelOutput) {
            formattedSummaryLines.push(`<p style="font-family: 'Times New Roman', serif; font-size: 12pt; margin-bottom: 12px; text-align: justify; line-height: 1.6;"><strong style="font-weight: bold; font-size: 12pt;">${currentSummaryLabel}:</strong></p>`);
            keyFindingsLabelOutput = true;
          }
          // Split by numbered items pattern
          const parts = content.split(/(\d+\.\s+\*\*[^*]+\*\*:[^0-9]+)/);
          for (const part of parts) {
            if (part.match(/^\d+\.\s+\*\*[^*]+\*\*:/)) {
              const itemMatch = part.match(/^(\d+\.)\s+\*\*([^*]+)\*\*:\s*(.+)$/);
              if (itemMatch) {
                const [, number, title, itemContent] = itemMatch;
                formattedSummaryLines.push(`<p style="font-family: 'Times New Roman', serif; font-size: 12pt; margin-bottom: 10px; text-align: justify; margin-left: 20px; line-height: 1.6; text-indent: -10px; padding-left: 30px;"><strong style="font-weight: bold;">${number} ${title}:</strong> ${itemContent.trim()}</p>`);
              }
            } else if (part.trim() && !part.match(/^\d+\./)) {
              // Regular content before numbered items
              formattedSummaryLines.push(`<p style="font-family: 'Times New Roman', serif; font-size: 12pt; margin-bottom: 12px; text-align: justify; line-height: 1.6;">${part.trim()}</p>`);
            }
          }
        } else {
          formattedSummaryLines.push(`<p style="font-family: 'Times New Roman', serif; font-size: 12pt; margin-bottom: 12px; text-align: justify; line-height: 1.6;"><strong style="font-weight: bold; font-size: 12pt;">${currentSummaryLabel}:</strong> ${content}</p>`);
        }
      }
      // Don't reset if it's Key Findings and we might have numbered items coming
      if (!currentSummaryLabel.toLowerCase().includes('key findings')) {
        currentSummaryLabel = null;
        currentSummaryContent = [];
        inKeyFindings = false;
      } else {
        currentSummaryContent = [];
      }
    }
    
    // Keep other lines as-is (they'll be processed later)
    if (line && !line.match(/^\*\*[A-Z]/) && !line.match(/^\d+\.\s+\*\*/)) {
      formattedSummaryLines.push(originalLine);
    } else if (!line) {
      formattedSummaryLines.push('');
    }
  }
  
  // Save any remaining label content
  if (currentSummaryLabel && currentSummaryContent.length > 0) {
    const content = currentSummaryContent.join(' ').trim();
    if (content) {
      // Check if content contains numbered items that need to be split (for Key Findings)
      if (inKeyFindings && content.match(/\d+\.\s+\*\*[^*]+\*\*:/)) {
        if (!keyFindingsLabelOutput) {
          formattedSummaryLines.push(`<p style="font-family: 'Times New Roman', serif; font-size: 12pt; margin-bottom: 12px; text-align: justify; line-height: 1.6;"><strong style="font-weight: bold; font-size: 12pt;">${currentSummaryLabel}:</strong></p>`);
        }
        // Split numbered items
        const parts = content.split(/(\d+\.\s+\*\*[^*]+\*\*:[^0-9]+)/);
        for (const part of parts) {
          if (part.match(/^\d+\.\s+\*\*[^*]+\*\*:/)) {
            const itemMatch = part.match(/^(\d+\.)\s+\*\*([^*]+)\*\*:\s*(.+)$/);
            if (itemMatch) {
              const [, number, title, itemContent] = itemMatch;
              formattedSummaryLines.push(`<p style="font-family: 'Times New Roman', serif; font-size: 12pt; margin-bottom: 10px; text-align: justify; margin-left: 20px; line-height: 1.6; text-indent: -10px; padding-left: 30px;"><strong style="font-weight: bold;">${number} ${title}:</strong> ${itemContent.trim()}</p>`);
            }
          } else if (part.trim() && !part.match(/^\d+\./)) {
            formattedSummaryLines.push(`<p style="font-family: 'Times New Roman', serif; font-size: 12pt; margin-bottom: 12px; text-align: justify; line-height: 1.6;">${part.trim()}</p>`);
          }
        }
      } else {
        formattedSummaryLines.push(`<p style="font-family: 'Times New Roman', serif; font-size: 12pt; margin-bottom: 12px; text-align: justify; line-height: 1.6;"><strong style="font-weight: bold; font-size: 12pt;">${currentSummaryLabel}:</strong> ${content}</p>`);
      }
    }
  }
  
  html = formattedSummaryLines.join('\n');
  
  // Fix repeated numbering in list items (e.g., "6. Unit Testing:" under "6.1" section)
  // Process line by line to fix "6." prefix in items under "6.1" or "6.2"
  const linesForFix = html.split('\n');
  const fixedLines = [];
  let inSection61 = false;
  let inSection62 = false;
  
  for (let i = 0; i < linesForFix.length; i++) {
    const line = linesForFix[i];
    const trimmed = line.trim();
    
    // Check if we're entering section 6.1 or 6.2
    if (trimmed.match(/^6\.1\s+/i)) {
      inSection61 = true;
      inSection62 = false;
      fixedLines.push(line);
      continue;
    }
    if (trimmed.match(/^6\.2\s+/i)) {
      inSection61 = false;
      inSection62 = true;
      fixedLines.push(line);
      continue;
    }
    
    // Check if we're leaving section 6.1 or 6.2 (new numbered heading)
    if (trimmed.match(/^\d+\.\s+/) && !trimmed.match(/^6\.(1|2)\s+/)) {
      inSection61 = false;
      inSection62 = false;
    }
    
    // If we're in section 6.1 or 6.2, remove "6." prefix and bold from list items
    if ((inSection61 || inSection62) && trimmed.match(/^(\*\*)?6\.\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*):/)) {
      // Remove "6." prefix and bold formatting
      const cleaned = trimmed.replace(/^(\*\*)?6\.\s+/, '').replace(/\*\*/g, '');
      fixedLines.push(line.replace(trimmed, cleaned));
      continue;
    }
    
    // Remove bold from list item labels that are incorrectly formatted
    if (trimmed.match(/^\*\*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*):\*\*/)) {
      const cleaned = trimmed.replace(/^\*\*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*):\*\*/gim, '$1:');
      fixedLines.push(line.replace(trimmed, cleaned));
      continue;
    }
    
    fixedLines.push(line);
  }
  
  html = fixedLines.join('\n');
  
  // Lists - but exclude numbered items that are actually section headings
  html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
  html = html.replace(/^- (.*$)/gim, '<li>$1</li>');
  
  // Only convert to list items if they're NOT section headings
  // This regex is too complex and might cause issues - simplified approach
  // We'll handle list items differently - skip this conversion for now
  // Lists will be handled in paragraph processing
  
  // Wrap lists
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => {
    return '<ul>' + match + '</ul>';
  });
  
  // Paragraphs - ensure proper line breaks and formatting
  const lines = html.split('\n');
  const paragraphs = [];
  let currentPara = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Skip empty lines and dashes
    if (!trimmed || trimmed.match(/^---+$/)) {
      if (currentPara.length > 0) {
        paragraphs.push('<p>' + currentPara.join(' ') + '</p>');
        currentPara = [];
      }
      continue;
    }
    
      // Check if it's a flowchart line (contains [Component] or ↓) - format separately
      if ((trimmed.includes('[') && trimmed.includes(']')) || trimmed.includes('↓')) {
        if (currentPara.length > 0) {
          paragraphs.push('<p style="font-family: \'Times New Roman\', serif; font-size: 12pt; text-align: justify; line-height: 1.6; margin-bottom: 12px;">' + currentPara.join(' ') + '</p>');
          currentPara = [];
        }
        // Format flowchart as a separate paragraph with monospace font and proper spacing
        paragraphs.push(`<p style="font-family: 'Courier New', monospace; margin: 10px 0; line-height: 1.8; text-align: left;">${trimmed}</p>`);
        continue;
      }
    
    // Remove bullet point descriptions that follow flowcharts (e.g., "• User Interface: This is...")
    // These should not appear after flowchart components
    if (trimmed.match(/^[\*\-\+]\s*[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*:\s*(This|The|It|Each|This component|Acts as|Serves as|Validates|Receives|Processes)/i)) {
      // Check if previous lines contain flowchart components
      const prevLines = lines.slice(Math.max(0, i - 10), i).join('\n');
      if ((prevLines.includes('[') && prevLines.includes(']')) || prevLines.includes('↓')) {
        // This is a flowchart description - skip it
        continue;
      }
    }
    
    // If it's already a formatted element (heading, list, etc.), add it directly
    if (trimmed.match(/^<[h|u|o|l|p|d|s|d]/) || trimmed.match(/^<\/[u|o|l|p|d|s|d]/)) {
      if (currentPara.length > 0) {
        paragraphs.push('<p style="font-family: \'Times New Roman\', serif; font-size: 12pt; text-align: justify; line-height: 1.6; margin-bottom: 12px;">' + currentPara.join(' ') + '</p>');
        currentPara = [];
      }
      paragraphs.push(trimmed);
    } else if (trimmed.match(/^\d+\.\s+[A-Z]/) && !trimmed.match(/^\d+\.\s+[A-Z][a-z]+,\s*\d{4}/)) {
      // This looks like a heading that wasn't caught - format it
      const headingMatch = trimmed.match(/^(\d+(?:\.\d+)*)\s+(.+)$/);
      if (headingMatch) {
        const number = headingMatch[1];
        const title = headingMatch[2].replace(/\*\*(.+?)\*\*/g, '$1').trim();
        const level = number.split('.').length;
        // CRITICAL FIX: Level 1 → h1, Level 2 → h2 (NOT level + 1)
        const headingTag = Math.min(level, 4);
        // Main headings: MUCH larger (26pt) - clearly bigger than subheadings, bold, aligned at start
        // Subheadings: smaller (18pt for level 2)
        const fontSize = level === 1 ? '26pt' : level === 2 ? '18pt' : level === 3 ? '16pt' : '14pt';
        const marginTop = level === 1 ? '35px' : level === 2 ? '28px' : '22px';
        const marginBottom = level === 1 ? '20px' : level === 2 ? '18px' : '15px';
        
        if (currentPara.length > 0) {
          paragraphs.push('<p style="font-family: \'Times New Roman\', serif; font-size: 12pt; text-align: justify; line-height: 1.6; margin-bottom: 12px;">' + currentPara.join(' ') + '</p>');
          currentPara = [];
        }
        paragraphs.push(`<h${headingTag} class="numbered-heading" style="font-family: 'Times New Roman', serif; font-size: ${fontSize}; font-weight: bold; margin-top: ${marginTop}; margin-bottom: ${marginBottom}; text-align: left; padding-left: 0;">${number} ${title}</h${headingTag}>`);
      } else {
        currentPara.push(trimmed);
      }
    } else {
      // Regular text - accumulate into paragraph
      // Check if it's already formatted as summary content (from earlier processing)
      if (trimmed.match(/^<p style="font-family: 'Times New Roman'/)) {
        // Already formatted as summary content - add directly
        if (currentPara.length > 0) {
          paragraphs.push('<p style="font-family: \'Times New Roman\', serif; font-size: 12pt; text-align: justify; line-height: 1.6; margin-bottom: 12px;">' + currentPara.join(' ') + '</p>');
          currentPara = [];
        }
        paragraphs.push(trimmed);
        continue;
      }
      
      // Check if it's summary-style content that wasn't caught (e.g., **Title:** text)
      if (trimmed.match(/^\*\*[A-Z][A-Za-z\s/]+:\*\*/)) {
        // Format summary-style content
        const summaryMatch = trimmed.match(/^\*\*([A-Z][A-Za-z\s/]+):\*\*\s*(.+)$/);
        if (summaryMatch) {
          const [, label, content] = summaryMatch;
          if (currentPara.length > 0) {
            paragraphs.push('<p style="font-family: \'Times New Roman\', serif; font-size: 12pt; text-align: justify; line-height: 1.6; margin-bottom: 12px;">' + currentPara.join(' ') + '</p>');
            currentPara = [];
          }
          paragraphs.push(`<p style="font-family: 'Times New Roman', serif; font-size: 12pt; margin-bottom: 12px; text-align: justify; line-height: 1.6;"><strong style="font-weight: bold; font-size: 12pt;">${label}:</strong> ${content.trim()}</p>`);
          continue;
        }
      }
      
      // Check if it's a reference entry (numbered format: 1. Author, Year. *Title*...)
      // But NOT a heading like "10. References" - check BEFORE cleaning
      const isReference = (!trimmed.match(/^10\.\s+References$/i)) && 
                         (/^\d+\.\s+[A-Z][a-z]+,\s*\d{4}/.test(trimmed) || 
                          /^[A-Z][a-z]+,\s*\d{4}\./.test(trimmed) ||
                          /^[A-Z][a-z]+,\s*[A-Z]\.\s+\d{4}/.test(trimmed));
      
      // CRITICAL: If it's a reference, process it FIRST and STRICTLY remove ALL bold formatting
      // This must happen BEFORE any other text processing to prevent bold from being applied
      if (isReference) {
        if (currentPara.length > 0) {
          paragraphs.push('<p style="font-family: \'Times New Roman\', serif; font-size: 12pt; text-align: justify; line-height: 1.6; margin-bottom: 12px; font-weight: normal;">' + currentPara.join(' ') + '</p>');
          currentPara = [];
        }
        // Format reference: STRICTLY remove ALL bold markdown, preserve italics for titles
        let refText = trimmed;
        // Remove ALL bold markdown (**, **text**, etc.) - STRICT removal with multiple passes
        refText = refText.replace(/\*\*/g, ''); // Remove all double asterisks first
        refText = refText.replace(/\*\*([^*]+?)\*\*/g, '$1'); // Remove any remaining bold patterns
        refText = refText.replace(/\*\*/g, ''); // Second pass to catch any remaining
        // Remove any HTML bold tags that might have been added
        refText = refText.replace(/<strong[^>]*>/gi, '');
        refText = refText.replace(/<\/strong>/gi, '');
        refText = refText.replace(/<b[^>]*>/gi, '');
        refText = refText.replace(/<\/b>/gi, '');
        // Convert *Title* to <em>Title</em> for proper italicization (only single asterisks for titles)
        // But be careful - only convert if it's clearly a title (not part of bold markdown)
        refText = refText.replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, '<em>$1</em>');
        // Final cleanup - remove any remaining asterisks that might be leftover
        refText = refText.replace(/\*\*/g, '');
        // Ensure no bold styling - use inline style with multiple overrides to force normal weight
        paragraphs.push(`<p class="reference-entry" style="font-family: 'Times New Roman', serif !important; font-size: 12pt !important; text-align: left !important; line-height: 1.6 !important; margin-bottom: 10px !important; margin-left: 20px !important; text-indent: -20px !important; padding-left: 20px !important; font-weight: normal !important; font-style: normal !important; cursor: pointer; transition: background-color 0.2s ease;" onmouseover="this.style.backgroundColor='#f0f0f0'" onmouseout="this.style.backgroundColor='transparent'">${refText}</p>`);
        continue;
      }
      
      // Check if it's a list item with bold label (e.g., "Unit Testing:", "Integration Testing:")
      const isListItemWithBoldLabel = trimmed.match(/^(\*\*)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*):\s*(.+)$/);
      
      // Remove ALL bold formatting from regular text (only headings should be bold)
      // Also remove italic markdown from body text
      let cleanedText = trimmed.replace(/\*\*(.+?)\*\*/g, '$1'); // Remove bold markdown
      cleanedText = cleanedText.replace(/(?<!\*)\*(?!\*)([^*\n]+?)(?<!\*)\*(?!\*)/g, '$1'); // Remove italic markdown (but not in references)
      
      // If it's a list item with bold label, remove bold from the label part
      if (isListItemWithBoldLabel) {
        // Format as: "Label: description" without bold
        const label = isListItemWithBoldLabel[2];
        const description = isListItemWithBoldLabel[3] || '';
        cleanedText = `${label}: ${description}`.trim();
      }
      
      // Fix repeated "6." in list items under 6.1 or 6.2 sections
      if (cleanedText.match(/^6\.\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*):/)) {
        // Check if we're in a 6.1 or 6.2 section by checking previous lines
        const prevContext = lines.slice(Math.max(0, i - 5), i).join('\n');
        if (prevContext.match(/6\.(1|2)\s+/)) {
          // Remove "6." prefix
          cleanedText = cleanedText.replace(/^6\.\s+/, '');
        }
      }
      
      // But check if it's a flowchart description and skip it
      if (cleanedText.match(/^[\*\-\+]\s*[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*:\s*(This|The|It|Each|This component|Acts as|Serves as|Validates|Receives|Processes|User Interface|Authentication|Request Handler|Business Logic|Data Access|Database|Response Formatter)/i)) {
        const prevContext = lines.slice(Math.max(0, i - 10), i).join('\n');
        if ((prevContext.includes('[') && prevContext.includes(']')) || prevContext.includes('↓')) {
          // This is a flowchart description - skip it completely
          continue;
        }
      }
      
      // Also remove detailed descriptions of flowchart components
      if (cleanedText.match(/^(User Interface|Authentication Module|Request Handler|Business Logic Layer|Data Access Layer|Database|Response Formatter):\s*(This|The|It|Each|Acts as|Serves as|Validates|Receives|Processes)/i)) {
        const prevContext = lines.slice(Math.max(0, i - 5), i).join('\n');
        if ((prevContext.includes('[') && prevContext.includes(']')) || prevContext.includes('↓')) {
          // Skip flowchart descriptions
          continue;
        }
      }
      
      // Fix repeated "6." in list items
      if (cleanedText.match(/^6\.\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*):/)) {
        const prevContext = lines.slice(Math.max(0, i - 5), i).join('\n');
        if (prevContext.match(/6\.(1|2)\s+/)) {
          // Remove "6." prefix
          cleanedText = cleanedText.replace(/^6\.\s+/, '');
        }
      }
      
      // Reference formatting is handled above, so just add to paragraph
      currentPara.push(cleanedText);
    }
  }
  
  // Add any remaining paragraph
  if (currentPara.length > 0) {
    paragraphs.push('<p style="font-family: \'Times New Roman\', serif; font-size: 12pt; text-align: justify; line-height: 1.6; margin-bottom: 12px; font-weight: normal;">' + currentPara.join(' ') + '</p>');
  }
  
  html = paragraphs.join('\n');
  
  // Final cleanup: remove any remaining markdown from headings and body text
  // Clean up headings that still have markdown asterisks (e.g., "9. \*Conclusions:**")
  html = html.replace(/<h(\d+)[^>]*>(\d+(?:\.\d+)*)\s*[\*\s]*([^*<]+?)[\*\s]*<\/h\1>/g, (match, level, number, title) => {
    const cleanTitle = title.replace(/\*\*/g, '').replace(/\*/g, '').trim();
    return match.replace(/>[\*\s]*([^*<]+?)[\*\s]*</, `>${number} ${cleanTitle}<`);
  });
  
  // Remove any remaining bold markdown from body text (but preserve in summary labels and headings)
  html = html.replace(/(?<!<strong[^>]*>)(?<!<h[^>]*>)\*\*([^*<]+?)\*\*(?!<\/strong>)(?!<\/h)/g, '$1');
  
  // CRITICAL FIX: STRICTLY remove ALL bold from references - process BEFORE any other bold removal
  // This must run FIRST to catch any references that might have been processed with bold
  html = html.replace(/<p class="reference-entry"[^>]*>([^<]*)<\/p>/g, (match, content) => {
    // Remove ALL bold markdown, <strong> tags, and ensure normal font weight
    let cleanContent = content;
    cleanContent = cleanContent.replace(/\*\*/g, ''); // Remove all double asterisks
    cleanContent = cleanContent.replace(/<strong[^>]*>/gi, ''); // Remove opening strong tags
    cleanContent = cleanContent.replace(/<\/strong>/gi, ''); // Remove closing strong tags
    cleanContent = cleanContent.replace(/<b[^>]*>/gi, ''); // Remove opening b tags
    cleanContent = cleanContent.replace(/<\/b>/gi, ''); // Remove closing b tags
    // Preserve italics for titles (*Title* -> <em>Title</em>)
    const withItalics = cleanContent.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    // Force normal weight with multiple overrides
    return `<p class="reference-entry" style="font-family: 'Times New Roman', serif; font-size: 12pt; text-align: left; line-height: 1.6; margin-bottom: 10px; margin-left: 20px; text-indent: -20px; padding-left: 20px; font-weight: normal !important; font-style: normal; cursor: pointer; transition: background-color 0.2s ease;" onmouseover="this.style.backgroundColor='#f0f0f0'" onmouseout="this.style.backgroundColor='transparent'">${withItalics}</p>`;
  });
  
  // Also remove any remaining bold markdown that might be in reference format but not yet wrapped
  html = html.replace(/(\d+\.\s+[A-Z][a-z]+,\s*\d{4}[^*<]*?)(\*\*([^*<]+?)\*\*)/g, (match, before, boldPart, boldText) => {
    // This is a reference with bold markdown - remove the bold
    return before + boldText;
  });
  
  // Remove bold from list items with labels (e.g., "**Unit Testing:** description")
  html = html.replace(/<p[^>]*>(\*\*)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*):(\*\*)?\s*(.+?)<\/p>/g, (match, bold1, label, bold2, description) => {
    // Remove bold from label, keep description
    return `<p style="font-family: 'Times New Roman', serif; font-size: 12pt; text-align: justify; line-height: 1.6; margin-bottom: 12px; font-weight: normal;">${label}: ${description}</p>`;
  });
  
  // Remove italic markdown from body text (but preserve in references where titles should be italicized)
  // Only keep italics if it's clearly in a reference format
  html = html.replace(/(?<!<em[^>]*>)(?<!\d+\.\s+[^,]+,\s+\d{4}\.\s+)\*(?!\*)([^*\n<]+?)(?<!\*)\*(?!\*)(?!<\/em>)/g, '$1');
  
  // Remove code markdown
  html = html.replace(/`([^`]+)`/g, '$1');
  
  return html;
}

export async function generateDOCX(htmlContent, metadata = {}) {
  try {
    // Handle markdown content directly
    const content = typeof htmlContent === 'string' ? htmlContent : htmlContent.toString();
    const children = [];

    // Remove extra dashes
    let processedContent = content.replace(/^---+$/gim, '').replace(/^--+$/gim, '');

    // Split by lines and process
    const lines = processedContent.split('\n');
    let inCodeBlock = false;
    let codeBlockContent = [];
    let tocAdded = false;

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();

      // Skip empty lines and extra dashes
      if (!line || line.match(/^---+$/)) {
        continue;
      }

      // Skip Table of Contents section completely
      if (line.startsWith('# Table of Contents')) {
        // Skip TOC header and all content until separator or end
        i++;
        while (i < lines.length && !lines[i].trim().match(/^---/)) {
          i++;
        }
        if (i < lines.length && lines[i].trim().match(/^---/)) {
          i++; // Skip the separator line too
        }
        continue;
      }

      // Handle code blocks
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          if (codeBlockContent.length > 0) {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: codeBlockContent.join('\n'),
                    font: 'Courier New',
                    size: 20,
                    color: '000000'
                  })
                ],
                spacing: { before: 120, after: 120 },
                shading: { fill: 'F5F5F5' }
              })
            );
          }
          codeBlockContent = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
        }
        continue;
      }

      if (inCodeBlock) {
        codeBlockContent.push(line);
        continue;
      }

      // Handle document title (first line that looks like a title)
      // Check if it's the title - should be early in document, contains "ResearchAid AI" or project name
      if ((i === 0 || i === 1) && line.match(/ResearchAid AI/i) && line.length > 30 && line.length < 150 && !line.match(/^\d+\./)) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: line,
                bold: true,
                size: 32, // 16pt
                font: 'Times New Roman'
              })
            ],
            alignment: 'center',
            spacing: { before: 0, after: 400 }
          })
        );
        continue;
      }

      // Abstract (special handling) - must be standalone heading
      if (line.match(/^Abstract\s*$/i) && (i + 1 >= lines.length || !lines[i + 1].trim().match(/^\d/))) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: 'Abstract',
                bold: true,
                size: 28
              })
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 0, after: 300 }
          })
        );
        continue;
      }

      // Numbered headings (1., 1.1, 1.1.1, etc.)
      const numberedMatch = line.match(/^(\d+(?:\.\d+)*)\s+(.+)$/);
      if (numberedMatch) {
        const number = numberedMatch[1];
        let title = numberedMatch[2];
        
        // Remove markdown bold formatting from title
        title = title.replace(/\*\*(.+?)\*\*/g, '$1').trim();
        
        const level = number.split('.').length;
        const isMainHeading = level === 1;
        
        // Make sure major sections like Conclusion and References are properly formatted
        const isMajorSection = ['Introduction', 'Conclusion', 'References'].some(s => 
          title.toLowerCase().includes(s.toLowerCase())
        );
        
        // Main headings: LARGER font size (26pt = 52 twips), more spacing, bold, aligned at start
        // Subheadings: SMALLER font (18pt = 36 twips), bold (but smaller than main headings)
        // Main headings (1., 2., 3.) should be noticeably larger than subheadings (1.1, 1.2)
        const fontSize = isMainHeading ? 52 : level === 2 ? 36 : level === 3 ? 32 : 28; // 26pt for main, 18pt for sub, 16pt for level 3, 14pt for level 4
        const spacingBefore = isMainHeading ? (isMajorSection ? 480 : 400) : level === 2 ? 280 : 200;
        const spacingAfter = isMainHeading ? 200 : level === 2 ? 150 : 120;
        
        // CRITICAL: Use correct heading level - Level 1 → HEADING_1, Level 2 → HEADING_2
        const headingLevel = level === 1 ? HeadingLevel.HEADING_1 :
                            level === 2 ? HeadingLevel.HEADING_2 :
                            level === 3 ? HeadingLevel.HEADING_3 :
                            HeadingLevel.HEADING_4;
        
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${number} ${title}`,
                bold: true, // Headings should be bold
                size: fontSize
              })
            ],
            heading: headingLevel,
            spacing: { 
              before: spacingBefore, 
              after: spacingAfter
            }
          })
        );
        continue;
      }
      
      // Fix repeated "6." in list items (e.g., "6. Unit Testing:" should be "Unit Testing:")
      // This happens when items under "6.1" or "6.2" incorrectly have "6." prefix
      if (line.match(/^(\*\*)?6\.\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*):/)) {
        // Check if we're in a "6.1" or "6.2" section
        const prevLines = lines.slice(Math.max(0, i - 10), i).join('\n');
        if (prevLines.match(/6\.(1|2)\s+/)) {
          // Remove "6." prefix and bold formatting
          const cleaned = line.replace(/^(\*\*)?6\.\s+/, '').replace(/\*\*/g, '');
          // Format as regular paragraph, not bold
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: cleaned,
                  size: 22,
                  font: 'Times New Roman',
                  bold: false // NOT bold
                })
              ],
              spacing: { after: 180 },
              alignment: 'both'
            })
          );
          continue;
        }
      }
      
      // Fix headings missing numbers - catch ALL main sections
      const mainSections = [
        { pattern: /^introduction$/i, number: '1. ' },
        { pattern: /^literature review$/i, number: '2. ' },
        { pattern: /^requirements analysis$/i, number: '3. ' },
        { pattern: /^system architecture/i, number: '4. ' },
        { pattern: /^implementation$/i, number: '5. ' },
        { pattern: /^testing$/i, number: '6. ' },
        { pattern: /^deployment$/i, number: '7. ' },
        { pattern: /^evaluation$/i, number: '8. ' },
        { pattern: /^conclusion$/i, number: '9. ' },
        { pattern: /^references$/i, number: '10. ' }
      ];
      
      // Check if line is an unnumbered main section
      const trimmedLine = line.trim();
      for (const section of mainSections) {
        if (section.pattern.test(trimmedLine) && !trimmedLine.match(/^\d+\./)) {
          let title = trimmedLine;
          // Remove markdown bold if present
          title = title.replace(/\*\*(.+?)\*\*/g, '$1').trim();
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `${section.number}${title}`,
                  bold: true,
                  size: 28
                })
              ],
              heading: HeadingLevel.HEADING_1,
              spacing: { 
                before: 360, 
                after: 180
              }
            })
          );
          continue;
        }
      }

      // Markdown headings (fallback) - make them bold and properly sized
      if (line.startsWith('# ')) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: line.substring(2).trim(),
                bold: true,
                size: 28 // 14pt
              })
            ],
            heading: HeadingLevel.TITLE,
            alignment: 'left',
            spacing: { before: 0, after: 300 }
          })
        );
      } else if (line.startsWith('## ')) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: line.substring(3).trim(),
                bold: true,
                size: 24 // 12pt
              })
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 360, after: 180 }
          })
        );
      } else if (line.startsWith('### ')) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: line.substring(4).trim(),
                bold: true,
                size: 22 // 11pt
              })
            ],
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 240, after: 120 }
          })
        );
      } else if (line.startsWith('#### ')) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: line.substring(5).trim(),
                bold: true,
                size: 20 // 10pt
              })
            ],
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 180, after: 120 }
          })
        );
      }
      // Flowchart boxes and arrows - format as regular text (ONLY component names, NO descriptions)
      else if (line.match(/\[.*\]/) || (line.includes('↓') && line.match(/\[.*\]/))) {
        // Format flowchart as regular paragraph - ONLY show component names with arrows
        // Skip any lines that describe components (e.g., "• User Interface: This is...")
        if (line.match(/^[\*\-\+]\s*[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*:\s*(This|The|It|Each|This component|Acts as|Serves as|Validates|Receives|Processes)/i)) {
          // This is a flowchart description - skip it
          continue;
        }
        
        let text = line
          .replace(/\[([^\]]+)\]/g, '[$1]') // Keep boxes
          .replace(/\s+↓\s+/g, ' ↓ ')
          .replace(/\s+→\s+/g, ' → ')
          .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
          .replace(/\*(.*?)\*/g, '$1') // Remove italic
          .replace(/`(.*?)`/g, '$1'); // Remove code

        if (text.trim()) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: text,
                  size: 22,
                  font: 'Courier New', // Monospace for flowcharts
                  bold: false
                })
              ],
              spacing: { after: 180 },
              alignment: 'left'
            })
          );
        }
      }
      // Lists (but NOT for major section headings like Conclusion, References)
      // Also skip if it's a numbered list item that's actually a section heading
      // Fix: Remove "6." prefix from items under "6.1" or "6.2" sections
      else if (line.match(/^(\*\*)?6\.\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*):/)) {
        // Check if we're in a "6.1" or "6.2" section
        const prevLines = lines.slice(Math.max(0, i - 10), i).join('\n');
        if (prevLines.match(/6\.(1|2)\s+/)) {
          // Remove "6." prefix and bold formatting, keep as regular text (NOT bold)
          const cleaned = line.replace(/^(\*\*)?6\.\s+/, '').replace(/\*\*/g, '');
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: cleaned,
                  size: 22,
                  font: 'Times New Roman',
                  bold: false // NOT bold
                })
              ],
              spacing: { after: 180 },
              alignment: 'both'
            })
          );
          continue;
        }
      }
      else if ((line.match(/^[\*\-\+] /) || (line.match(/^\d+\. /) && !line.match(/^\d+\.\d/))) 
               && !line.match(/^[\*\-\+]\s*(Conclusion|References|Introduction|Abstract|Testing|Deployment|Evaluation)/i)
               && !line.match(/^\d+\.\s+(Conclusion|References|Introduction|Testing|Deployment|Evaluation)/i)) {
        let listText = line.replace(/^[\*\-\+\d\.]+\s+/, '');
        
        // Remove ALL bold formatting from list items - they should be plain text
        listText = listText.replace(/\*\*(.+?)\*\*/g, '$1');
        
        const isOrdered = /^\d+\./.test(line) && !line.match(/^\d+\.\d/);
        
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: listText,
                size: 22,
                font: 'Times New Roman',
                bold: false // List items should NOT be bold
              })
            ],
            bullet: !isOrdered ? { level: 0 } : undefined,
            numbering: isOrdered ? { level: 0 } : undefined,
            spacing: { after: 120 }
          })
        );
      }
      // Regular paragraphs
      else {
        // Skip if it's a bullet point that should be a heading - comprehensive check
        const mainSections = [
          { pattern: /introduction/i, number: '1. ' },
          { pattern: /literature review/i, number: '2. ' },
          { pattern: /requirements analysis/i, number: '3. ' },
          { pattern: /system architecture/i, number: '4. ' },
          { pattern: /implementation/i, number: '5. ' },
          { pattern: /testing/i, number: '6. ' },
          { pattern: /deployment/i, number: '7. ' },
          { pattern: /evaluation/i, number: '8. ' },
          { pattern: /conclusion/i, number: '9. ' },
          { pattern: /references/i, number: '10. ' }
        ];
        
        if (line.match(/^[\*\-\+]\s+(.+)$/i)) {
          const title = line.replace(/^[\*\-\+]\s+/, '').trim();
          
          // Check if it's Abstract
          if (title.match(/^Abstract$/i)) {
            children.push(
              new Paragraph({
                text: 'Abstract',
                heading: HeadingLevel.HEADING_1,
                spacing: { before: 0, after: 300 }
              })
            );
            continue;
          }
          
          // Check if it matches any main section
          for (const section of mainSections) {
            if (section.pattern.test(title)) {
              children.push(
                new Paragraph({
                  text: `${section.number}${title}`,
                  heading: HeadingLevel.HEADING_1,
                  spacing: { before: 480, after: 180 }
                })
              );
              continue;
            }
          }
        }
        
        // Remove markdown formatting and URLs from references
        // CRITICAL: Remove ALL bold formatting from regular text - only headings should be bold
        // For references, we need to be extra careful to remove ALL bold markdown
        let text = line
          .replace(/\*\*/g, '') // Remove ALL double asterisks first (most aggressive)
          .replace(/\*\*(.*?)\*\*/g, '$1') // Remove any remaining bold patterns
          .replace(/\*\*/g, '') // Second pass to catch any remaining
          .replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '$1') // Remove italic markdown (but we'll preserve titles separately)
          .replace(/`(.*?)`/g, '$1') // Code
          .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Links
          .replace(/https?:\/\/[^\s\)]+/gi, '') // Remove all URLs
          .replace(/\[online\]\s*Available at:\s*<[^>]+>\s*\[Accessed[^\]]+\]/gi, '') // Remove online source format
          .replace(/\[online\]\s*Available at:\s*https?:\/\/[^\s]+/gi, '') // Remove online URLs
          .replace(/<https?:\/\/[^>]+>/gi, '') // Remove URLs in angle brackets
          .replace(/\(https?:\/\/[^\)]+\)/gi, '') // Remove URLs in parentheses
          .trim();

        if (text) {
          // Check if it's a reference entry (numbered format: 1. Author, Year. *Title*...)
          // But NOT a heading like "10. References"
          const isReference = (!text.match(/^10\.\s+References$/i)) && 
                             (/^\d+\.\s+[A-Z][a-z]+,\s*\d{4}/.test(text) || 
                              /^[A-Z][a-z]+,\s*\d{4}\./.test(text) ||
                              /^[A-Z][a-z]+,\s*[A-Z]\.\s+\d{4}/.test(text));
          
          // Regular paragraphs should NEVER be bold - only headings
          
          if (isReference) {
            // Parse reference to apply italics to titles (format: Number. Author, Year. *Title*. Journal...)
            // CRITICAL: References must NEVER be bold - ensure all text is normal weight
            const referenceParts = [];
            
            // First, ensure text has NO bold markdown (should already be removed above, but double-check)
            let cleanText = text.replace(/\*\*/g, '').replace(/<strong[^>]*>/gi, '').replace(/<\/strong>/gi, '');
            
            // Try to identify italic sections (titles) - look for patterns like "Title" that should be italicized
            // In Harvard style, titles are often italicized, but the markdown might already be removed
            // So we'll check for common patterns: "Title." or "Title," followed by journal name
            const titlePattern = /([A-Z][^,\.]+(?:,\s*\d{4})?\.\s+)([A-Z][^\.]+?)(\.\s+[A-Z])/;
            const titleMatch = cleanText.match(titlePattern);
            
            if (titleMatch) {
              // Found a title pattern - italicize the title part
              const beforeTitle = titleMatch[1];
              const title = titleMatch[2];
              const afterTitle = titleMatch[3];
              
              referenceParts.push(
                new TextRun({
                  text: beforeTitle,
                  size: 22,
                  font: 'Times New Roman',
                  bold: false
                })
              );
              referenceParts.push(
                new TextRun({
                  text: title,
                  size: 22,
                  font: 'Times New Roman',
                  italics: true,
                  bold: false
                })
              );
              referenceParts.push(
                new TextRun({
                  text: cleanText.substring(beforeTitle.length + title.length),
                  size: 22,
                  font: 'Times New Roman',
                  bold: false
                })
              );
            } else {
              // No clear title pattern - just use the whole text, NOT bold
              referenceParts.push(
                new TextRun({
                  text: cleanText,
                  size: 22,
                  font: 'Times New Roman',
                  bold: false
                })
              );
            }
            
            // Ensure at least one part exists
            if (referenceParts.length === 0) {
              referenceParts.push(
                new TextRun({
                  text: cleanText || text,
                  size: 22,
                  font: 'Times New Roman',
                  bold: false
                })
              );
            }
            
            children.push(
              new Paragraph({
                children: referenceParts,
                spacing: { 
                  after: 180
                },
                alignment: 'left', // References left-aligned
                indent: { 
                  left: 400, 
                  hanging: 400 
                }
              })
            );
          } else {
            // Regular paragraph (not a reference)
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: text,
                    size: 22,
                    font: 'Times New Roman'
                  })
                ],
                spacing: { 
                  after: 240
                },
                alignment: 'both' // Body text justified
              })
            );
          }
        }
      }
    }

    const doc = new Document({
      sections: [{
        properties: {
          page: {
            size: {
              orientation: 'portrait',
              width: 12240, // A4 width in twips (8.5 inches)
              height: 15840 // A4 height in twips (11 inches)
            },
            margins: {
              top: 1440, // 1 inch
              right: 1440,
              bottom: 1440,
              left: 1440
            }
          }
        },
        children: children.length > 0 ? children : [
          new Paragraph({
            children: [
              new TextRun({
                text: 'No content to display',
                size: 22
              })
            ]
          })
        ]
      }]
    });

    const buffer = await Packer.toBuffer(doc);
    return buffer;
  } catch (error) {
    console.error('DOCX generation error:', error);
    throw new Error(`Failed to generate DOCX: ${error.message}`);
  }
}
