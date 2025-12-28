import * as XLSX from 'xlsx';
import { prisma } from './prisma';

export interface ExcelRow {
  Category: string;
  Question?: string;
  Answer: string;
}

export async function parseExcelFile(file: File): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet);

    let count = 0;
    const entries = [];

    // First, collect all entries
    for (const row of data) {
      if (!row.Category || !row.Answer) continue;

      const category = row.Category.trim();
      const question = row.Question?.trim() || null;
      const answer = row.Answer.trim();

      if (!answer) continue;

      entries.push({
        category,
        question,
        answer,
        metadata: JSON.stringify({ source: 'excel', uploadedAt: new Date().toISOString() }),
      });
    }

    // Then, insert all entries one by one (MongoDB free tier doesn't support transactions)
    for (const entry of entries) {
      try {
        // Use createMany is not available for MongoDB, so we use individual creates
        await prisma.knowledgeBase.create({
          data: entry,
        });
        count++;
      } catch (error) {
        console.error('Error creating knowledge entry:', error);
        // If it's a duplicate, skip it
        if (error instanceof Error && error.message.includes('duplicate')) {
          continue;
        }
        // Continue with other entries even if one fails
      }
    }

    if (count === 0 && entries.length > 0) {
      return {
        success: false,
        count: 0,
        error: 'Failed to save entries to database. Please check MongoDB connection.',
      };
    }

    return { success: true, count };
  } catch (error) {
    console.error('Error parsing Excel file:', error);
    
    // Provide more helpful error messages
    let errorMessage = 'Unknown error occurred';
    if (error instanceof Error) {
      if (error.message.includes('timeout') || error.message.includes('Server selection')) {
        errorMessage = 'Database connection timeout. Please check MongoDB Atlas network access settings.';
      } else if (error.message.includes('Authentication')) {
        errorMessage = 'Database authentication failed. Please check your connection string.';
      } else {
        errorMessage = error.message;
      }
    }
    
    return {
      success: false,
      count: 0,
      error: errorMessage,
    };
  }
}

export async function getKnowledgeByCategory(category?: string) {
  if (category) {
    return await prisma.knowledgeBase.findMany({
      where: { category },
    });
  }
  return await prisma.knowledgeBase.findMany();
}

