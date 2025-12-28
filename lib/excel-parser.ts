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

    for (const row of data) {
      if (!row.Category || !row.Answer) continue;

      const category = row.Category.trim();
      const question = row.Question?.trim() || null;
      const answer = row.Answer.trim();

      if (!answer) continue;

      // Store in knowledge base
      await prisma.knowledgeBase.create({
        data: {
          category,
          question,
          answer,
          metadata: JSON.stringify({ source: 'excel', uploadedAt: new Date().toISOString() }),
        },
      });

      count++;
    }

    return { success: true, count };
  } catch (error) {
    console.error('Error parsing Excel file:', error);
    return {
      success: false,
      count: 0,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
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

