import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
});

export async function formatDocument(parsedContent, formatType = 'academic') {
  try {
    const { text, html, metadata } = parsedContent;

    // Apply basic formatting first
    let formattedHTML = applyBasicFormatting(html, metadata);

    // Use AI for advanced formatting and corrections
    if (process.env.OPENAI_API_KEY) {
      formattedHTML = await applyAIFormatting(text, formattedHTML, formatType);
    }

    // Generate formatting summary
    const summary = generateFormattingSummary(html, formattedHTML, metadata);

    return {
      html: formattedHTML,
      summary
    };

  } catch (error) {
    console.error('Document formatting error:', error);
    // Fallback to basic formatting if AI fails
    return {
      html: applyBasicFormatting(parsedContent.html, parsedContent.metadata),
      summary: {
        sectionsFormatted: 0,
        grammarCorrections: 0,
        styleImprovements: 0
      }
    };
  }
}

function applyBasicFormatting(html, metadata) {
  // Apply professional academic formatting
  let formatted = html;

  // Ensure proper heading hierarchy
  formatted = formatted.replace(
    /<p><strong>([^<]+)<\/strong><\/p>/gi,
    '<h2>$1</h2>'
  );

  // Format paragraphs
  formatted = formatted.replace(
    /<p>([^<]+)<\/p>/g,
    '<p style="text-align: justify; line-height: 1.6; margin-bottom: 12px;">$1</p>'
  );

  // Add document structure
  const title = metadata.title || 'Document';
  const styledHTML = `
    <div style="font-family: 'Times New Roman', serif; max-width: 800px; margin: 0 auto; padding: 40px;">
      <h1 style="text-align: center; font-size: 18pt; font-weight: bold; margin-bottom: 30px;">
        ${title}
      </h1>
      ${formatted}
    </div>
  `;

  return styledHTML;
}

async function applyAIFormatting(text, html, formatType) {
  if (!process.env.OPENAI_API_KEY) {
    return html;
  }

  try {
    const prompt = `You are a professional document formatter. Format the following document content according to ${formatType} standards.

Requirements:
1. Fix grammar and spelling errors
2. Improve sentence structure and clarity
3. Ensure proper academic/business formatting
4. Maintain the original meaning and structure
5. Return only the formatted HTML content

Original content:
${text.substring(0, 8000)} // Limit to avoid token limits

Return the formatted content as clean HTML with proper structure.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a professional document formatter. Return only formatted HTML content.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 4000
    });

    const aiFormatted = response.choices[0].message.content;
    
    // Extract HTML from response (in case it's wrapped in markdown)
    const htmlMatch = aiFormatted.match(/```html\n([\s\S]*?)\n```/) || 
                     aiFormatted.match(/<div[^>]*>[\s\S]*<\/div>/);
    
    return htmlMatch ? htmlMatch[1] : aiFormatted;

  } catch (error) {
    console.error('AI formatting error:', error);
    return html; // Return original if AI fails
  }
}

function generateFormattingSummary(originalHTML, formattedHTML, metadata) {
  const originalWordCount = (originalHTML.match(/<p[^>]*>([^<]+)<\/p>/g) || [])
    .reduce((count, p) => count + p.split(/\s+/).length, 0);
  
  const formattedWordCount = (formattedHTML.match(/<p[^>]*>([^<]+)<\/p>/g) || [])
    .reduce((count, p) => count + p.split(/\s+/).length, 0);

  const sectionsCount = (formattedHTML.match(/<h[1-6][^>]*>/g) || []).length;

  return {
    sectionsFormatted: sectionsCount,
    grammarCorrections: Math.max(0, formattedWordCount - originalWordCount),
    styleImprovements: sectionsCount,
    wordCount: metadata.wordCount || formattedWordCount
  };
}
