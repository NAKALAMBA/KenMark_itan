import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateSession, saveMessage } from '@/lib/session';
import { retrieveRelevantKnowledge, updateAnalytics } from '@/lib/rag-service';
import { generateAIResponse } from '@/lib/ai-service';
import { AIMessage } from '@/lib/ai-service';

export async function POST(request: NextRequest) {
  try {
    const { message, history = [] } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required', response: 'Please provide a valid message.' },
        { status: 400 }
      );
    }

    // Get or create session
    let sessionId: string;
    try {
      sessionId = await getOrCreateSession();
    } catch (error) {
      console.error('Session error:', error);
      // Continue without session if it fails
      sessionId = `temp_${Date.now()}`;
    }

    // Save user message (non-blocking)
    try {
      await saveMessage(sessionId, 'user', message);
    } catch (error) {
      console.error('Error saving user message:', error);
      // Continue even if save fails
    }

    // Update analytics (non-blocking)
    try {
      await updateAnalytics(message);
    } catch (error) {
      console.error('Analytics error:', error);
      // Continue even if analytics fails
    }

    // Retrieve relevant knowledge (RAG)
    let context = '';
    try {
      context = await retrieveRelevantKnowledge(message);
    } catch (error) {
      console.error('RAG retrieval error:', error);
      // Continue with empty context
    }

    // Convert history to AIMessage format
    const conversationHistory: AIMessage[] = history.map((msg: { role: string; content: string }) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));

    // Generate AI response
    let response: string;
    try {
      response = await generateAIResponse(message, context, conversationHistory);
    } catch (error) {
      console.error('AI generation error:', error);
      response = "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.";
    }

    // Save assistant message (non-blocking)
    try {
      await saveMessage(sessionId, 'assistant', response);
    } catch (error) {
      console.error('Error saving assistant message:', error);
      // Continue even if save fails
    }

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Chat API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        response: "I apologize, but I encountered an error. Please try again later. If the problem persists, please contact support." 
      },
      { status: 500 }
    );
  }
}

