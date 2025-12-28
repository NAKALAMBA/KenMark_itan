import axios from 'axios';

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Configuration for AI service
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const USE_OLLAMA = process.env.USE_OLLAMA === 'true' || process.env.USE_OLLAMA === '1';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';

// Fallback to free APIs
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.1-8b-instant';

const SYSTEM_PROMPT = `You are an AI assistant for Kenmark ITan Solutions, a technology company.
Your role is to help users with questions about the company, its services, and general inquiries.

Guidelines:
- Answer questions using ONLY the information provided in the context
- Provide a SINGLE, clear, and concise answer - do not repeat the question or use Q/A format
- Do NOT include "Q:" or "A:" labels in your response
- Do NOT repeat the question in your answer
- If the context doesn't contain relevant information, politely say: "I don't have that information yet. Please contact us at kenmarkitan.com for more details."
- Be polite, concise, and professional
- Do not make up information or hallucinate
- If asked about something outside your knowledge, redirect to the website
- Return ONLY the answer text, nothing else

Context from knowledge base:
{context}`;

/**
 * Clean AI response by removing Q/A formatting and duplicates
 */
function cleanAIResponse(response: string): string {
  if (!response) return response;

  // Remove category prefixes like "Hosting: " at the start
  let cleaned = response.replace(/^[^:]+:\s*/g, '');
  
  // Remove Q: lines
  cleaned = cleaned.replace(/^Q:\s*[^\n]+\n?/gim, '');
  
  // Remove A: prefixes
  cleaned = cleaned.replace(/^A:\s*/gim, '');
  
  // Remove duplicate sentences (simple check)
  const sentences = cleaned.split(/[.!?]+/).filter(s => s.trim().length > 10);
  const uniqueSentences: string[] = [];
  const seen = new Set<string>();
  
  for (const sentence of sentences) {
    const normalized = sentence.trim().toLowerCase();
    if (!seen.has(normalized) && normalized.length > 10) {
      seen.add(normalized);
      uniqueSentences.push(sentence.trim());
    }
  }
  
  cleaned = uniqueSentences.join('. ').trim();
  if (cleaned && !cleaned.endsWith('.') && !cleaned.endsWith('!') && !cleaned.endsWith('?')) {
    cleaned += '.';
  }
  
  return cleaned || response; // Return original if cleaning removed everything
}

export async function generateAIResponse(
  userQuery: string,
  context: string,
  conversationHistory: AIMessage[] = []
): Promise<string> {
  const fullContext = context || 'No specific context available.';
  const systemPrompt = SYSTEM_PROMPT.replace('{context}', fullContext);

  const messages: AIMessage[] = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory.slice(-6), // Keep last 6 messages for context
    { role: 'user', content: userQuery },
  ];

  try {
    let response: string;
    if (USE_OLLAMA) {
      response = await callOllama(messages);
    } else if (GROQ_API_KEY) {
      response = await callGroq(messages);
    } else {
      // Fallback: simple rule-based response
      response = generateFallbackResponse(userQuery, fullContext);
    }
    
    // Clean the response before returning
    return cleanAIResponse(response);
  } catch (error) {
    console.error('AI service error:', error);
    const fallback = generateFallbackResponse(userQuery, fullContext);
    return cleanAIResponse(fallback);
  }
}

async function callOllama(messages: AIMessage[]): Promise<string> {
  try {
    const response = await axios.post(
      `${OLLAMA_BASE_URL}/api/chat`,
      {
        model: OLLAMA_MODEL,
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        stream: false,
      },
      { timeout: 30000 }
    );

    return response.data.message?.content || 'I apologize, but I encountered an error processing your request.';
  } catch (error) {
    console.error('Ollama error:', error);
    throw error;
  }
}

async function callGroq(messages: AIMessage[]): Promise<string> {
  try {
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: GROQ_MODEL,
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        temperature: 0.7,
        max_tokens: 500,
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    return response.data.choices[0]?.message?.content || 'I apologize, but I encountered an error processing your request.';
  } catch (error) {
    console.error('Groq API error:', error);
    throw error;
  }
}

function generateFallbackResponse(userQuery: string, context: string): string {
  const lowerQuery = userQuery.toLowerCase();

  // If we have context, return it cleanly (remove any Q/A formatting)
  if (context && context.length > 0) {
    // Remove any "Q:" or "A:" labels and category prefixes
    let cleanContext = context
      .replace(/^[^:]+:\s*/g, '') // Remove category prefix like "Hosting: "
      .replace(/^Q:\s*[^\n]+\n?/gim, '') // Remove Q: lines
      .replace(/^A:\s*/gim, '') // Remove A: prefix
      .trim();
    
    // If context is still meaningful, return it (limit length)
    if (cleanContext.length > 10) {
      return cleanContext.length > 500 ? cleanContext.substring(0, 500) + '...' : cleanContext;
    }
  }

  // Simple keyword matching as fallback
  if (lowerQuery.includes('service') || lowerQuery.includes('what do you offer')) {
    return 'We offer AI solutions, consulting services, and training programs. For more details, please visit kenmarkitan.com';
  }

  if (lowerQuery.includes('contact') || lowerQuery.includes('how to reach')) {
    return 'You can contact us by visiting our website at kenmarkitan.com. We would be happy to assist you!';
  }

  if (lowerQuery.includes('about') || lowerQuery.includes('who are you')) {
    return 'Kenmark ITan Solutions is a technology company focused on delivering innovative AI solutions and consulting services.';
  }

  return "I don't have that information yet. Please contact us at kenmarkitan.com for more details.";
}

