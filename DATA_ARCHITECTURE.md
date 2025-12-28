# Data Architecture & Flow Breakdown

Complete breakdown of all data connections, storage, and flow in the Kenmark ITan Solutions Chatbot.

## 📊 Database Schema (MongoDB Atlas)

### Connection Details
- **Database Name**: `kenmark_chatbot`
- **Connection String**: `mongodb+srv://nakalamba11_db_user:yK0F19ijY9GoteH1@cluster0.lz6qcij.mongodb.net/kenmark_chatbot`
- **Provider**: MongoDB Atlas (Cloud)
- **ORM**: Prisma Client

### Collections (Tables)

#### 1. ChatSession Collection
**Purpose**: Stores user chat sessions

```javascript
{
  _id: ObjectId,                    // Auto-generated MongoDB ID
  sessionId: String (unique),       // Custom session identifier
  createdAt: DateTime,              // Session creation timestamp
  updatedAt: DateTime,             // Last update timestamp
  messages: [ChatMessage]           // Related messages (relation)
}
```

**Indexes**:
- `sessionId` (unique index)

**Data Flow**:
- Created when user first opens chatbot
- Session ID stored in HTTP-only cookie
- Links to all messages in that session

---

#### 2. ChatMessage Collection
**Purpose**: Stores individual chat messages (user and assistant)

```javascript
{
  _id: ObjectId,                    // Auto-generated MongoDB ID
  sessionId: String,                // Reference to ChatSession._id
  role: String,                     // "user" or "assistant"
  content: String,                   // Message text
  createdAt: DateTime,              // Message timestamp
  session: ChatSession              // Relation to parent session
}
```

**Indexes**:
- `sessionId` (index for fast lookups)

**Data Flow**:
- Created for every user message
- Created for every AI response
- Linked to parent session via `sessionId`

---

#### 3. KnowledgeBase Collection
**Purpose**: Stores FAQ, Services, About, and other knowledge content

```javascript
{
  _id: ObjectId,                    // Auto-generated MongoDB ID
  category: String,                 // "About", "Services", "FAQ", "Contact", "Hosting", etc.
  question: String (optional),      // Question/keyword (can be null)
  answer: String,                   // Answer content (required)
  metadata: String,                 // JSON string with additional data
  createdAt: DateTime,              // Entry creation timestamp
  updatedAt: DateTime               // Last update timestamp
}
```

**Indexes**:
- `category` (index for filtering by category)

**Data Flow**:
- Populated via Excel upload (admin panel)
- Can be seeded via `npm run seed`
- Retrieved during RAG (Retrieval-Augmented Generation)
- Used to generate AI responses

**Example Entry**:
```json
{
  "category": "Hosting",
  "question": "What is Private Cloud Storage?",
  "answer": "Private Cloud Storage is a secure, dedicated cloud storage solution...",
  "metadata": "{\"source\":\"excel\",\"uploadedAt\":\"2024-01-01T00:00:00Z\"}"
}
```

---

#### 4. Analytics Collection
**Purpose**: Tracks most frequently asked questions

```javascript
{
  _id: ObjectId,                    // Auto-generated MongoDB ID
  question: String (unique),        // User question text
  count: Number,                     // Number of times asked
  createdAt: DateTime,              // First occurrence timestamp
  updatedAt: DateTime               // Last occurrence timestamp
}
```

**Indexes**:
- `question` (unique index)
- `count` (index for sorting by popularity)

**Data Flow**:
- Created/updated on every user message
- Used for analytics dashboard
- Shows top 10 most asked questions

---

## 🔄 Complete Data Flow

### 1. User Sends Message Flow

```
┌─────────────────┐
│  User Types     │
│  Message in UI  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Chatbot.tsx    │
│  handleSend()   │
└────────┬────────┘
         │
         │ POST /api/chat
         │ { message, history }
         ▼
┌─────────────────┐
│  /api/chat      │
│  route.ts       │
└────────┬────────┘
         │
         ├─► getOrCreateSession()
         │   └─► MongoDB: ChatSession
         │       └─► Cookie: session_id
         │
         ├─► saveMessage(sessionId, 'user', message)
         │   └─► MongoDB: ChatMessage
         │
         ├─► updateAnalytics(message)
         │   └─► MongoDB: Analytics (upsert)
         │
         ├─► retrieveRelevantKnowledge(message)
         │   └─► MongoDB: KnowledgeBase
         │       └─► Keyword matching
         │       └─► Returns: answer text
         │
         ├─► generateAIResponse(message, context, history)
         │   ├─► Groq API / Ollama
         │   └─► Returns: AI response
         │
         └─► saveMessage(sessionId, 'assistant', response)
             └─► MongoDB: ChatMessage
                 │
                 ▼
┌─────────────────┐
│  Response JSON  │
│  { response }   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Chatbot.tsx    │
│  Display Message│
└─────────────────┘
```

### 2. Session Management Flow

```
User Opens Chatbot
        │
        ▼
┌─────────────────┐
│  getOrCreateSession() │
└────────┬────────┘
         │
         ├─► Check Cookie: chat_session_id
         │
         ├─► If exists:
         │   └─► Verify in MongoDB: ChatSession
         │       └─► Return existing sessionId
         │
         └─► If not exists:
             │
             ├─► Generate: session_${timestamp}_${random}
             │
             ├─► Create in MongoDB: ChatSession
             │
             └─► Set Cookie: chat_session_id
                 └─► httpOnly: true
                 └─► maxAge: 7 days
```

### 3. Knowledge Retrieval (RAG) Flow

```
User Query: "What is Private Cloud Storage?"
        │
        ▼
┌─────────────────┐
│  retrieveRelevantKnowledge() │
└────────┬────────┘
         │
         ├─► Extract keywords: ["private", "cloud", "storage"]
         │
         ├─► Query MongoDB: KnowledgeBase.findMany()
         │
         ├─► Score each entry:
         │   └─► Count keyword matches
         │
         ├─► Sort by score (highest first)
         │
         ├─► Select top 1 result
         │
         └─► Return: answer text only
             └─► "Private Cloud Storage is a secure..."
```

### 4. Excel Upload Flow

```
Admin Uploads Excel File
        │
        ▼
┌─────────────────┐
│  /admin/page.tsx│
│  handleUpload() │
└────────┬────────┘
         │
         │ POST /api/admin/upload
         │ FormData: { file }
         ▼
┌─────────────────┐
│  /api/admin/    │
│  upload/route.ts│
└────────┬────────┘
         │
         ├─► parseExcelFile(file)
         │   └─► Read Excel using xlsx library
         │   └─► Parse rows: { Category, Question, Answer }
         │
         └─► For each row:
             └─► Create in MongoDB: KnowledgeBase
                 {
                   category: row.Category,
                   question: row.Question,
                   answer: row.Answer,
                   metadata: JSON.stringify({...})
                 }
```

### 5. Analytics Flow

```
User Message Received
        │
        ▼
┌─────────────────┐
│  updateAnalytics() │
└────────┬────────┘
         │
         ├─► MongoDB: Analytics.upsert()
         │   {
         │     where: { question: message },
         │     update: { count: increment(1) },
         │     create: { question: message, count: 1 }
         │   }
         │
         └─► Result: Question tracked with count
```

---

## 🔌 API Endpoints & Data

### POST /api/chat

**Request**:
```json
{
  "message": "What is Private Cloud Storage?",
  "history": [
    { "role": "user", "content": "Hello" },
    { "role": "assistant", "content": "Hi! How can I help?" }
  ]
}
```

**Data Operations**:
1. **Read**: Cookie → Get sessionId
2. **Read/Write**: MongoDB ChatSession → Verify/Create session
3. **Write**: MongoDB ChatMessage → Save user message
4. **Write**: MongoDB Analytics → Update question count
5. **Read**: MongoDB KnowledgeBase → Retrieve relevant knowledge
6. **External**: Groq API / Ollama → Generate AI response
7. **Write**: MongoDB ChatMessage → Save assistant response

**Response**:
```json
{
  "response": "Private Cloud Storage is a secure, dedicated cloud storage solution..."
}
```

---

### POST /api/admin/upload

**Request**: FormData
```
file: [Excel File]
```

**Data Operations**:
1. **Read**: Excel file → Parse with xlsx library
2. **Write**: MongoDB KnowledgeBase → Create entries for each row

**Response**:
```json
{
  "success": true,
  "message": "Successfully uploaded 15 knowledge entries",
  "count": 15
}
```

---

### GET /api/admin/analytics

**Request**: None

**Data Operations**:
1. **Read**: MongoDB Analytics → Get top 10 questions by count

**Response**:
```json
{
  "questions": [
    {
      "question": "What is Private Cloud Storage?",
      "count": 42
    },
    ...
  ]
}
```

---

## 📦 Data Storage Locations

### 1. MongoDB Atlas (Cloud Database)
- **Location**: `cluster0.lz6qcij.mongodb.net`
- **Database**: `kenmark_chatbot`
- **Collections**:
  - `ChatSession` - User sessions
  - `ChatMessage` - All chat messages
  - `KnowledgeBase` - FAQ/Knowledge content
  - `Analytics` - Question analytics

### 2. Browser Storage
- **Cookies**: `chat_session_id` (HTTP-only, 7 days)
- **React State**: Current messages, UI state

### 3. External Services
- **Groq API**: AI response generation (if configured)
- **Ollama**: Local LLM (if configured)

---

## 🔐 Data Security & Privacy

### Session Management
- Session IDs stored in HTTP-only cookies (prevents XSS)
- Sessions expire after 7 days
- Each session isolated from others

### Data Access
- **Read Access**: All collections readable by application
- **Write Access**: 
  - Chat messages: Created by users
  - Knowledge base: Admin only (via upload)
  - Analytics: Auto-updated by system

### Data Retention
- Chat sessions: 7 days (cookie expiration)
- Messages: Stored indefinitely (linked to sessions)
- Knowledge base: Permanent until deleted
- Analytics: Permanent, aggregated data

---

## 📈 Data Relationships

```
ChatSession (1) ──< (Many) ChatMessage
     │
     └─ sessionId (foreign key)

KnowledgeBase (Standalone)
     │
     └─ Used for RAG retrieval

Analytics (Standalone)
     │
     └─ Aggregated question data
```

---

## 🔍 Data Query Patterns

### 1. Get Session Messages
```typescript
prisma.chatSession.findUnique({
  where: { sessionId },
  include: { messages: { orderBy: { createdAt: 'asc' } } }
})
```

### 2. Search Knowledge Base
```typescript
prisma.knowledgeBase.findMany()
  .filter(entry => keywords match in entry text)
  .sort(by relevance score)
  .slice(0, 1) // Top result only
```

### 3. Get Top Questions
```typescript
prisma.analytics.findMany({
  orderBy: { count: 'desc' },
  take: 10
})
```

---

## 🚀 Data Flow Summary

1. **User Input** → Frontend (Chatbot.tsx)
2. **API Request** → /api/chat
3. **Session Check** → MongoDB ChatSession
4. **Save User Message** → MongoDB ChatMessage
5. **Update Analytics** → MongoDB Analytics
6. **Retrieve Knowledge** → MongoDB KnowledgeBase (RAG)
7. **Generate AI Response** → Groq API / Ollama
8. **Save AI Response** → MongoDB ChatMessage
9. **Return Response** → Frontend
10. **Display Message** → User sees response

---

## 📝 Environment Variables & Configuration

```env
DATABASE_URL="mongodb+srv://user:pass@cluster.mongodb.net/kenmark_chatbot"
GROQ_API_KEY="your_key_here"  # For AI responses
USE_OLLAMA=false              # Use Ollama instead of Groq
```

---

## 🔧 Data Maintenance

### Backup
- MongoDB Atlas provides automatic backups
- Can export collections via MongoDB Compass

### Cleanup
- Old sessions can be cleaned up (not implemented)
- Analytics can be reset (not implemented)

### Monitoring
- Check MongoDB Atlas dashboard for:
  - Collection sizes
  - Query performance
  - Connection status

---

This architecture ensures:
- ✅ Scalable data storage
- ✅ Fast query performance (indexed)
- ✅ Secure session management
- ✅ Efficient knowledge retrieval
- ✅ Analytics tracking
- ✅ Error resilience

