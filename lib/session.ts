import { prisma } from './prisma';
import { cookies } from 'next/headers';

export async function getOrCreateSession(): Promise<string> {
  const cookieStore = await cookies();
  let sessionId = cookieStore.get('chat_session_id')?.value || null;

  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    await prisma.chatSession.create({
      data: {
        sessionId,
      },
    });

    cookieStore.set('chat_session_id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
  } else {
    // Verify session exists
    const session = await prisma.chatSession.findUnique({
      where: { sessionId },
    });

    if (!session) {
      // Create new session if old one doesn't exist
      await prisma.chatSession.create({
        data: {
          sessionId,
        },
      });
    }
  }

  return sessionId;
}

export async function getSessionMessages(sessionId: string) {
  const session = await prisma.chatSession.findUnique({
    where: { sessionId },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  return session?.messages || [];
}

export async function saveMessage(sessionId: string, role: 'user' | 'assistant', content: string) {
  const session = await prisma.chatSession.findUnique({
    where: { sessionId },
  });

  if (!session) {
    await prisma.chatSession.create({
      data: {
        sessionId,
        messages: {
          create: {
            role,
            content,
          },
        },
      },
    });
  } else {
    await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        role,
        content,
      },
    });
  }
}

