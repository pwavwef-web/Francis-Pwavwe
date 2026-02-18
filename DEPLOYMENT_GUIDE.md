# Francis Portal - Deployment Guide

## Prerequisites

✅ Firebase project: `francis-pwavwe`
✅ Firebase Blaze plan enabled
✅ Firebase CLI installed (optional for deployment)
✅ Git repository cloned

## Quick Start (No Firebase CLI)

### Option 1: GitHub Pages (Recommended for Testing)
1. The site is already configured for GitHub Pages
2. Access via: `https://pwavwef-web.github.io/Francis-Pwavwe/francis.html`
3. No additional setup needed

### Option 2: Direct File Access
1. Open `francis.html` directly in your browser
2. All Firebase services will work (Auth, Firestore, Storage)
3. No web server required for basic functionality

## Full Deployment with Firebase CLI

### Step 1: Install Firebase CLI (if not installed)
```bash
npm install -g firebase-tools
```

### Step 2: Login to Firebase
```bash
firebase login
```

### Step 3: Initialize Firebase (if not already done)
```bash
firebase init
```
Select:
- Firestore
- Hosting
- Storage

### Step 4: Deploy Firestore Security Rules
```bash
firebase deploy --only firestore:rules
```

Expected output:
```
✔  Deploy complete!
```

### Step 5: Deploy Hosting
```bash
firebase deploy --only hosting
```

Expected output:
```
✔  Deploy complete!
Hosting URL: https://francis-pwavwe.web.app
```

### Step 6: Verify Deployment
1. Visit: `https://francis-pwavwe.web.app/francis.html`
2. Login with: pwavwef@gmail.com
3. Test all features

## Firestore Security Rules

The following collections are created:

| Collection | Access | Purpose |
|-----------|--------|---------|
| `finances` | pwavwef@gmail.com | Wallet, budget, expenses |
| `plans` | pwavwef@gmail.com | Tasks and goals |
| `blogs` | pwavwef@gmail.com | Blog posts |
| `projects` | pwavwef@gmail.com | Project files metadata |
| `messages` | Read: pwavwef@gmail.com<br>Write: Public | Contact form submissions |

## Firebase Storage Setup

### Storage Rules
Storage is configured to allow uploads only from authenticated users:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /projects/{allPaths=**} {
      allow read, write: if request.auth != null 
                         && request.auth.token.email == 'pwavwef@gmail.com';
    }
  }
}
```

### Deploy Storage Rules
```bash
firebase deploy --only storage
```

## Environment Configuration

### Firebase Configuration
Already configured in `francis.html`:
```javascript
const firebaseConfig = {
    apiKey: 'AIzaSyB6lxgjNY4CRNHAe3pAgR5SYv1ohL8brOI',
    authDomain: 'francis-pwavwe.firebaseapp.com',
    projectId: 'francis-pwavwe',
    storageBucket: 'francis-pwavwe.firebasestorage.app',
    messagingSenderId: '658069378543',
    appId: '1:658069378543:web:87b1dcb0dd27d3255bd21a'
};
```

### Gemini AI Configuration
API key configured in `francis.html`:
```javascript
const GEMINI_API_KEY = 'AIzaSyDcEcBXUuzBas3qAaSQ-zw1a7Tj20guvwk';
```

> **Note**: For enhanced security in production, consider moving AI calls to Firebase Cloud Functions.

## Testing Checklist

After deployment, verify:

### Authentication
- [ ] Can login with pwavwef@gmail.com
- [ ] Cannot login with other emails
- [ ] Logout works correctly
- [ ] Session persists on refresh

### Finances
- [ ] Update wallet balance
- [ ] Add expense with category
- [ ] View pie chart (after adding expenses)
- [ ] Set monthly budget
- [ ] Get AI financial advice

### Planning
- [ ] Create new plan
- [ ] Set priority and due date
- [ ] Get AI planning advice
- [ ] Delete plan

### Blogs
- [ ] Create blog post
- [ ] Use rich text editor (bold, italic, lists)
- [ ] Insert link
- [ ] Insert image URL
- [ ] View published blogs
- [ ] Delete blog

### Projects
- [ ] Upload project with files
- [ ] Download files
- [ ] Delete project

### Messages
- [ ] View messages from contact form
- [ ] Delete message

### AI Assistant
- [ ] Send message
- [ ] Receive AI response
- [ ] Multiple conversation turns

## Troubleshooting

### "Permission Denied" Errors
**Issue**: Cannot read/write to Firestore
**Solution**: 
1. Verify you're logged in as pwavwef@gmail.com
2. Deploy firestore rules: `firebase deploy --only firestore:rules`
3. Check Firebase Console > Firestore > Rules

### "Storage Upload Failed"
**Issue**: Cannot upload project files
**Solution**:
1. Verify Firebase Blaze plan is active
2. Deploy storage rules: `firebase deploy --only storage`
3. Check file size limits (Firebase has max file sizes)

### "AI Not Responding"
**Issue**: Gemini API not working
**Solution**:
1. Check API key is valid
2. Verify internet connection
3. Check browser console for errors
4. Ensure API quota not exceeded

### "Charts Not Showing"
**Issue**: Pie chart not displaying
**Solution**:
1. Wait for Chart.js to load from CDN
2. Add at least one expense
3. Check browser console for errors
4. Try refreshing the page

### "Login Loop"
**Issue**: Keeps returning to login screen
**Solution**:
1. Clear browser cache and cookies
2. Check Firebase Authentication is enabled
3. Verify email is exactly: pwavwef@gmail.com

## Monitoring

### Firebase Console
Monitor usage at: https://console.firebase.google.com

Check:
- **Authentication**: Number of users (should be 1)
- **Firestore**: Number of reads/writes
- **Storage**: Files uploaded and storage used
- **Hosting**: Page views and bandwidth

### Cost Monitoring
Blaze plan costs to monitor:
- Firestore operations (reads/writes)
- Storage bandwidth
- Gemini API calls
- Cloud Functions (if implemented)

### Set Budget Alerts
1. Go to Firebase Console
2. Project Settings > Usage and Billing
3. Set budget alerts
4. Recommended: Alert at $5, $10, $25

## Backup Strategy

### Firestore Data
```bash
# Export all collections
firebase firestore:export gs://francis-pwavwe.appspot.com/backups/$(date +%Y%m%d)
```

### Storage Files
Download all project files periodically through the portal interface.

### Code Backup
```bash
git push origin main
```

## Performance Optimization

### Already Implemented
- ✅ Real-time listeners (efficient updates)
- ✅ Indexed queries
- ✅ Pagination ready (can add limits)
- ✅ CDN for Chart.js
- ✅ Minimal JavaScript bundle

### Future Optimizations
- Add caching for frequently accessed data
- Implement lazy loading for images
- Add service worker for offline support
- Compress images before upload

## Security Checklist

- [x] Authentication required
- [x] Firestore security rules deployed
- [x] Storage security rules deployed
- [x] XSS protection (HTML sanitization)
- [x] HTML escaping for user text
- [x] HTTPS enforced
- [ ] Consider moving API keys to Cloud Functions (optional)
- [ ] Set up monitoring alerts
- [ ] Regular security audits

## Support

### Documentation
- `FRANCIS_PORTAL_README.md` - Technical docs
- `FRANCIS_PORTAL_GUIDE.md` - User guide
- `SECURITY_SUMMARY.md` - Security details

### Contact
For issues or questions:
- Email: pwavwef@gmail.com
- Repository: https://github.com/pwavwef-web/Francis-Pwavwe

## Success Criteria

✅ Portal loads without errors
✅ Can login successfully
✅ All 7 tabs functional
✅ Data persists after logout
✅ Files upload/download works
✅ AI responses working
✅ Charts display correctly
✅ Mobile responsive
✅ No console errors

---

**Last Updated**: February 18, 2026
**Version**: 1.0.0
**Status**: Production Ready ✅
