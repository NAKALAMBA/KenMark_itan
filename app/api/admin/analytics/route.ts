import { NextResponse } from 'next/server';
import { getTopQuestions } from '@/lib/rag-service';

export async function GET() {
  try {
    const topQuestions = await getTopQuestions(10);
    return NextResponse.json({ questions: topQuestions });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

