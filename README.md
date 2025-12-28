# Kenmark ITan Solutions - AI Chatbot

A full-stack AI-powered chatbot system for Kenmark ITan Solutions website, built with Next.js 16, MongoDB, and local LLM support (Ollama) with fallback to free AI APIs.

## 🌟 Features

- **AI-Powered Chat Interface**: Floating chatbot widget with modern UI
- **RAG (Retrieval-Augmented Generation)**: Intelligent knowledge retrieval from Excel files and website content
- **Excel Knowledge Base**: Upload and manage FAQs, Services, and About information via Excel files
- **Session Management**: Persistent chat history during sessions
- **Analytics Dashboard**: Track most frequently asked questions
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Admin Panel**: Upload knowledge base files and view analytics

## 🛠️ Tech Stack

- **Framework**: Next.js 16.x (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.x
- **Database**: MongoDB
- **ORM**: Prisma
- **AI/LLM**: 
  - Primary: Ollama (Local LLM - LLaMA/Mistral/Phi models)
  - Fallback: Groq API (Free tier available)
- **Excel Parsing**: xlsx library
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- MongoDB database (local or MongoDB Atlas)
- (Optional) Ollama installed locally for local LLM support

**Note**: Next.js 16.x is specified in requirements. If you encounter compatibility issues, Next.js 15.x should work as well. The code is compatible with Next.js 15+.

## 🚀 Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd kenmark-itan-chatbot
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="mongodb://localhost:27017/kenmark_chatbot"
# or for MongoDB Atlas:
# DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/kenmark_chatbot"

# Ollama Configuration (Optional - for local LLM)
USE_OLLAMA=true
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2

# Groq API (Optional - fallback if Ollama not available)
GROQ_API_KEY=your_groq_api_key_here

# Next.js
NODE_ENV=development
```

### 4. Set Up MongoDB

#### Option A: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/kenmark_chatbot`

#### Option B: MongoDB Atlas (Cloud)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get your connection string
4. Update `DATABASE_URL` in `.env`

### 5. Set Up Prisma

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate
```

### 6. (Optional) Set Up Ollama for Local LLM

If you want to use local LLM:

1. Install Ollama from [ollama.ai](https://ollama.ai)
2. Pull a model:
   ```bash
   ollama pull llama3.2
   # or
   ollama pull mistral
   # or
   ollama pull phi
   ```
3. Start Ollama service (usually runs automatically)
4. Set `USE_OLLAMA=true` in `.env`

### 7. (Optional) Set Up Groq API (Free Alternative)

If you prefer using Groq API instead of local LLM:

1. Sign up at [console.groq.com](https://console.groq.com)
2. Get your API key
3. Add `GROQ_API_KEY` to `.env`
4. Set `USE_OLLAMA=false` or leave it unset

### 8. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
kenmark-itan-chatbot/
├── app/
│   ├── api/
│   │   ├── chat/              # Chat API endpoint
│   │   └── admin/             # Admin API endpoints
│   ├── admin/                 # Admin dashboard page
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Home page
│   └── globals.css            # Global styles
├── components/
│   ├── Chatbot.tsx            # Main chatbot component
│   └── ChatbotProvider.tsx    # Chatbot context provider
├── lib/
│   ├── ai-service.ts          # AI/LLM integration
│   ├── excel-parser.ts        # Excel file parsing
│   ├── prisma.ts              # Prisma client
│   ├── rag-service.ts         # RAG knowledge retrieval
│   ├── session.ts             # Session management
│   └── utils.ts               # Utility functions
├── prisma/
│   └── schema.prisma          # Database schema
├── public/
│   └── knowledge-base.xlsx    # Sample Excel file
├── .env.example               # Environment variables template
├── package.json
├── tsconfig.json
└── README.md
```

## 📊 Excel Knowledge Base Format

The chatbot accepts Excel files (`.xlsx`) with the following structure:

| Category | Question                    | Answer                                    |
|----------|-----------------------------|-------------------------------------------|
| About    | What is Kenmark ITan?       | Kenmark ITan Solutions is a technology... |
| Services | What services do you offer? | We offer AI solutions, consulting...     |
| FAQ      | How can I contact you?      | Visit kenmarkitan.com or use the contact form |

**Required Columns:**
- `Category`: Type of information (About, Services, FAQ, Contact, etc.)
- `Answer`: The answer/content (required)

**Optional Columns:**
- `Question`: The question/keyword (optional, helps with matching)

## 🎯 Usage

### For Users

1. Visit the website
2. Click the floating chatbot button (bottom right)
3. Start asking questions about Kenmark ITan Solutions
4. The chatbot will respond using the knowledge base

### For Admins

1. Navigate to `/admin`
2. Upload an Excel file with knowledge base content
3. View analytics to see most asked questions
4. The chatbot will automatically use the new knowledge

## 🔧 API Endpoints

### POST `/api/chat`
Send a chat message and get AI response.

**Request:**
```json
{
  "message": "What services do you offer?",
  "history": []
}
```

**Response:**
```json
{
  "response": "We offer AI solutions, consulting services, and training programs..."
}
```

### POST `/api/admin/upload`
Upload Excel knowledge base file.

**Request:** FormData with `file` field

**Response:**
```json
{
  "success": true,
  "message": "Successfully uploaded 15 knowledge entries",
  "count": 15
}
```

### GET `/api/admin/analytics`
Get top asked questions.

**Response:**
```json
{
  "questions": [
    {
      "question": "What services do you offer?",
      "count": 42
    }
  ]
}
```

## 🚢 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Deploy to Netlify

1. Build the project: `npm run build`
2. Set build command: `npm run build`
3. Set publish directory: `.next`
4. Add environment variables
5. Deploy!

### Environment Variables for Production

Make sure to set all required environment variables in your hosting platform:
- `DATABASE_URL`
- `USE_OLLAMA` (if using Ollama)
- `OLLAMA_BASE_URL` (if using Ollama)
- `GROQ_API_KEY` (if using Groq API)
- `NODE_ENV=production`

## 🧪 Testing

1. Test chatbot with various questions
2. Upload sample Excel file via admin panel
3. Verify responses are accurate
4. Check analytics dashboard

## 📝 Notes

- The system uses a simple keyword-based RAG approach. For production, consider implementing vector embeddings (e.g., with OpenAI embeddings or sentence-transformers)
- Ollama must be running locally for local LLM to work
- Groq API has rate limits on free tier
- Chat sessions persist for 7 days (configurable in `lib/session.ts`)

## 🤝 Contributing

This is a project assignment. For improvements:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is created for educational purposes.

## 👨‍💻 Author

Built for Kenmark ITan Solutions chatbot assignment.

## 🔗 Links

- Website: https://kenmarkitan.com
- GitHub Repository: [Your Repo URL]
- Live Demo: [Your Deployed URL]

---

**Note**: Make sure to update the GitHub repository URL and live demo URL before submission.

