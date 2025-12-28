# Data Flow Quick Reference

## 🔗 Connection Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    USER BROWSER                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Chatbot.tsx (Frontend Component)                    │   │
│  │  - Stores messages in React state                     │   │
│  │  - Stores session ID in cookie                        │   │
│  └──────────────────────────────────────────────────────┘   │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ HTTP POST /api/chat
                        │ { message, history }
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              NEXT.JS SERVER (Backend)                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  /api/chat/route.ts                                   │   │
│  │  1. Get/Create Session                                │   │
│  │  2. Save User Message                                 │   │
│  │  3. Update Analytics                                  │   │
│  │  4. Retrieve Knowledge (RAG)                         │   │
│  │  5. Generate AI Response                             │   │
│  │  6. Save AI Response                                 │   │
│  └──────────────────────────────────────────────────────┘   │
└───────┬───────────────────┬───────────────────┬───────────┘
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│   MongoDB    │   │   Groq API   │   │   Ollama     │
│   Atlas      │   │   (AI)       │   │   (Local AI) │
│              │   │              │   │              │
│ Collections: │   │ Optional     │   │ Optional     │
│ - ChatSession│   │              │   │              │
│ - ChatMessage│   │              │   │              │
│ - Knowledge  │   │              │   │              │
│ - Analytics  │   │              │   │              │
└──────────────┘   └──────────────┘   └──────────────┘
```

---

## 📊 Database Collections Breakdown

### 1. ChatSession
**What it stores**: User chat sessions
**When created**: First time user opens chatbot
**Data stored**:
- `sessionId`: Unique identifier (e.g., "session_1234567890_abc123")
- `createdAt`: When session started
- `updatedAt`: Last activity time

**Connection**: 
- Created via: `lib/session.ts` → `getOrCreateSession()`
- Stored in: MongoDB Atlas → `kenmark_chatbot` database → `ChatSession` collection
- Also stored in: Browser cookie (`chat_session_id`)

---

### 2. ChatMessage
**What it stores**: Every message (user questions + AI responses)
**When created**: Every time user sends a message or AI responds
**Data stored**:
- `sessionId`: Links to ChatSession
- `role`: "user" or "assistant"
- `content`: The actual message text
- `createdAt`: Timestamp

**Connection**:
- Created via: `lib/session.ts` → `saveMessage()`
- Stored in: MongoDB Atlas → `ChatMessage` collection
- Linked to: ChatSession via `sessionId` foreign key

**Example**:
```json
{
  "sessionId": "ObjectId('...')",
  "role": "user",
  "content": "What is Private Cloud Storage?",
  "createdAt": "2024-01-01T10:00:00Z"
}
```

---

### 3. KnowledgeBase
**What it stores**: All FAQ, Services, About content from Excel files
**When created**: When admin uploads Excel file
**Data stored**:
- `category`: "About", "Services", "FAQ", "Hosting", etc.
- `question`: Optional question/keyword
- `answer`: The answer content
- `metadata`: JSON with source info

**Connection**:
- Created via: `lib/excel-parser.ts` → `parseExcelFile()`
- Stored in: MongoDB Atlas → `KnowledgeBase` collection
- Retrieved via: `lib/rag-service.ts` → `retrieveRelevantKnowledge()`

**Example**:
```json
{
  "category": "Hosting",
  "question": "What is Private Cloud Storage?",
  "answer": "Private Cloud Storage is a secure, dedicated cloud storage solution...",
  "metadata": "{\"source\":\"excel\",\"uploadedAt\":\"2024-01-01T00:00:00Z\"}"
}
```

---

### 4. Analytics
**What it stores**: Most frequently asked questions
**When created**: Every time user asks a question
**Data stored**:
- `question`: The exact question text
- `count`: How many times asked
- `createdAt`: First time asked
- `updatedAt`: Last time asked

**Connection**:
- Created/Updated via: `lib/rag-service.ts` → `updateAnalytics()`
- Stored in: MongoDB Atlas → `Analytics` collection
- Retrieved via: `lib/rag-service.ts` → `getTopQuestions()`

**Example**:
```json
{
  "question": "What is Private Cloud Storage?",
  "count": 42,
  "createdAt": "2024-01-01T10:00:00Z",
  "updatedAt": "2024-01-15T14:30:00Z"
}
```

---

## 🔄 Step-by-Step Data Flow (Example)

### User asks: "What is Private Cloud Storage?"

**Step 1: Frontend (Chatbot.tsx)**
- User types message
- `handleSend()` function called
- Message added to React state
- HTTP POST to `/api/chat`

**Step 2: Backend API (/api/chat/route.ts)**
- Receives: `{ message: "What is Private Cloud Storage?", history: [] }`

**Step 3: Session Management**
- Calls: `getOrCreateSession()`
- Reads: Browser cookie `chat_session_id`
- If exists: Queries MongoDB `ChatSession` collection
- If not: Creates new session in MongoDB + sets cookie
- Returns: `sessionId`

**Step 4: Save User Message**
- Calls: `saveMessage(sessionId, 'user', message)`
- Writes to: MongoDB `ChatMessage` collection
- Data: `{ sessionId, role: 'user', content: 'What is Private Cloud Storage?' }`

**Step 5: Update Analytics**
- Calls: `updateAnalytics(message)`
- Upserts: MongoDB `Analytics` collection
- If exists: Increments `count` by 1
- If new: Creates entry with `count: 1`

**Step 6: Retrieve Knowledge (RAG)**
- Calls: `retrieveRelevantKnowledge(message)`
- Reads: All entries from MongoDB `KnowledgeBase` collection
- Processes: Keyword matching ("private", "cloud", "storage")
- Scores: Each entry by keyword matches
- Returns: Top match answer text only

**Step 7: Generate AI Response**
- Calls: `generateAIResponse(message, context, history)`
- Sends to: Groq API (or Ollama if configured)
- Input: User message + retrieved knowledge context
- Returns: AI-generated response

**Step 8: Save AI Response**
- Calls: `saveMessage(sessionId, 'assistant', response)`
- Writes to: MongoDB `ChatMessage` collection
- Data: `{ sessionId, role: 'assistant', content: 'Private Cloud Storage is...' }`

**Step 9: Return to Frontend**
- API returns: `{ response: "Private Cloud Storage is..." }`
- Frontend receives response
- Displays message in chat UI

---

## 🔌 External Connections

### MongoDB Atlas
- **Type**: Cloud Database
- **Connection**: `mongodb+srv://user:pass@cluster.mongodb.net/kenmark_chatbot`
- **Used for**: All persistent data storage
- **Collections**: 4 (ChatSession, ChatMessage, KnowledgeBase, Analytics)

### Groq API (Optional)
- **Type**: AI/LLM Service
- **Connection**: `https://api.groq.com/openai/v1/chat/completions`
- **Used for**: Generating AI responses
- **Config**: `GROQ_API_KEY` in `.env`

### Ollama (Optional)
- **Type**: Local LLM
- **Connection**: `http://localhost:11434`
- **Used for**: Local AI response generation
- **Config**: `USE_OLLAMA=true` in `.env`

---

## 📝 Data at Each Layer

### Browser Layer
- **Cookies**: `chat_session_id` (session identifier)
- **React State**: Current messages array, UI state
- **No persistent storage**: Everything cleared on page refresh (except cookie)

### Server Layer (Next.js)
- **Temporary**: Request/response data
- **No persistent storage**: Stateless API routes

### Database Layer (MongoDB Atlas)
- **Persistent**: All chat history, knowledge base, analytics
- **Survives**: Server restarts, deployments
- **Backed up**: Automatically by MongoDB Atlas

---

## 🔍 Data Query Examples

### Get all messages for a session
```typescript
prisma.chatSession.findUnique({
  where: { sessionId: "session_123" },
  include: { messages: true }
})
```

### Search knowledge base
```typescript
prisma.knowledgeBase.findMany({
  where: { category: "Hosting" }
})
```

### Get top questions
```typescript
prisma.analytics.findMany({
  orderBy: { count: 'desc' },
  take: 10
})
```

---

## 📈 Data Volume Estimates

### Per User Session
- **ChatSession**: 1 document
- **ChatMessage**: ~10-50 documents (5-25 user messages + 5-25 AI responses)
- **Analytics**: ~5-25 documents (one per unique question)

### Knowledge Base
- **KnowledgeBase**: 10-100+ documents (depends on Excel uploads)

### Total Storage
- **Small deployment**: < 1 MB
- **Medium deployment**: 1-10 MB
- **Large deployment**: 10-100 MB

---

## 🔐 Data Security

### What's Secure
- ✅ Session IDs in HTTP-only cookies (XSS protection)
- ✅ Database connection encrypted (MongoDB Atlas SSL)
- ✅ API keys in environment variables (not in code)

### What's Not Encrypted
- ⚠️ Message content stored in plain text
- ⚠️ No end-to-end encryption
- ⚠️ Admin uploads not authenticated (add auth if needed)

---

This quick reference shows exactly where data flows and how connections work at each step!

