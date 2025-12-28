/**
 * Script to seed the database with initial knowledge base data
 * Run with: node scripts/seed-database.js
 * Make sure DATABASE_URL is set in .env
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

const sampleData = [
  {
    category: 'About',
    question: 'What is Kenmark ITan Solutions?',
    answer: 'Kenmark ITan Solutions is a leading technology company focused on delivering cutting-edge AI solutions, consulting services, and comprehensive training programs. We help businesses transform their operations through innovative technology.',
  },
  {
    category: 'About',
    question: 'What is your mission?',
    answer: 'Our mission is to empower organizations with intelligent solutions that drive growth and efficiency. We strive to be a trusted technology partner for businesses seeking digital transformation.',
  },
  {
    category: 'Services',
    question: 'What services do you offer?',
    answer: 'We offer three main services: 1) AI Solutions - Custom AI implementations tailored to your business needs, 2) Consulting - Expert technology consulting to guide your digital transformation, and 3) Training - Comprehensive training programs to upskill your team.',
  },
  {
    category: 'Services',
    question: 'Do you provide AI consulting?',
    answer: 'Yes, we provide expert AI consulting services. Our team helps businesses identify opportunities for AI implementation, develop strategies, and execute AI projects that deliver real business value.',
  },
  {
    category: 'Services',
    question: 'What kind of training programs do you offer?',
    answer: 'We offer comprehensive training programs covering AI fundamentals, machine learning, data science, cloud technologies, and software development. Our training is designed to upskill teams and prepare them for the future of technology.',
  },
  {
    category: 'FAQ',
    question: 'How can I contact Kenmark ITan Solutions?',
    answer: 'You can contact us by visiting our website at kenmarkitan.com. We have a contact form and contact information available on our website. We would be happy to assist you with your inquiries.',
  },
  {
    category: 'FAQ',
    question: 'Where is your company located?',
    answer: 'For location and office details, please visit our website at kenmarkitan.com or contact us through the contact form. We serve clients globally and have a strong online presence.',
  },
  {
    category: 'FAQ',
    question: 'Do you work with small businesses?',
    answer: 'Yes, we work with businesses of all sizes, from startups to large enterprises. Our solutions are scalable and can be tailored to meet the specific needs and budget of small businesses.',
  },
  {
    category: 'FAQ',
    question: 'What industries do you serve?',
    answer: 'We serve a wide range of industries including healthcare, finance, retail, manufacturing, education, and technology. Our AI solutions and consulting services are adaptable to various industry requirements.',
  },
  {
    category: 'Contact',
    question: 'How do I get a quote?',
    answer: 'To get a quote for our services, please visit kenmarkitan.com and fill out our contact form. Our team will get back to you with a customized proposal based on your requirements.',
  },
  {
    category: 'Contact',
    question: 'Do you offer free consultations?',
    answer: 'Yes, we offer initial consultations to understand your needs and discuss how our services can help your business. Please contact us through our website to schedule a consultation.',
  },
];

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data (optional - comment out if you want to keep existing data)
  // await prisma.knowledgeBase.deleteMany({});

  // Insert sample data
  for (const data of sampleData) {
    try {
      await prisma.knowledgeBase.create({
        data: {
          category: data.category,
          question: data.question,
          answer: data.answer,
          metadata: JSON.stringify({ source: 'seed', createdAt: new Date().toISOString() }),
        },
      });
      console.log(`✅ Added: ${data.category} - ${data.question || 'N/A'}`);
    } catch (error) {
      console.error(`❌ Error adding ${data.category}:`, error.message);
    }
  }

  const count = await prisma.knowledgeBase.count();
  console.log(`\n✨ Seeding complete! Total knowledge entries: ${count}`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

