# Deployment Guide

This guide will help you deploy the Kenmark ITan Solutions chatbot to production.

## Pre-Deployment Checklist

- [ ] All environment variables are configured
- [ ] MongoDB database is set up and accessible
- [ ] Prisma migrations have been run
- [ ] Knowledge base has been seeded (optional)
- [ ] AI service is configured (Ollama or Groq API)

## Deployment Options

### Option 1: Vercel (Recommended for Next.js)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Configure Environment Variables**
   In Vercel dashboard, go to Settings → Environment Variables and add:
   ```
   DATABASE_URL=your_mongodb_connection_string
   USE_OLLAMA=false
   GROQ_API_KEY=your_groq_api_key
   NODE_ENV=production
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live!

**Note**: For Ollama, you'll need a self-hosted server or use a different AI service in production.

### Option 2: Netlify

1. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Node version: 18.x or higher

2. **Environment Variables**
   Add the same environment variables as Vercel

3. **Deploy**
   - Connect your GitHub repository
   - Configure build settings
   - Deploy!

### Option 3: Render

1. **Create Web Service**
   - Connect GitHub repository
   - Select "Web Service"
   - Build command: `npm install && npm run build`
   - Start command: `npm start`

2. **Environment Variables**
   Add all required environment variables

3. **Database**
   - Use Render's MongoDB service or external MongoDB Atlas

## MongoDB Setup

### MongoDB Atlas (Cloud - Recommended)

1. Create account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist IP addresses (0.0.0.0/0 for all, or your server IP)
5. Get connection string
6. Update `DATABASE_URL` in environment variables

### Local MongoDB (Not Recommended for Production)

Only use for development. For production, use MongoDB Atlas or a managed service.

## Post-Deployment Steps

1. **Run Prisma Migrations**
   ```bash
   npm run prisma:migrate
   ```

2. **Seed Database (Optional)**
   ```bash
   npm run seed
   ```

3. **Test the Application**
   - Visit your deployed URL
   - Test the chatbot
   - Upload a knowledge base file via admin panel
   - Verify analytics

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes | MongoDB connection string | `mongodb+srv://... |
| `USE_OLLAMA` | No | Use local Ollama (true/false) | `false` |
| `OLLAMA_BASE_URL` | No | Ollama server URL | `http://localhost:11434` |
| `OLLAMA_MODEL` | No | Ollama model name | `llama3.2` |
| `GROQ_API_KEY` | No | Groq API key | `gsk_...` |
| `NODE_ENV` | Yes | Environment | `production` |

## Troubleshooting

### Build Fails
- Check Node.js version (18+ required)
- Verify all dependencies are in package.json
- Check for TypeScript errors

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check MongoDB network access settings
- Ensure database user has proper permissions

### AI Service Not Working
- If using Ollama, ensure it's accessible from your server
- For Groq, verify API key is correct
- Check API rate limits

### Chatbot Not Responding
- Check browser console for errors
- Verify API routes are accessible
- Check server logs for errors

## Performance Optimization

1. **Enable Caching**
   - Vercel automatically caches static assets
   - Consider adding Redis for session caching

2. **Database Indexing**
   - Prisma automatically creates indexes
   - Monitor slow queries

3. **AI Response Time**
   - Use Groq API for faster responses
   - Consider response caching for common queries

## Security Considerations

1. **Environment Variables**
   - Never commit `.env` files
   - Use secure environment variable storage

2. **API Routes**
   - Consider adding rate limiting
   - Add authentication for admin routes

3. **Database**
   - Use strong database passwords
   - Restrict network access
   - Enable MongoDB authentication

## Monitoring

1. **Error Tracking**
   - Set up error tracking (Sentry, etc.)
   - Monitor API response times

2. **Analytics**
   - Use built-in analytics dashboard
   - Monitor chatbot usage

3. **Database Monitoring**
   - Monitor MongoDB Atlas metrics
   - Set up alerts for high usage

## Support

For issues or questions:
- Check the README.md
- Review error logs
- Contact support at kenmarkitan.com

