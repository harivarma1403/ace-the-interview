# Deployment Checklist for Ace the Interview

## ✅ Pre-Deployment Checklist

### 1. Code Issues Fixed
- [x] Fixed invalid `next.config.ts` option (`allowedDevOrigins` removed)
- [x] TypeScript type checking passes with no errors
- [x] Production build completes successfully
- [x] `.gitignore` properly excludes sensitive files (`.env`, `node_modules`)

### 2. Build Verification
Run these commands to verify everything works:
```bash
npm run typecheck  # Should pass with no errors
npm run build      # Should complete successfully
```

### 3. Environment Variables Setup

**For Local Development:**
Create a `.env` file in the root directory with:
```
GEMINI_API_KEY="YOUR_API_KEY_HERE"
```

**For Firebase App Hosting Deployment:**
Set environment variables in Firebase Console:
1. Go to Firebase Console → App Hosting → Your Backend
2. Navigate to Environment Variables section
3. Add: `GEMINI_API_KEY` with your API key value

**Important:** The `.env` file is already in `.gitignore`, so it won't be uploaded to GitHub.

### 4. Firebase Configuration

The Firebase config is already set up in `src/firebase/config.ts`. During deployment to Firebase App Hosting, the app will automatically use environment variables provided by Firebase. If automatic initialization fails, it falls back to the config object (which is fine for deployment).

### 5. Deployment Steps

#### Option A: Deploy to Firebase App Hosting (Recommended)

1. **Install Firebase CLI** (if not already installed):
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
   - Choose a backend name (e.g., `ace-the-interview-backend`)
   - Select a region

4. **Set Environment Variables in Firebase Console**:
   - Go to Firebase Console → App Hosting → Your Backend
   - Add `GEMINI_API_KEY` environment variable

5. **Deploy**:
   ```bash
   firebase apphosting:backends:deploy
   ```

#### Option B: Deploy to Vercel

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com) and import your repository
3. Add environment variable: `GEMINI_API_KEY`
4. Deploy

#### Option C: Deploy to Other Platforms

Make sure to:
- Set `GEMINI_API_KEY` as an environment variable
- Run `npm run build` during build process
- Use Node.js 20 runtime (as specified in `apphosting.yaml`)

## ⚠️ Important Notes

1. **Never commit `.env` file** - It's already in `.gitignore`
2. **Genkit Service**: The Genkit AI backend will run automatically on Firebase App Hosting. For other platforms, you may need to configure it separately.
3. **Firebase Project**: Make sure your Firebase project has the necessary services enabled:
   - Authentication
   - Firestore Database

## 🔧 Troubleshooting

### Build Errors
- Run `npm run typecheck` to check for TypeScript errors
- Run `npm run build` to test the production build
- Check that all dependencies are installed: `npm install`

### Runtime Errors
- Verify environment variables are set correctly
- Check Firebase configuration in `src/firebase/config.ts`
- Ensure Firebase services are enabled in your Firebase project

### Deployment Errors
- Check Firebase CLI version: `firebase --version`
- Verify you're logged in: `firebase login`
- Check deployment logs in Firebase Console

## 📝 Post-Deployment

After successful deployment:
1. Test all features of the application
2. Verify AI features work (requires `GEMINI_API_KEY`)
3. Check Firebase Authentication and Firestore are working
4. Monitor deployment logs for any issues

