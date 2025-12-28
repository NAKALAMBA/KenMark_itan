# MongoDB Atlas Connection Setup - Your Configuration

## ✅ Your Connection String

I've set up your `.env` file with your MongoDB Atlas connection string:

```
DATABASE_URL="mongodb+srv://nakalamba11_db_user:yK0F19ijY9GoteH1@cluster0.lz6qcij.mongodb.net/kenmark_chatbot?retryWrites=true&w=majority&appName=Cluster0"
NODE_ENV=development
```

## 📝 Manual Setup (if needed)

If the `.env` file wasn't created automatically, create it manually in the project root with:

```env
DATABASE_URL="mongodb+srv://nakalamba11_db_user:yK0F19ijY9GoteH1@cluster0.lz6qcij.mongodb.net/kenmark_chatbot?retryWrites=true&w=majority&appName=Cluster0"
NODE_ENV=development
```

**Important Notes:**
- The database name `kenmark_chatbot` has been added to your connection string
- The connection string is wrapped in quotes (required for special characters)
- Your MongoDB driver version (6.21.0) meets the 6.1+ requirement

## 🔧 Next Steps

### 1. Fix Prisma Permission Issue (if you see EPERM error)

**Option A: Close any running processes**
- Close your code editor
- Close any running `npm run dev` processes
- Close Prisma Studio if open
- Try again

**Option B: Run as Administrator**
- Right-click PowerShell/Command Prompt
- Select "Run as Administrator"
- Navigate to project directory
- Run commands again

**Option C: Delete and regenerate**
```bash
# Delete Prisma client
rm -rf node_modules/.prisma
# or on Windows:
rmdir /s node_modules\.prisma

# Then regenerate
npm run prisma:generate
```

### 2. Generate Prisma Client

```bash
npm run prisma:generate
```

### 3. Run Database Migrations

```bash
npm run prisma:migrate
```

When prompted for a migration name, enter: `init`

### 4. (Optional) Seed Sample Data

```bash
npm run seed
```

### 5. Test the Connection

```bash
npm run dev
```

Then:
- Open http://localhost:3000
- Click the chatbot button
- Send a test message
- Check MongoDB Atlas → Browse Collections to see if data is saved

## ✅ Verify Connection

1. Go to MongoDB Atlas dashboard
2. Click "Browse Collections" on your cluster
3. You should see:
   - Database: `kenmark_chatbot`
   - Collections:
     - `ChatSession`
     - `ChatMessage`
     - `KnowledgeBase`
     - `Analytics`

## 🐛 Troubleshooting

### Error: "EPERM: operation not permitted"
- Close all Node.js processes
- Close your IDE/editor
- Try again
- If persists, restart your computer

### Error: "Authentication failed"
- Verify username: `nakalamba11_db_user`
- Check password is correct
- Ensure IP is whitelisted in MongoDB Atlas Network Access

### Error: "Connection timeout"
- Check internet connection
- Verify cluster is running (green status in Atlas)
- Check Network Access settings allow your IP

### Error: "Database not found"
- The database will be created automatically on first connection
- Make sure the database name `kenmark_chatbot` is in the connection string

## 📊 Connection String Breakdown

Your connection string components:
- **Username**: `nakalamba11_db_user`
- **Password**: `yK0F19ijY9GoteH1`
- **Cluster**: `cluster0.lz6qcij.mongodb.net`
- **Database**: `kenmark_chatbot` (added)
- **Options**: `retryWrites=true&w=majority&appName=Cluster0`

## 🔒 Security Reminder

- ✅ `.env` is already in `.gitignore` (won't be committed)
- ⚠️ Never share your connection string publicly
- ⚠️ Never commit `.env` to Git
- ✅ Your password is secure in the connection string

---

**Your MongoDB Atlas is now configured!** 🎉

If you encounter any issues, check the error message and refer to the troubleshooting section above.

