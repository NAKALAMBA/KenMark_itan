import { prisma } from './prisma';

export interface RetrievalResult {
  content: string;
  category: string;
  relevance: number;
}

/**
 * Simple RAG: Retrieve relevant knowledge based on query keywords
 * In production, you'd use vector embeddings and similarity search
 */
export async function retrieveRelevantKnowledge(query: string): Promise<string> {
  const lowerQuery = query.toLowerCase();
  const keywords = lowerQuery
    .split(/\s+/)
    .filter((word) => word.length > 2)
    .slice(0, 5); // Top 5 keywords

  // Search in knowledge base
  const allKnowledge = await prisma.knowledgeBase.findMany();

  // Simple keyword matching (in production, use vector similarity)
  const relevantEntries = allKnowledge
    .map((entry) => {
      const entryText = `${entry.question || ''} ${entry.answer} ${entry.category}`.toLowerCase();
      const matchCount = keywords.filter((keyword) => entryText.includes(keyword)).length;
      return {
        entry,
        score: matchCount,
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3); // Top 3 most relevant

  if (relevantEntries.length === 0) {
    // Fallback: return general information
    const generalInfo = allKnowledge.filter((k) => k.category === 'About' || k.category === 'Services');
    if (generalInfo.length > 0) {
      // Return only the first relevant answer, clean format
      return generalInfo[0].answer;
    }
    // If no knowledge base exists, return helpful message
    return 'No knowledge base content available. Please upload an Excel file with FAQs, Services, and About information via the admin panel.';
  }

  // Return only the most relevant answer (top result), clean format without Q/A labels
  return relevantEntries[0].entry.answer;
}

export async function updateAnalytics(question: string) {
  try {
    await prisma.analytics.upsert({
      where: { question },
      update: { count: { increment: 1 }, updatedAt: new Date() },
      create: { question, count: 1 },
    });
  } catch (error) {
    console.error('Analytics update error:', error);
  }
}

export async function getTopQuestions(limit: number = 10) {
  return await prisma.analytics.findMany({
    orderBy: { count: 'desc' },
    take: limit,
  });
}

