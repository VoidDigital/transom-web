# Deployment Guide for Transom Web Interface

This guide covers deploying your Transom web app to various hosting platforms.

## Quick Deploy to Vercel (Recommended)

1. **Push to GitHub** (if not already done):
```bash
git add .
git commit -m "Initial Transom web interface"
git push origin main
```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import your `transom-web` repository

3. **Configure Environment Variables** in Vercel:
   - `VITE_FIREBASE_API_KEY` = Your Firebase Web API Key
   - `VITE_FIREBASE_PROJECT_ID` = transom-4d8f2
   - `VITE_FIREBASE_APP_ID` = Your Firebase App ID

4. **Deploy**: Vercel will automatically build and deploy

## Alternative: Netlify

1. **Connect Repository**:
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Connect your GitHub repository

2. **Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Environment Variables**: Add the same Firebase variables as above

## Alternative: Firebase Hosting

1. **Install Firebase CLI**:
```bash
npm install -g firebase-tools
firebase login
```

2. **Initialize Firebase Hosting**:
```bash
firebase init hosting
```

3. **Configure firebase.json**:
```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

4. **Deploy**:
```bash
npm run build
firebase deploy
```

## Pre-Deployment Checklist

- [ ] Firebase indexes are built and active
- [ ] Environment variables are configured
- [ ] Domain added to Firebase authorized domains
- [ ] Firebase Auth and Firestore rules are configured
- [ ] App tested with production build (`npm run build && npm run preview`)

## Post-Deployment

1. **Update Firebase Authorized Domains**:
   - Add your production domain (e.g., `transom-web.vercel.app`)
   - Go to Firebase Console > Authentication > Settings > Authorized domains

2. **Test Authentication**:
   - Test both email/password and Google sign-in
   - Verify data sync with iOS app

3. **Monitor Performance**:
   - Check hosting platform analytics
   - Monitor Firebase usage in Firebase Console

## Custom Domain (Optional)

For a custom domain like `app.yourdomain.com`:

1. **Purchase domain** through your preferred registrar
2. **Configure DNS** according to your hosting platform's documentation
3. **Add domain** in hosting platform settings
4. **Update Firebase** authorized domains with new domain
5. **Test SSL certificate** is properly configured

## Troubleshooting

### Common Issues

**Authentication not working**:
- Check environment variables are set correctly
- Verify domain is in Firebase authorized domains
- Check browser console for detailed error messages

**Data not loading**:
- Confirm Firebase indexes are built and active
- Check Firebase rules allow read/write for authenticated users
- Verify network connectivity to Firebase

**Build failures**:
- Check all dependencies are in package.json
- Verify TypeScript compilation succeeds locally
- Review build logs for specific error messages