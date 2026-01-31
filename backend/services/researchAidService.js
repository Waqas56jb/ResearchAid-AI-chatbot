import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
});

/**
 * Summarize an academic paper
 */
export async function summarizePaper(text, options = {}) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = `You are an academic research assistant. Provide a concise overview summary of the following academic paper.

CRITICAL REQUIREMENTS:
1. Write ONLY in complete paragraphs - NO headings, NO subheadings, NO bullets, NO numbered lists
2. Provide a short, comprehensive overview (300-500 words) in 3-5 flowing paragraphs
3. Cover: main topic, key findings, methodology (briefly), and conclusions - all in paragraph form
4. Use academic language and maintain objectivity
5. Write naturally flowing text - paragraphs should connect smoothly
6. DO NOT use any markdown formatting, labels, or structured sections
7. DO NOT include "Title:", "Authors:", "Abstract/Overview:", "Key Findings:", "Methodology:", "Conclusions:" labels
8. Just write the overview as continuous paragraphs

Paper content:
${text.substring(0, 12000)}

Write a concise overview summary in paragraph form only.`;

    const response = await openai.chat.completions.create({
      model: options.model || 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert academic research assistant. Write concise, paragraph-based overview summaries. Never use headings, bullets, or structured sections - only flowing paragraphs.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    });

    return {
      summary: response.choices[0].message.content,
      wordCount: text.split(/\s+/).length,
      model: options.model || 'gpt-3.5-turbo'
    };

  } catch (error) {
    console.error('Summarization error:', error);
    throw new Error(`Failed to summarize paper: ${error.message}`);
  }
}

/**
 * Generate research questions from a paper or topic
 */
export async function generateResearchQuestions(text, topic = null, options = {}) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    const context = topic 
      ? `Topic: ${topic}\n\nGenerate research questions based on this topic.`
      : `Based on the following academic paper, generate relevant research questions that could extend or explore related areas.\n\nPaper content:\n${text.substring(0, 8000)}`;

    const prompt = `You are an academic research assistant. Generate 5-8 high-quality research questions.

Requirements:
1. Questions should be specific, answerable, and researchable
2. Cover different aspects: theoretical, methodological, practical applications
3. Questions should be suitable for academic research
4. Format as a numbered list
5. Include brief context for each question (1-2 sentences)

${context}

Generate research questions that are:
- Clear and specific
- Theoretically grounded
- Methodologically feasible
- Significant to the field`;

    const response = await openai.chat.completions.create({
      model: options.model || 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert academic researcher who formulates high-quality research questions for scholarly work.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    return {
      questions: response.choices[0].message.content,
      count: (response.choices[0].message.content.match(/\d+\./g) || []).length
    };

  } catch (error) {
    console.error('Research questions generation error:', error);
    throw new Error(`Failed to generate research questions: ${error.message}`);
  }
}

/**
 * Critique arguments in an academic paper
 */
export async function critiqueArguments(text, options = {}) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = `You are a critical academic reviewer. Analyze and critique the arguments presented in the following academic paper.

Requirements:
1. Identify the main arguments and claims
2. Evaluate the strength of evidence and reasoning
3. Point out potential weaknesses, limitations, or gaps
4. Suggest improvements or alternative perspectives
5. Maintain academic objectivity and constructive criticism
6. Structure your critique with clear sections

Paper content:
${text.substring(0, 12000)}

Format your critique with:
- Summary of Main Arguments
- Strengths
- Weaknesses and Limitations
- Critical Analysis
- Suggestions for Improvement`;

    const response = await openai.chat.completions.create({
      model: options.model || 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert academic critic who provides thorough, constructive, and objective analysis of scholarly arguments. Your critiques help researchers improve their work.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.4,
      max_tokens: 2000
    });

    return {
      critique: response.choices[0].message.content,
      wordCount: text.split(/\s+/).length
    };

  } catch (error) {
    console.error('Critique error:', error);
    throw new Error(`Failed to critique arguments: ${error.message}`);
  }
}

/**
 * Generate formatted citations
 */
export async function generateCitations(paperInfo, format = 'APA', options = {}) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    const formatGuidelines = {
      'APA': 'American Psychological Association (APA) 7th edition format',
      'MLA': 'Modern Language Association (MLA) 9th edition format',
      'Harvard': 'Harvard referencing style',
      'Chicago': 'Chicago Manual of Style format'
    };

    const prompt = `You are a citation expert. Generate a properly formatted citation in ${format} style (${formatGuidelines[format] || formatGuidelines['APA']}).

Paper information:
${JSON.stringify(paperInfo, null, 2)}

Requirements:
1. Follow ${format} style guidelines exactly
2. Include all necessary elements (author, title, year, journal, etc.)
3. Format correctly with proper punctuation and capitalization
4. If information is missing, indicate with [n.d.] or appropriate placeholder
5. Provide both in-text citation and full reference

Generate the citation in the requested format.`;

    const response = await openai.chat.completions.create({
      model: options.model || 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are an expert in academic citation formats. You generate accurate, properly formatted citations according to ${format} style guidelines.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 500
    });

    return {
      citation: response.choices[0].message.content,
      format: format,
      paperInfo: paperInfo
    };

  } catch (error) {
    console.error('Citation generation error:', error);
    throw new Error(`Failed to generate citation: ${error.message}`);
  }
}

/**
 * Generate dissertation outline from topic
 */
export async function generateDissertationOutline(topic, field = 'Computer Science', options = {}) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = `You are an academic advisor. Create a comprehensive dissertation outline for a student in ${field}.

Topic: ${topic}

Requirements:
1. Create a detailed outline with chapters and sections
2. Include standard dissertation structure:
   - Abstract
   - Introduction
   - Literature Review
   - Methodology
   - Results/Findings
   - Discussion
   - Conclusion
   - References
3. For each chapter, provide:
   - Main sections
   - Subsections (where relevant)
   - Brief description of what should be covered (1-2 sentences)
4. Ensure logical flow and academic rigor
5. Format as a structured outline with clear hierarchy

Generate a comprehensive dissertation outline that demonstrates academic depth and proper structure.`;

    const response = await openai.chat.completions.create({
      model: options.model || 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an experienced academic advisor who creates well-structured, comprehensive dissertation outlines that guide students through their research journey.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.5,
      max_tokens: 2000
    });

    return {
      outline: response.choices[0].message.content,
      topic: topic,
      field: field
    };

  } catch (error) {
    console.error('Dissertation outline generation error:', error);
    throw new Error(`Failed to generate dissertation outline: ${error.message}`);
  }
}

/**
 * Research Aid Main: Generate comprehensive academic summary from a topic.
 * Given a topic/query, produces a high-quality formal report based on academic sources,
 * with 10-15 references. Automates research and literature review.
 */
export async function generateResearchAidReport(query, options = {}) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    const wordCount = Math.min(Math.max(parseInt(options.wordCount, 10) || 1000, 500), 5000);

    const systemContent = `You are an expert academic research assistant that automates the research and literature review process. Your role is to produce high-quality, comprehensive summaries of topics using only academic-style sources and references.

Guidelines:
- Write in a formal, academic style suitable for reports and literature reviews.
- Use universal formatting: clear numbered sections (1., 1.1, 2., etc.), professional tone, and flowing prose.
- Be friendly and accessible in tone while maintaining academic rigor—generalized and advanced in writing.
- Support every major claim with in-text citations in the form (Author, Year).
- Include exactly 10-15 high-quality references at the end. For each reference use this format: Author, Year. Title. Journal/Publisher, Volume(Issue), pp.pages. URL: https://... (provide a real, verifiable link: prefer https://doi.org/... for papers, or https://scholar.google.com/scholar?q=Title+Author+Year for search, or official publisher link—only use real URLs you know; do not invent).
- Structure: Title, Introduction, logical sections (e.g. Definitions, Historical Foundations, Technical Foundations, Applications, Ethics, Challenges, Future Directions), Conclusion, References.
- No code, no figures; text only. No markdown bold in headings—use plain numbered headings like "1. Introduction".`;

    const userPrompt = `Produce a comprehensive academic report based on the following request. The report must be strictly based on high-quality academic sources (peer-reviewed literature, scholarly reviews, seminal papers). Aim for approximately ${wordCount} words. Use universal formatting and a formal report style.

User request:
${query.substring(0, 8000)}

Requirements:
1. Write a formal, academic-style report with a clear title and numbered sections.
2. Include: Introduction, main body sections (adapt to the topic—e.g. definitions, history, technical foundations, applications, ethics, challenges, future directions), Conclusion, and References.
3. All major points must be supported by in-text citations (Author, Year).
4. End with a "References" section with 10-15 sources. Each reference must be: citation text in academic style (Author, Year. Title. Journal/Publisher, Vol(Issue), pp.pages.) followed by " URL: " and a valid link. Use only real, verifiable URLs: prefer https://doi.org/... for articles, or https://scholar.google.com/scholar?q=... for a search link (e.g. q=encoded+paper+title+author), or official .edu/.gov/.org publisher pages. Do not make up URLs.
5. Use numbered headings only (1., 1.1, 2., 2.1, etc.). No bullet points for section titles. No markdown bold in headings.
6. Write in a natural, humanized academic voice—friendly, focused, and of high quality.`;

    const response = await openai.chat.completions.create({
      model: options.model || 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemContent },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.5,
      max_tokens: 4096
    });

    let fullResponse = response.choices[0].message.content || '';

    // Light cleanup: remove markdown bold from headings
    fullResponse = fullResponse.replace(/^(\d+(?:\.\d+)*)\s+\*\*(.+?)\*\*/gim, '$1 $2');
    const wordCountActual = fullResponse.split(/\s+/).filter(w => w.length > 0).length;

    return {
      response: fullResponse,
      wordCount: wordCountActual,
      model: options.model || 'gpt-4-turbo-preview',
      sections: extractSections(fullResponse)
    };
  } catch (error) {
    console.error('Research Aid report generation error:', error);
    throw new Error(`Failed to generate Research Aid report: ${error.message}`);
  }
}

/**
 * Stream Research Aid report token-by-token (async generator).
 * Yields { content: string } for each chunk; callers accumulate for full text.
 */
export async function* streamResearchAidReport(query, options = {}) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const wordCount = Math.min(Math.max(parseInt(options.wordCount, 10) || 1000, 500), 5000);
  const systemContent = `You are an expert academic research assistant that automates the research and literature review process. Your role is to produce high-quality, comprehensive summaries of topics using only academic-style sources and references.

Guidelines:
- Write in a formal, academic style suitable for reports and literature reviews.
- Use universal formatting: clear numbered sections (1., 1.1, 2., etc.), professional tone, and flowing prose.
- Be friendly and accessible in tone while maintaining academic rigor—generalized and advanced in writing.
- Support every major claim with in-text citations in the form (Author, Year).
- Include exactly 10-15 high-quality references at the end. For each reference use: Author, Year. Title. Journal/Publisher, Volume(Issue), pp.pages. URL: https://... (real link: prefer doi.org, scholar.google.com/scholar?q=..., or official publisher—do not invent URLs).
- Structure: Title, Introduction, logical sections (e.g. Definitions, Historical Foundations, Technical Foundations, Applications, Ethics, Challenges, Future Directions), Conclusion, References.
- No code, no figures; text only. No markdown bold in headings—use plain numbered headings like "1. Introduction".`;

  const userPrompt = `Produce a comprehensive academic report based on the following request. The report must be strictly based on high-quality academic sources (peer-reviewed literature, scholarly reviews, seminal papers). Aim for approximately ${wordCount} words. Use universal formatting and a formal report style.

User request:
${query.substring(0, 8000)}

Requirements:
1. Write a formal, academic-style report with a clear title and numbered sections.
2. Include: Introduction, main body sections (adapt to the topic—e.g. definitions, history, technical foundations, applications, ethics, challenges, future directions), Conclusion, and References.
3. All major points must be supported by in-text citations (Author, Year).
4. End with a "References" section with 10-15 sources. Each reference: citation (Author, Year. Title. Journal/Publisher, Vol(Issue), pp.pages.) then " URL: " and a valid link (https://doi.org/..., or https://scholar.google.com/scholar?q=..., or official .edu/.gov/.org). Only use real, verifiable URLs.
5. Use numbered headings only (1., 1.1, 2., 2.1, etc.). No bullet points for section titles. No markdown bold in headings.
6. Write in a natural, humanized academic voice—friendly, focused, and of high quality.`;

  const stream = await openai.chat.completions.create({
    model: options.model || 'gpt-4-turbo-preview',
    messages: [
      { role: 'system', content: systemContent },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.5,
    max_tokens: 4096,
    stream: true
  });

  for await (const chunk of stream) {
    const text = chunk.choices?.[0]?.delta?.content;
    if (text) yield { content: text };
  }
}

/**
 * Generate comprehensive assignment response from requirements (legacy)
 */
export async function generateAssignmentResponse(assignmentText, options = {}) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = `You are an expert academic writer and researcher specializing in creating comprehensive, publication-quality assignment responses. Generate a complete, professional assignment response based on the following assignment brief/requirements.

Assignment Brief/Requirements:
${assignmentText.substring(0, 15000)}

CRITICAL REQUIREMENTS FOR THE RESPONSE:

1. STRUCTURE & FORMATTING:
   - Create a complete, well-structured academic document
   - Include all sections mentioned in the assignment brief
   - Use clear hierarchical headings (## for main sections, ### for subsections)
   - Include proper academic formatting and professional presentation
   - Word count: Aim for 3000-3500 words for comprehensive MSc level assignments

2. CONTENT QUALITY - HUMANIZED & NATURAL:
   - Use professional academic language with natural, humanized tone
   - Avoid AI-generated patterns - write like a real researcher
   - Use varied sentence structures and natural transitions
   - Demonstrate deep understanding and critical analysis
   - Provide detailed, realistic technical descriptions (NO CODE)
   - Include specific examples, methodologies, and approaches
   - Show evidence of research and scholarship
   - Address ALL assignment criteria comprehensively
   - Write in polished, lengthy, detailed manner

3. REQUIRED SECTIONS (adapt based on assignment brief):
   - Introduction: Context, objectives, scope (detailed)
   - Literature Review: State-of-the-art research, gaps, opportunities (extensive)
   - Requirements Analysis: Functional and non-functional requirements (comprehensive)
   - System Architecture/Design: TEXTUAL architecture description with vertical flow using arrows
   - Implementation: Technical details, methodologies, approaches (NO CODE)
   - Testing: Testing strategies, results, evaluation metrics
   - Deployment: Deployment process, configuration, hosting
   - Evaluation: Critical assessment, limitations, future improvements
   - Conclusion: Summary, contributions, outcomes
   - References: Harvard style citations (minimum 10-12 sources)

4. STRICT PROHIBITIONS:
   - NO code snippets, code examples, or programming code whatsoever
   - NO figures, diagrams, images, or visual elements
   - NO code blocks or technical code demonstrations
   - Architecture must be described TEXTUALLY with vertical flow using arrows

5. ARCHITECTURE DESCRIPTION REQUIREMENT:
   - Describe architecture using text-based vertical flow
   - Use format: "Component A → Component B → Component C"
   - Explain data flow, component interactions, and system structure textually
   - Example: "The system follows a vertical architecture where user requests flow downward through multiple layers: User Interface Layer → Authentication Service → Request Processing Module → Business Logic Layer → Data Access Layer → Database Storage → Response Generation → Output Formatter → User Interface, with each layer performing specific transformations on the data as it moves through the system."

6. ACADEMIC RIGOR:
   - Include in-text citations in format: (Author, Year)
   - Provide detailed analysis, not just description
   - Demonstrate critical thinking and evaluation
   - Show understanding of current research and best practices
   - Include realistic technical specifications and metrics (textually described)

7. CITATIONS & REFERENCES:
   - Use Harvard referencing style
   - Include 10-12 academic sources
   - Mix of recent research papers, official guidelines, and authoritative sources
   - Format: Author, Year. Title. Journal/Publisher. URL (if applicable)

Generate a professional, comprehensive assignment response that:
- Meets all assignment requirements
- Demonstrates mastery of the subject
- Shows critical analysis and research depth
- Is ready for submission (publication-quality)
- Follows academic writing standards

Begin the response with a clear title and introduction. End with a comprehensive conclusion and properly formatted references list.`;

    // Generate in multiple parts to ensure comprehensive length (3000-3500 words)
    let fullResponse = '';
    
    // First part: Abstract, Introduction, Literature Review, Requirements
    const part1Prompt = `Generate the FIRST PART of a comprehensive, humanized academic assignment response (approximately 1400-1600 words). 

CRITICAL REQUIREMENTS:
- NO code snippets, code examples, or programming code whatsoever
- NO figures, diagrams, images, or visual elements
- Pure textual content only
- Humanized, natural academic writing style (not AI-generated sounding)
- Detailed, lengthy, and polished content
- Use NUMBERED headings: 1., 1.1, 1.1.1 format (NOT ## or ###, NOT bullet points)
- ALL major sections must be numbered headings (Introduction, Conclusion, References - NOT bullet points)
- NO extra dashes or lines (--)
- Professional academic formatting

Include in this order - CRITICAL: Every main section MUST start with its number:
- Title (centered, bold, no numbering, standalone line) - MUST be the first line of your response
- Abstract (200-300 words) - standalone section, no numbering, provide comprehensive summary of entire assignment
- 1. Introduction (400-500 words) - provide context, background, significance, objectives
  CRITICAL: MUST start with "1. Introduction" (with the number) - do NOT write just "Introduction"
- 2. Literature Review (700-900 words) with numbered subsections:
  CRITICAL: MUST start with "2. Literature Review" (with the number) - do NOT write just "Literature Review"
  2.1 State-of-the-Art Research
  2.2 Gaps and Opportunities
  2.3 Critical Analysis
- 3. Requirements Analysis (300-400 words) with numbered subsections:
  CRITICAL: MUST start with "3. Requirements Analysis" (with the number) - do NOT write just "Requirements Analysis"
  3.1 Functional Requirements
  3.2 Non-Functional Requirements

Assignment Brief/Requirements:
${assignmentText.substring(0, 15000)}

IMPORTANT FORMATTING:
- Title: Centered, bold, large font, standalone
- Abstract: Labeled "Abstract" (bold), then paragraph text, standalone section
- All sections: Use numbered format 1., 1.1, 1.1.1 - NEVER use bullet points for section headings
- NEVER use markdown bold (**text**) in headings - just plain text: "1. Introduction" NOT "1. **Introduction**"
- Each numbered heading on its own line
- Proper line breaks between sections
- Write in a natural, human academic style with varied sentence structure.`;

    const response1 = await openai.chat.completions.create({
      model: options.model || 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert academic writer with years of experience. Write in a natural, humanized style that sounds like a real researcher wrote it. Avoid AI-generated patterns. Use varied sentence structures, natural transitions, and authentic academic voice. Never include code or figures. CRITICAL: When writing headings, ALWAYS include the number: "1. Introduction", "2. Literature Review", "3. Requirements Analysis", etc. Use plain text format like "1. Introduction" NOT "1. **Introduction**" - do NOT use markdown bold in headings. Every main section MUST start with its number. IMPORTANT: When listing items under subheadings (like under "6.1 Testing Strategies"), do NOT repeat the main section number (e.g., do NOT write "6. Unit Testing:" - just write "Unit Testing:"). Do NOT bold list item labels. CRITICAL: Do NOT use markdown bold (**text**) in regular paragraphs or list items - only headings should be bold. Regular text should be plain text without bold formatting.'
        },
        {
          role: 'user',
          content: part1Prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 4000 // Within model limits
    });

    fullResponse = response1.choices[0].message.content + '\n\n';

    // Second part: Architecture (flowchart style), Implementation (no code), Testing
    const part2Prompt = `Generate the SECOND PART of the assignment response (approximately 1000-1200 words).

CRITICAL REQUIREMENTS:
- NO code snippets, code examples, or programming code
- NO figures, diagrams, or visual elements
- Architecture must be described as FLOWCHARTS using structured text format
- Use flowchart-style descriptions with boxes, arrows, and decision points
- Format: Use structured flowchart notation with boxes [Component Name] and arrows ↓
- Humanized, natural writing style
- Use NUMBERED headings: 4., 4.1, 4.2 format
- NO extra dashes (--)

Include:
- 4. System Architecture/Design (500-600 words) with flowchart-style description:
  * 4.1 Architecture Overview - Describe overall structure
  * 4.2 System Flowchart - Present architecture as structured flowchart:
    Format example:
    [User Interface]
         ↓
    [Authentication Module]
         ↓
    [Request Handler]
         ↓
    [Business Logic Layer]
         ↓
    [Data Access Layer]
         ↓
    [Database]
         ↓
    [Response Formatter]
         ↓
    [User Interface]
  CRITICAL: For the flowchart, ONLY show the component names in boxes with arrows. Do NOT add:
  - Bullet point descriptions like "• User Interface: This is the system's entry point..."
  - Detailed explanations like "User Interface: Acts as the entry and exit points..."
  - Any text describing components after the flowchart
  - Just show the flowchart diagram with component names, nothing else.
  
- 5. Implementation (400-500 words) WITHOUT code:
  * 5.1 Implementation Approach
  * 5.2 Technical Methodologies
  * 5.3 Algorithm Descriptions (conceptual, no code)
  
- 6. Testing (300-400 words) with numbered subsections:
  CRITICAL: MUST start with "6. Testing" (with the number) - do NOT write just "Testing"
  6.1 Testing Strategies
    - List testing strategies as plain text descriptions
    - Format as: "Unit Testing: Each component is tested individually to ensure it performs correctly."
    - Do NOT use "6." prefix for list items (e.g., write "Unit Testing:" NOT "6. Unit Testing:")
    - Do NOT bold strategy names - use plain text
    - Do NOT use markdown bold (**text**) for strategy names
  6.2 Testing Methodologies
    - List methodologies as plain text descriptions
    - Format as: "Manual Testing: Testers manually operate the system, checking for bugs and errors."
    - Do NOT use "6." prefix for list items (e.g., write "Manual Testing:" NOT "6. Manual Testing:")
    - Do NOT bold methodology names - use plain text
    - Do NOT use markdown bold (**text**) for methodology names
  6.3 Validation

Continue numbering from previous sections. Use numbered headings: 4., 4.1, 4.2, 5., 5.1, 6., 6.1, etc. Write naturally and humanized. NO extra dashes. CRITICAL REMINDERS: For flowcharts, ONLY show component names with arrows - NO descriptions. For list items under "6.1" or "6.2", do NOT use "6." prefix - just write "Unit Testing:" NOT "6. Unit Testing:".`;

    const response2 = await openai.chat.completions.create({
      model: options.model || 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert academic writer. Describe architecture using vertical flow with arrows. Never include code or figures. Write in a natural, humanized academic style. CRITICAL: For flowcharts, ONLY show component names in boxes with arrows - do NOT add bullet point descriptions explaining each component. For list items under subheadings, do NOT repeat the main section number (e.g., under "6.1" write "Unit Testing:" NOT "6. Unit Testing:"). Do NOT bold list item labels.'
        },
        {
          role: 'user',
          content: part2Prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 4000 // Within model limits
    });

    fullResponse += response2.choices[0].message.content + '\n\n';

    // Third part: Deployment, Evaluation, Conclusion, References
    const part3Prompt = `Generate the FINAL PART of the assignment response (approximately 1000-1200 words).

CRITICAL REQUIREMENTS:
- NO code snippets or programming examples
- NO figures or diagrams
- Pure textual content
- Humanized, natural academic writing
- Use NUMBERED headings: 7., 7.1, 8., 8.1, 9., 10. format
- NEVER use markdown bold (**text**) in headings - just plain text: "9. Conclusion" NOT "9. **Conclusion**"
- Conclusion and References MUST be numbered headings (9. Conclusion, 10. References) - NOT bullet points
- References in Harvard style: NO bold, NO website URLs, NO hyperlinks
- Format: Author, Year. Title. Journal Name, Volume(Issue), pages. Publisher.
- Each reference on separate line with proper indentation

Include:
- 7. Deployment (400-500 words) with numbered subsections:
  CRITICAL: MUST start with "7. Deployment" (with the number) - do NOT write just "Deployment"
  7.1 Deployment Process
  7.2 Configuration and Setup
  7.3 Environment Configuration
  
- 8. Evaluation (500-600 words) with numbered subsections:
  CRITICAL: MUST start with "8. Evaluation" (with the number) - do NOT write just "Evaluation"
  IMPORTANT: Do NOT use bullet points for "Evaluation" - it must be a numbered heading "8. Evaluation"
  8.1 Performance Analysis
  8.2 Critical Assessment
  8.3 Limitations
  8.4 Future Improvements
  
- 9. Conclusion (200-300 words) - MUST be numbered heading "9. Conclusion", NOT bullet point
  CRITICAL: MUST start with "9. Conclusion" (with the number) - do NOT write just "Conclusion"
  Summarize key points, contributions, and outcomes
  
- 10. References (Harvard style, minimum 10-12 high-quality academic sources):
  CRITICAL: MUST start with "10. References" (with the number) - do NOT write just "References"
  Format as numbered heading "10. References" (NOT bullet point)
  
  Each reference MUST follow this EXACT format:
  1. Author, A., Year. *Title in Italics*. Journal Name, Volume(Issue), pp.pages.
  2. Author, A. and Author, B., Year. *Book Title*. Publisher Location: Publisher Name.
  3. Author, A., Year. *Title*. Conference Name, Location, Date.
  
  Format requirements:
  - Number each reference (1., 2., 3., etc.)
  - Use italics (*Title*) for article titles, book titles, journal names
  - Use "pp." for page ranges (e.g., pp.45-59)
  - Include volume and issue numbers for journals: Volume(Issue)
  - For books: Publisher Location: Publisher Name
  - For online sources: [online] Available at: <URL> [Accessed Date]
  - NO bold text, NO website URLs in final output (remove URLs)
  - Mix of: peer-reviewed journal articles, academic books, conference papers, government reports, reputable online sources
  
  Example format:
  1. Smith, J., 2020. *Climate Effects on Agriculture*. Journal of Agriculture, 12(3), pp.45-59.
  2. Doe, A., 2019. *Soil Studies and Environmental Impacts*. Environmental Research, 8(2), pp.101-115.
  3. Brown, L. and Green, M., 2021. *Emergency Management Chatbots*. International Journal of Human-Computer Interaction, 37(10), pp.987-1002.
  
  Generate MINIMUM 10 high-quality, relevant academic references related to the assignment topic.

Continue numbering from previous sections. Use numbered headings: 7., 7.1, 8., 8.1, 9., 10. Write in a natural, polished, humanized academic voice. NO extra dashes. NO bullet points for major sections.`;

    const response3 = await openai.chat.completions.create({
      model: options.model || 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert academic writer specializing in Harvard referencing style. Generate comprehensive, humanized content. Never include code or figures. Write naturally with varied sentence structure and authentic academic voice. CRITICAL: When writing headings, ALWAYS include the number: "7. Deployment", "8. Evaluation", "9. Conclusion", "10. References". Use plain text format like "9. Conclusion" NOT "9. **Conclusion**" - do NOT use markdown bold in headings. Every main section MUST start with its number. IMPORTANT: Do NOT use bullet points for main sections like "• Evaluation" - it MUST be "8. Evaluation" as a numbered heading. CRITICAL: Do NOT use markdown bold (**text**) in regular paragraphs, descriptions, or list items - only headings should be bold. All regular text should be plain text. For references, use EXACT format: Number. Author, Year. *Title in Italics*. Journal/Publisher, Volume(Issue), pp.pages. Generate at least 10 high-quality academic references.'
        },
        {
          role: 'user',
          content: part3Prompt
        }
      ],
      temperature: 0.7, // Lower temperature for more consistent reference formatting
      max_tokens: 4000 // Reduced to ensure we stay within model limits (4096 max completion tokens)
    });

    fullResponse += response3.choices[0].message.content;

    // Extract word count
    const wordCount = fullResponse.split(/\s+/).filter(word => word.length > 0).length;

    // Clean up markdown formatting from headings (remove **bold** from headings)
    fullResponse = fullResponse.replace(/^(\d+(?:\.\d+)*)\s+\*\*(.+?)\*\*/gim, '$1 $2');
    
    // Clean up any bullet points that should be headings - comprehensive list
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
    
    // First, handle specific known sections
    fullResponse = fullResponse.replace(/^[\*\-\+]\s*(Conclusion|References|Introduction|Abstract|Literature Review|Requirements Analysis|System Architecture|Implementation|Testing|Deployment|Evaluation)/gim, (match, title) => {
      // Abstract doesn't get a number
      if (title.toLowerCase().includes('abstract')) return 'Abstract';
      
      // Find matching section
      for (const section of mainSections) {
        if (section.pattern.test(title)) {
          return `${section.number}${title}`;
        }
      }
      
      // Fallback for unknown sections
      return title;
    });
    
    // Fix headings that are missing numbers - catch ALL main sections
    // This regex catches standalone section names on their own line (must be at start of line, followed by newline or end)
    fullResponse = fullResponse.replace(/^(Introduction|Literature Review|Requirements Analysis|System Architecture\/Design|Implementation|Testing|Deployment|Evaluation|Conclusion|References)$/gim, (match, title) => {
      // Skip if already numbered
      if (match.match(/^\d+\./)) {
        return match;
      }
      
      for (const section of mainSections) {
        if (section.pattern.test(title)) {
          return `${section.number}${title}`;
        }
      }
      return match;
    });
    
    // Fix bullet points that should be main headings (e.g., "• Evaluation" should be "8. Evaluation")
    // This must happen BEFORE processing list items
    fullResponse = fullResponse.replace(/^[\*\-\+]\s*(Testing|Deployment|Evaluation|Conclusion|References)$/gim, (match, title) => {
      // Check if this appears after a numbered subheading (e.g., after "7.3" it should be "8. Evaluation")
      for (const section of mainSections) {
        if (section.pattern.test(title)) {
          return `${section.number}${title}`;
        }
      }
      return match;
    });
    
    // Fix repeated numbering in list items (e.g., "**6. Unit Testing:**" should be just "Unit Testing:")
    // Remove "6." prefix from items under "6.1" or "6.2" sections
    // Process line by line to check context
    const responseLines1 = fullResponse.split('\n');
    const fixedLines = responseLines1.map((line, index) => {
      const trimmed = line.trim();
      
      // Check if this line has "6." prefix and we're in a "6.1" or "6.2" section
      if (trimmed.match(/^(\*\*)?6\.\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*):/)) {
        // Check previous lines to see if we're in a "6.1" or "6.2" section
        const prevContext = responseLines1.slice(Math.max(0, index - 5), index).join('\n');
        if (prevContext.match(/6\.(1|2)\s+/)) {
          // Remove "6." prefix and bold formatting
          return line.replace(/^(\*\*)?6\.\s+/, '').replace(/\*\*/g, '');
        }
      }
      
      // Remove bold from list item labels (e.g., "**Unit Testing:**" should be "Unit Testing:")
      if (trimmed.match(/^\*\*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*):\*\*/)) {
        return line.replace(/^\*\*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*):\*\*/gim, '$1:');
      }
      
      return line;
    });
    
    fullResponse = fixedLines.join('\n');
    
    // Also do global replacements as fallback
    fullResponse = fullResponse.replace(/^(\*\*)?6\.\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*):\*\*/gim, '$2:');
    fullResponse = fullResponse.replace(/^(\*\*)?6\.\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*):/gim, '$2:');
    fullResponse = fullResponse.replace(/^\*\*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*):\*\*/gim, '$1:');
    
    // Also catch section names that appear at the start of a line followed by text (but not if already numbered)
    fullResponse = fullResponse.replace(/^(Introduction|Literature Review|Requirements Analysis|System Architecture\/Design|Implementation|Testing|Deployment|Evaluation|Conclusion|References)(\s+[A-Z])/gim, (match, title, trailing) => {
      // Check if it's already numbered
      const prevChar = match.substring(0, match.indexOf(title));
      if (prevChar.match(/\d+\./)) {
        return match;
      }
      
      for (const section of mainSections) {
        if (section.pattern.test(title)) {
          return `${section.number}${title}${trailing}`;
        }
      }
      return match;
    });
    
    // Also handle any other bullet points that look like main headings (capitalized, standalone)
    fullResponse = fullResponse.replace(/^[\*\-\+]\s+([A-Z][A-Za-z\s/]+)$/gm, (match, title) => {
      // Skip if it's already a numbered heading or if it's too short/long
      if (title.length < 5 || title.length > 80) return match;
      
      // Check if it matches any known section pattern
      for (const section of mainSections) {
        if (section.pattern.test(title)) {
          return `${section.number}${title}`;
        }
      }
      
      // If it looks like a main heading (capitalized, no numbers), try to infer
      // But be conservative - only convert if it's clearly a section heading
      if (title.match(/^(Introduction|Literature|Requirements|System|Architecture|Implementation|Testing|Deployment|Evaluation|Conclusion|References)/i)) {
        for (const section of mainSections) {
          if (section.pattern.test(title)) {
            return `${section.number}${title}`;
          }
        }
      }
      
      return match; // Keep original if unsure
    });
    
    // Ensure all main headings are properly numbered and formatted
    // Fix patterns like "1. **Introduction**" to "1. Introduction"
    fullResponse = fullResponse.replace(/^(\d+\.)\s+\*\*(.+?)\*\*/gim, '$1 $2');
    
    // Fix subheadings like "2.1 **State-of-the-Art Research**" to "2.1 State-of-the-Art Research"
    fullResponse = fullResponse.replace(/^(\d+\.\d+)\s+\*\*(.+?)\*\*/gim, '$1 $2');
    
    // Remove ALL bold formatting from regular text (not headings)
    // This ensures paragraphs and list items are NOT bold
    // Process line by line to preserve headings but remove bold from text
    const allLines = fullResponse.split('\n');
    const cleanedText = allLines.map((line) => {
      const trimmed = line.trim();
      
      // Skip if it's a heading (numbered or markdown heading)
      if (trimmed.match(/^\d+\.\s+/) || trimmed.match(/^#{1,4}\s+/)) {
        // Remove bold from heading text but keep the heading structure
        return line.replace(/\*\*(.+?)\*\*/g, '$1');
      }
      
      // For regular text, remove ALL bold formatting
      return line.replace(/\*\*(.+?)\*\*/g, '$1');
    });
    
    fullResponse = cleanedText.join('\n');
    
    // Format references section - ensure proper numbering and format
    fullResponse = fullResponse.replace(/10\.\s+References[\s\S]*?(?=\n\n|$)/gi, (match) => {
      // Remove URLs from references
      let refs = match.replace(/https?:\/\/[^\s]+/gi, '');
      refs = refs.replace(/\[online\]\s*Available at:\s*<[^>]+>\s*\[Accessed[^\]]+\]/gi, '');
      refs = refs.replace(/<https?:\/\/[^>]+>/gi, '');
      
      // Split into lines and process each reference
      const refLines = refs.split('\n');
      let formattedRefs = '10. References\n\n';
      let refCounter = 1;
      
      refLines.forEach((line, index) => {
        if (index === 0) return; // Skip "10. References" line
        
        const trimmed = line.trim();
        if (!trimmed || trimmed === '') {
          return; // Skip empty lines
        }
        
        // Check if line is already a numbered reference
        const numberedMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
        if (numberedMatch) {
          const refNum = numberedMatch[1];
          const refContent = numberedMatch[2];
          
          // Ensure proper format: Author, Year. *Title*. Journal, Volume(Issue), pp.pages.
          // Fix common issues
          let formattedContent = refContent
            .replace(/([A-Z][a-z]+,\s*[A-Z]\.),\s*(\d{4})\./g, '$1 $2.') // Fix comma before year
            .replace(/(\d{4})\.\s+([^*])/g, '$1. *$2') // Ensure title starts with *
            .replace(/\*([^*]+)\*/g, '*$1*'); // Ensure title is properly italicized
          
          formattedRefs += `${refNum}. ${formattedContent}\n`;
          refCounter = parseInt(refNum) + 1;
        } else if (trimmed.match(/^[A-Z][a-z]+,\s*[A-Z]\./)) {
          // Reference without number - add number
          formattedRefs += `${refCounter}. ${trimmed}\n`;
          refCounter++;
        } else if (trimmed.match(/^[A-Z]/)) {
          // Might be a continuation or new reference
          const prevLine = refLines[index - 1]?.trim();
          if (prevLine && prevLine.match(/^\d+\./)) {
            // Continuation of previous reference
            formattedRefs += ` ${trimmed}\n`;
          } else {
            // New reference without number
            formattedRefs += `${refCounter}. ${trimmed}\n`;
            refCounter++;
          }
        } else {
          // Other content - keep as is
          formattedRefs += `${trimmed}\n`;
        }
      });
      
      // Ensure minimum 10 references
      const refCount = (formattedRefs.match(/^\d+\.\s+/gm) || []).length;
      if (refCount < 10) {
        console.warn(`Only ${refCount} references found. Minimum 10 required.`);
      }
      
      return formattedRefs;
    });
    
    // Ensure all main sections have proper numbering - final pass
    // This catches any remaining unnumbered main sections that appear at the start of a line
    const sectionPatterns = [
      { pattern: /^Introduction$/gim, number: '1. ' },
      { pattern: /^Literature Review$/gim, number: '2. ' },
      { pattern: /^Requirements Analysis$/gim, number: '3. ' },
      { pattern: /^System Architecture\/Design$/gim, number: '4. ' },
      { pattern: /^Implementation$/gim, number: '5. ' },
      { pattern: /^Testing$/gim, number: '6. ' },
      { pattern: /^Deployment$/gim, number: '7. ' },
      { pattern: /^Evaluation$/gim, number: '8. ' },
      { pattern: /^Conclusion$/gim, number: '9. ' },
      { pattern: /^References$/gim, number: '10. ' }
    ];
    
    // Process line by line to catch unnumbered sections
    const lines = fullResponse.split('\n');
    const processedLines = lines.map((line, index) => {
      const trimmed = line.trim();
      
      // Check if this line is an unnumbered main section
      for (const { pattern, number } of sectionPatterns) {
        if (pattern.test(trimmed) && !trimmed.match(/^\d+\./)) {
          // Check if previous line is empty or ends with period (likely end of previous section)
          const prevLine = index > 0 ? lines[index - 1].trim() : '';
          if (prevLine === '' || prevLine.endsWith('.') || prevLine.match(/^\d+\./)) {
            return `${number}${trimmed}`;
          }
        }
      }
      return line;
    });
    
    fullResponse = processedLines.join('\n');
    
    // Remove flowchart descriptions (bullet points that describe flowchart components)
    // These appear after flowchart components and should be removed
    const responseLines2 = fullResponse.split('\n');
    const cleanedLines = [];
    let inFlowchartSection = false;
    let flowchartComponentCount = 0;
    
    for (let i = 0; i < responseLines2.length; i++) {
      const line = responseLines2[i];
      const trimmed = line.trim();
      
      // Detect if we're in a flowchart section (contains [Component] or ↓)
      if (trimmed.includes('[') && trimmed.includes(']') || trimmed.includes('↓')) {
        inFlowchartSection = true;
        flowchartComponentCount++;
        cleanedLines.push(line);
        continue;
      }
      
      // If we were in flowchart section and encounter a bullet point description, skip it
      // Check for patterns like "• User Interface:", "• Authentication Module:", etc.
      if (inFlowchartSection && (
        trimmed.match(/^[\*\-\+]\s*[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*:\s*(This|The|It|Each|This component|Acts as|Serves as|Validates|Receives|Processes|Inputs|Outputs|where|through)/i) ||
        trimmed.match(/^[\*\-\+]\s*(User Interface|Authentication Module|Request Handler|Business Logic|Data Access|Database|Response Formatter):/i)
      )) {
        // Skip this line (it's a flowchart description)
        continue;
      }
      
      // Reset flowchart flag if we hit a new heading or after several non-flowchart lines
      if (trimmed.match(/^\d+\.\s+/) || (trimmed.match(/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*$/) && !trimmed.includes('['))) {
        if (inFlowchartSection && flowchartComponentCount > 0) {
          // We've left the flowchart section
          inFlowchartSection = false;
          flowchartComponentCount = 0;
        }
      }
      
      cleanedLines.push(line);
    }
    
    fullResponse = cleanedLines.join('\n');
    
    // Ensure proper line breaks between major sections
    fullResponse = fullResponse.replace(/(\d+\.\s+(?:Introduction|Conclusion|References|Literature Review|Requirements Analysis|System Architecture|Implementation|Testing|Deployment|Evaluation)[^\n]*)\n([^\d\n#])/gim, '$1\n\n$2');
    
    // Ensure Abstract has proper formatting and spacing
    fullResponse = fullResponse.replace(/^Abstract\s*$/gim, 'Abstract\n');
    fullResponse = fullResponse.replace(/Abstract\n([^\n])/gim, 'Abstract\n\n$1');
    
    // Ensure proper spacing after all numbered headings
    fullResponse = fullResponse.replace(/(\d+(?:\.\d+)*\s+[^\n]+)\n([A-Z])/g, '$1\n\n$2');
    
    // Remove multiple consecutive blank lines (max 2)
    fullResponse = fullResponse.replace(/\n{4,}/g, '\n\n');

    // No table of contents needed - return response directly
    const finalResponse = fullResponse;

    return {
      response: finalResponse,
      wordCount: wordCount,
      model: options.model || 'gpt-4-turbo-preview',
      sections: extractSections(fullResponse)
    };

  } catch (error) {
    console.error('Assignment response generation error:', error);
    throw new Error(`Failed to generate assignment response: ${error.message}`);
  }
}

function extractSections(text) {
  const sections = [];
  
  // Extract numbered headings (1., 1.1, 1.1.1, etc.)
  const numberedHeadingRegex = /^(\d+(?:\.\d+)*)\s+(.+)$/gm;
  let match;
  
  while ((match = numberedHeadingRegex.exec(text)) !== null) {
    const number = match[1];
    const title = match[2].trim();
    const level = number.split('.').length;
    
    sections.push({
      level: level,
      number: number,
      title: title
    });
  }
  
  // Also check for markdown headings as fallback
  const headingRegex = /^#{1,3}\s+(.+)$/gm;
  while ((match = headingRegex.exec(text)) !== null) {
    const level = match[0].match(/^#+/)[0].length;
    const title = match[1].trim();
    
    // Only add if not already in sections
    if (!sections.some(s => s.title === title)) {
      sections.push({
        level: level,
        title: title
      });
    }
  }
  
  return sections;
}

function generateTableOfContents(text) {
  const sections = extractSections(text);
  let toc = '';
  
  // Add Abstract first (not numbered but should be in TOC)
  if (text.match(/^Abstract\s*$/gim)) {
    toc += 'Abstract ........................................\n';
  }
  
  // Sort sections by their numbers to ensure proper order
  const sortedSections = sections.sort((a, b) => {
    if (!a.number && !b.number) return 0;
    if (!a.number) return -1;
    if (!b.number) return 1;
    
    const aParts = a.number.split('.').map(Number);
    const bParts = b.number.split('.').map(Number);
    
    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      const aVal = aParts[i] || 0;
      const bVal = bParts[i] || 0;
      if (aVal !== bVal) return aVal - bVal;
    }
    return 0;
  });
  
  // Process sections and ensure proper line breaks - one entry per line
  const seenTitles = new Set();
  
  sortedSections.forEach((section, index) => {
    const level = section.level || 1;
    const indent = '    '.repeat(level - 1); // 4 spaces per level for proper indentation
    const number = section.number || '';
    const title = section.title;
    
    // Skip if it's a duplicate or invalid
    if (!title || title.match(/^Table of Contents$/i)) {
      return;
    }
    
    // Skip Abstract as it's already added
    if (title.match(/^Abstract$/i)) {
      return;
    }
    
    // Create unique key to avoid duplicates
    const uniqueKey = number ? `${number}-${title}` : title;
    if (seenTitles.has(uniqueKey)) {
      return; // Skip duplicates
    }
    seenTitles.add(uniqueKey);
    
    if (number && title) {
      // Format: indent + number + title + dots + page number placeholder
      const titleText = `${number} ${title}`;
      const totalIndent = indent.length;
      const titleLength = titleText.length;
      // Calculate dots needed (aim for ~60 char line, dots fill the gap)
      const dotsNeeded = Math.max(3, 55 - totalIndent - titleLength);
      const dots = '.'.repeat(dotsNeeded);
      
      // Add proper line break after each entry - ensure each is on its own line
      toc += `${indent}${titleText} ${dots}\n`;
    } else if (title && !title.match(/^Abstract$/i)) {
      // For non-numbered sections (shouldn't happen often)
      const totalIndent = indent.length;
      const titleLength = title.length;
      const dotsNeeded = Math.max(3, 55 - totalIndent - titleLength);
      const dots = '.'.repeat(dotsNeeded);
      toc += `${indent}${title} ${dots}\n`;
    }
  });
  
  // Ensure proper line breaks - remove multiple consecutive newlines, ensure single line breaks
  toc = toc.replace(/\n{3,}/g, '\n\n'); // Max 2 consecutive newlines
  toc = toc.replace(/\n\n\n/g, '\n\n'); // Clean up triple newlines
  
  return toc.trim();
}
