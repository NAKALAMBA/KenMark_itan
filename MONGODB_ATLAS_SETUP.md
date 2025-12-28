# MongoDB Atlas Connection Guide

Step-by-step guide to connect your MongoDB Atlas cloud database to the Kenmark ITan Solutions chatbot.

## 📋 Prerequisites

- A MongoDB Atlas account (free tier available)
- Your project set up with Prisma

## 🚀 Step-by-Step Setup

### Step 1: Create MongoDB Atlas Account

1. Go to [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Click **"Try Free"** or **"Sign Up"**
3. Sign up with your email or use Google/GitHub

### Step 2: Create a Cluster

1. After logging in, you'll see the **"Deploy a cloud database"** screen
2. Choose **"M0 FREE"** (Free Shared Cluster) - perfect for development
3. Select your preferred **Cloud Provider** (AWS, Google Cloud, or Azure)
4. Choose a **Region** closest to you
5. Click **"Create"** (cluster name is optional, default is fine)
6. Wait 3-5 minutes for the cluster to be created

### Step 3: Create Database User

1. In the MongoDB Atlas dashboard, go to **"Database Access"** (left sidebar)
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication method
4. Enter:
   - **Username**: (e.g., `kenmark_admin`)
   - **Password**: (create a strong password - **SAVE THIS!**)
5. Under **"Database User Privileges"**, select **"Read and write to any database"**
6. Click **"Add User"**

### Step 4: Configure Network Access

1. Go to **"Network Access"** (left sidebar)
2. Click **"Add IP Address"**
3. For development, click **"Allow Access from Anywhere"** (adds `0.0.0.0/0`)
   - ⚠️ **Note**: For production, add only your server's IP address
4. Click **"Confirm"**

### Step 5: Get Connection String

1. Go back to **"Database"** (left sidebar)
2. Click **"Connect"** on your cluster
3. Choose **"Drivers"** option
4. Select:
   - **Driver**: Node.js
   - **Version**: 5.5 or later
5. Copy the connection string (it looks like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### Step 6: Update Your Connection String

Replace the placeholders in the connection string:

1. Replace `<username>` with your database username (from Step 3)
2. Replace `<password>` with your database password (from Step 3)
3. Add your database name at the end (before `?`):
   ```
   mongodb+srv://kenmark_admin:yourpassword@cluster0.xxxxx.mongodb.net/kenmark_chatbot?retryWrites=true&w=majority
   ```

**Example:**
```
mongodb+srv://kenmark_admin:MySecurePass123@cluster0.abc123.mongodb.net/kenmark_chatbot?retryWrites=true&w=majority
```

### Step 7: Add to .env File

1. Create a `.env` file in your project root (if it doesn't exist)
2. Add your connection string:

```env
DATABASE_URL="mongodb+srv://kenmark_admin:MySecurePass123@cluster0.abc123.mongodb.net/kenmark_chatbot?retryWrites=true&w=majority"
NODE_ENV=development
```

**Important Notes:**
- Keep the connection string in quotes
- Replace the example values with your actual credentials
- Never commit `.env` to Git (it's already in `.gitignore`)

### Step 8: Test the Connection

1. Generate Prisma Client:
   ```bash
   npm run prisma:generate
   ```

2. Run migrations to create tables:
   ```bash
   npm run prisma:migrate
   ```

3. (Optional) Seed with sample data:
   ```bash
   npm run seed
   ```

4. Start your development server:
   ```bash
   npm run dev
   ```

5. Test the connection by:
   - Opening the chatbot
   - Sending a message
   - Checking if data is saved (go to MongoDB Atlas → Browse Collections)

## 🔍 Verify Connection in MongoDB Atlas

1. Go to your cluster in MongoDB Atlas
2. Click **"Browse Collections"**
3. You should see your database `kenmark_chatbot` with these collections:
   - `ChatSession`
   - `ChatMessage`
   - `KnowledgeBase`
   - `Analytics`

## 🛠️ Troubleshooting

### Error: "Authentication failed"

**Solution:**
- Double-check your username and password in the connection string
- Make sure there are no extra spaces
- URL-encode special characters in password (e.g., `@` becomes `%40`)

### Error: "IP not whitelisted"

**Solution:**
- Go to Network Access in MongoDB Atlas
- Add your current IP address or `0.0.0.0/0` for development

### Error: "Connection timeout"

**Solution:**
- Check your internet connection
- Verify the cluster is running (status should be green)
- Try the connection string format: `mongodb+srv://...`

### Error: "Database name not found"

**Solution:**
- The database will be created automatically when you first connect
- Make sure the database name in the connection string matches what Prisma expects

### Prisma Migration Fails

**Solution:**
```bash
# Reset and try again
npm run prisma:generate
npm run prisma:migrate dev --name init
```

## 🔒 Security Best Practices

1. **Never commit `.env` file** - It's already in `.gitignore`
2. **Use strong passwords** - At least 12 characters with mixed case, numbers, symbols
3. **Limit IP access** - In production, only allow your server's IP
4. **Rotate passwords** - Change database password periodically
5. **Use environment variables** - Always use `.env` for sensitive data

## 📝 Connection String Format

```
mongodb+srv://[username]:[password]@[cluster-address]/[database-name]?[options]
```

**Components:**
- `username`: Your database user
- `password`: Your database password (URL-encoded if needed)
- `cluster-address`: Your cluster URL (e.g., `cluster0.abc123.mongodb.net`)
- `database-name`: Database name (e.g., `kenmark_chatbot`)
- `options`: Connection options (usually `retryWrites=true&w=majority`)

## 🚀 For Production Deployment

When deploying to Vercel/Netlify:

1. Go to your hosting platform's environment variables section
2. Add `DATABASE_URL` with your MongoDB Atlas connection string
3. Make sure Network Access allows your hosting platform's IP ranges
4. For Vercel, you may need to add Vercel's IP ranges or use `0.0.0.0/0` (less secure but works)

## ✅ Quick Checklist

- [ ] MongoDB Atlas account created
- [ ] Cluster created and running
- [ ] Database user created with read/write permissions
- [ ] Network access configured (IP whitelisted)
- [ ] Connection string copied and updated with credentials
- [ ] `.env` file created with `DATABASE_URL`
- [ ] Prisma client generated (`npm run prisma:generate`)
- [ ] Migrations run (`npm run prisma:migrate`)
- [ ] Connection tested (start dev server)

---

**Need Help?** Check the main [README.md](README.md) or [QUICKSTART.md](QUICKSTART.md) for more information.

