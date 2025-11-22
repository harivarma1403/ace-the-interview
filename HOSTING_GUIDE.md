# Hosting Guide for Ace the Interview

## ✅ Yes, you can host this project from GitHub!

All necessary files are in the repository. Here are your hosting options:

---

## Option 1: Vercel (Recommended - Easiest for Next.js)

**Best for:** Quick deployment, automatic GitHub integration, free tier

### Steps:

1. **Go to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Sign up/login with your GitHub account

2. **Import Your Repository**
   - Click "Add New Project"
   - Select "Import Git Repository"
   - Choose `harivarma1403/ace-the-interview`
   - Click "Import"

3. **Configure Project**
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)

4. **Add Environment Variables**
   - In the "Environment Variables" section, add:
     - **Name:** `GEMINI_API_KEY`
     - **Value:** Your Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Click "Add"

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (2-5 minutes)
   - Your app will be live at: `https://your-project-name.vercel.app`

### ⚠️ Important for Vercel:
- **Genkit Backend**: You'll need to deploy the Genkit backend separately or use Vercel's serverless functions
- The Genkit flows may need to be adapted for serverless deployment

---

## Option 2: Firebase App Hosting (Recommended for Full-Stack)

**Best for:** Full-stack apps with backend, Firebase integration, Genkit support

### Prerequisites:
- Firebase account
- Firebase project created
- Firebase CLI installed

### Steps:

1. **Install Firebase CLI** (if not installed):
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Initialize App Hosting**:
   ```bash
   firebase init apphosting
   ```
   - Select your Firebase project
   - Backend name: `ace-the-interview-backend`
   - Choose a region (closest to your users)

4. **Connect to GitHub** (Optional - for automatic deployments):
   - In Firebase Console → App Hosting
   - Connect your GitHub repository
   - Enable automatic deployments

5. **Set Environment Variables**:
   - Go to Firebase Console → App Hosting → Your Backend
   - Navigate to "Environment Variables"
   - Add: `GEMINI_API_KEY` with your API key value

6. **Deploy**:
   ```bash
   firebase apphosting:backends:deploy
   ```
   Or deploy from GitHub if connected.

### ✅ Advantages:
- Full Genkit support
- Automatic backend deployment
- Integrated with Firebase services
- Server-side rendering support

---

## Option 3: Netlify

**Best for:** Simple deployments, good Next.js support

### Steps:

1. **Go to Netlify**
   - Visit [netlify.com](https://netlify.com)
   - Sign up/login with GitHub

2. **Import from GitHub**
   - Click "Add new site" → "Import an existing project"
   - Select your GitHub repository
   - Configure:
     - Build command: `npm run build`
     - Publish directory: `.next`

3. **Add Environment Variables**
   - Site settings → Environment variables
   - Add: `GEMINI_API_KEY` = your API key

4. **Deploy**
   - Click "Deploy site"

---

## Option 4: Railway

**Best for:** Full-stack apps, easy setup

### Steps:

1. **Go to Railway**
   - Visit [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Configure**
   - Railway auto-detects Next.js
   - Add environment variable: `GEMINI_API_KEY`

4. **Deploy**
   - Railway automatically deploys

---

## 🔑 Required Environment Variables

**All hosting platforms need:**
- `GEMINI_API_KEY` - Your Google Gemini API key
  - Get it from: [Google AI Studio](https://aistudio.google.com/app/apikey)

**For Firebase hosting, you may also need:**
- Firebase project configuration (handled automatically)

---

## 📋 Pre-Deployment Checklist

Before deploying, verify locally:

```bash
# 1. Install dependencies
npm install

# 2. Check for TypeScript errors
npm run typecheck

# 3. Test production build
npm run build

# 4. Test locally (optional)
npm start
```

---

## 🚀 Quick Start (Vercel - Easiest)

1. Go to [vercel.com](https://vercel.com) → Sign in with GitHub
2. Click "Add New Project" → Import `ace-the-interview`
3. Add environment variable: `GEMINI_API_KEY`
4. Click "Deploy"
5. Done! Your app is live in ~2 minutes

---

## ⚠️ Important Notes

1. **Genkit Backend**: 
   - On Vercel/Netlify: May need serverless function adaptation
   - On Firebase: Works automatically with App Hosting

2. **Firebase Services**:
   - Make sure Authentication and Firestore are enabled in your Firebase project
   - Configure Firebase rules if needed

3. **Environment Variables**:
   - Never commit `.env` file (already in `.gitignore`)
   - Always set environment variables in hosting platform's dashboard

4. **Build Time**:
   - First deployment: 3-5 minutes
   - Subsequent deployments: 1-2 minutes

---

## 🆘 Troubleshooting

### Build Fails
- Check TypeScript errors: `npm run typecheck`
- Verify all dependencies: `npm install`
- Check build logs in hosting platform

### Runtime Errors
- Verify `GEMINI_API_KEY` is set correctly
- Check Firebase configuration
- Review deployment logs

### Genkit Not Working
- On Vercel/Netlify: May need to adapt for serverless
- On Firebase: Should work automatically

---

## 📞 Need Help?

- Check deployment logs in your hosting platform
- Review `DEPLOYMENT.md` for detailed Firebase instructions
- Check hosting platform documentation

