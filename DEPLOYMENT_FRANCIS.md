# Quick Deployment Guide for francis.html

## Option 1: GitHub Pages (Recommended)

### Current Setup
The file is already in the repository and accessible at:
```
https://pwavwef-web.github.io/Francis-Pwavwe/francis.html
```

### Alternative: Make it the Admin Homepage
If you want a cleaner URL, you can:

1. Create a subdirectory called `admin/`:
   ```bash
   mkdir admin
   cp francis.html admin/index.html
   git add admin/index.html
   git commit -m "Add admin panel"
   git push
   ```

2. Then access at:
   ```
   https://pwavwef-web.github.io/Francis-Pwavwe/admin/
   ```

## Option 2: Netlify

1. Go to [netlify.com](https://netlify.com)
2. Drag and drop the `francis.html` file
3. Rename to `index.html` for cleaner URL
4. Deploy

## Option 3: Vercel

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel francis.html
   ```

## Option 4: Cloudflare Pages

1. Go to Cloudflare Pages
2. Create new project
3. Upload `francis.html` as `index.html`
4. Deploy

## Local Testing

Before deploying, test locally:

```bash
# Python 3
python3 -m http.server 8000

# Then open: http://localhost:8000/francis.html
```

## Security Setup

⚠️ **IMPORTANT**: The API keys are visible in the client-side code. This is normal for web applications, but you MUST configure restrictions:

### Firebase Configuration

1. **Restrict Firebase API Key** (REQUIRED):
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to "APIs & Services" → "Credentials"
   - Find your API key (starts with `AIzaSyB6lxgjNY...`)
   - Click "Edit"
   - Under "Application restrictions", select "HTTP referrers"
   - Add your authorized domains:
     ```
     https://pwavwef-web.github.io/*
     https://*.netlify.app/*
     https://*.vercel.app/*
     http://localhost:8000/*    # For local testing
     ```
   - Under "API restrictions", select "Restrict key"
   - Enable only:
     - Firebase Authentication API
     - Cloud Firestore API
   - Click "Save"

2. **Firestore Security Rules**:
   Ensure these rules are set in Firebase Console:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /messages/{messageId} {
         // Admin can read and delete
         allow read, delete: if request.auth != null && 
           request.auth.token.email == 'pwavwef@gmail.com';
         
         // Anyone can create messages (from contact form)
         allow create: if request.resource.data.keys().hasAll(
           ['name', 'email', 'subject', 'message', 'timestamp']
         );
       }
     }
   }
   ```

3. **Gemini API Key** (CRITICAL):
   ⚠️ **WARNING**: The Gemini API key is exposed in the client code, which means:
   - Anyone can view the key in browser dev tools
   - Anyone can use your quota if they copy the key
   - This is acceptable ONLY for personal use with quota monitoring
   
   **Recommended Actions**:
   - Set up billing alerts in [Google AI Studio](https://makersuite.google.com/)
   - Monitor API usage regularly
   - Set spending limits if available
   - For production, consider:
     - Moving AI calls to a backend server/Cloud Function
     - Using Firebase Cloud Functions as a proxy
     - Implementing rate limiting
   
   **Quick Setup**:
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - View your API key settings
   - Set up usage alerts
   - Monitor quota usage

## Access the Panel

1. Open the deployed URL
2. Login with: `pwavwef@gmail.com`
3. Use your Firebase password
4. Start using the admin panel!

## Troubleshooting

### CORS Errors
- Make sure you're accessing via HTTPS (not file://)
- Use a proper web server for local testing
- Check Firebase domain restrictions

### Can't Login
- Verify the account exists in Firebase Authentication
- Check if Email/Password auth is enabled
- Ensure correct password

### Messages Not Loading
- Check Firestore security rules
- Verify internet connection
- Check browser console for errors

---

For detailed documentation, see `FRANCIS_HTML_README.md`
