# Francis Personal Portal - Deployment Instructions

## Firebase Deployment Steps

The Francis Personal Portal requires deploying updated Firestore security rules to Firebase. Follow these steps:

### Prerequisites

1. **Firebase CLI Installed**
   ```bash
   npm install -g firebase-tools
   ```

2. **Firebase Login**
   ```bash
   firebase login
   ```

3. **Initialize Project** (if not already done)
   ```bash
   firebase init
   ```
   Select:
   - Firestore: Configure security rules
   - Use existing project: `francis-pwavwe`

### Deploy Firestore Rules

The `firestore.rules` file has been updated to include security rules for the new collections:
- `transactions` (finances)
- `tasks` (planning)
- `blogs` (blog posts)
- `projects` (project files)
- `messages` (contact form submissions)

**Deploy the rules:**
```bash
firebase deploy --only firestore:rules
```

**Expected output:**
```
✔ firestore: released rules firestore.rules to cloud.firestore
✔ Deploy complete!
```

### Verify Deployment

1. Go to Firebase Console: https://console.firebase.google.com
2. Select project: `francis-pwavwe`
3. Navigate to Firestore Database → Rules
4. Verify the rules match the content in `firestore.rules`

### Enable Firebase Storage (if not already enabled)

The Projects feature requires Firebase Storage:

1. Go to Firebase Console → Storage
2. Click "Get Started"
3. Select "Start in production mode"
4. Choose location (preferably same as Firestore)
5. Click "Done"

The default Storage rules allow authenticated access, which is appropriate for this use case.

### Test the Deployment

1. Open: https://pwavwef-web.github.io/Francis-Pwavwe/francis.html
2. Sign in with `pwavwef@gmail.com`
3. Test each feature:
   - **Finances**: Add a transaction
   - **Planning**: Create a task
   - **Blogs**: Write a blog post
   - **Projects**: Upload a file
   - **Messages**: Should show existing messages

If any feature fails, check:
- Browser console for errors
- Firebase Console → Firestore → Data (verify collections exist)
- Firebase Console → Authentication (verify user is authenticated)
- Firebase Console → Storage (verify files are uploading)

## GitHub Pages Deployment

The portal is automatically deployed to GitHub Pages when pushed to the main branch.

**Access URL:**
```
https://pwavwef-web.github.io/Francis-Pwavwe/francis.html
```

### Set as Default Admin Page (Optional)

To make `francis.html` the default admin page:

1. **Option 1: Update firebase.json rewrites**
   ```json
   {
     "hosting": {
       "rewrites": [
         {
           "source": "/admin",
           "destination": "/francis.html"
         }
       ]
     }
   }
   ```
   Then deploy: `firebase deploy --only hosting`
   
   Access via: `https://pwavwef-web.github.io/Francis-Pwavwe/admin`

2. **Option 2: Create separate GitHub Pages branch**
   - Create branch: `gh-pages-admin`
   - Copy `francis.html` as `index.html`
   - Configure GitHub Pages to use that branch
   - Access via custom subdomain

## Security Configuration

### Restrict Firebase API Key

⚠️ **Important**: Restrict the Firebase API key to prevent unauthorized use:

1. Go to Google Cloud Console: https://console.cloud.google.com
2. Select project: `francis-pwavwe`
3. Navigate to APIs & Services → Credentials
4. Find the Browser key (API key starting with `AIzaSyB6lxgjNY...`)
5. Click Edit
6. Under "Application restrictions":
   - Select "HTTP referrers (websites)"
   - Add: `https://pwavwef-web.github.io/Francis-Pwavwe/*`
   - Add: `http://localhost:*` (for local testing)
7. Under "API restrictions":
   - Select "Restrict key"
   - Enable only:
     - Firebase Authentication API
     - Cloud Firestore API
     - Cloud Storage API
8. Save changes

### Monitor Gemini AI Usage

The Gemini API key is visible in the client code. To prevent abuse:

1. **Set up billing alerts** in Google Cloud Console
2. **Monitor usage** in Google AI Studio: https://aistudio.google.com
3. **Set quota limits** if available
4. **For production**: Consider implementing a Cloud Function proxy:
   ```javascript
   // Cloud Function to proxy AI requests
   exports.askAI = functions.https.onCall(async (data, context) => {
     // Verify authenticated user
     if (!context.auth || context.auth.token.email !== 'pwavwef@gmail.com') {
       throw new functions.https.HttpsError('permission-denied');
     }
     
     // Call Gemini API with server-side key
     const response = await fetch(...);
     return response;
   });
   ```

## Maintenance

### Regular Tasks

1. **Monitor Usage**
   - Firebase Console → Usage and billing
   - Check Firestore reads/writes
   - Check Storage usage
   - Monitor Gemini API quota

2. **Backup Data**
   ```bash
   # Export Firestore data
   gcloud firestore export gs://francis-pwavwe.appspot.com/backups
   ```

3. **Update Dependencies**
   - Keep Firebase SDK versions current
   - Update Chart.js if needed
   - Monitor for security updates

4. **Review Security Rules**
   - Periodically audit Firestore rules
   - Check for unauthorized access patterns
   - Update rules as features evolve

### Troubleshooting

**Problem**: Rules deployment fails  
**Solution**: 
- Check Firebase CLI is logged in: `firebase login`
- Verify project ID: `firebase use francis-pwavwe`
- Check rules syntax in `firestore.rules`

**Problem**: Storage upload fails  
**Solution**:
- Verify Firebase Storage is enabled
- Check storage rules allow authenticated writes
- Ensure sufficient storage quota

**Problem**: AI responses failing  
**Solution**:
- Check Gemini API key is valid
- Verify quota hasn't been exceeded
- Check for API service disruptions

## Support

For deployment issues:
- Email: pwavwef@gmail.com
- Firebase Support: https://firebase.google.com/support
- GitHub Issues: Create an issue in the repository

## Rollback Procedure

If issues occur after deployment:

1. **Rollback Firestore Rules**
   ```bash
   # Edit firestore.rules to previous version
   firebase deploy --only firestore:rules
   ```

2. **Revert Code Changes**
   ```bash
   git revert <commit-hash>
   git push
   ```

3. **Restore Data** (if needed)
   ```bash
   # From backup
   gcloud firestore import gs://francis-pwavwe.appspot.com/backups/<backup-id>
   ```

---

**Deployment Checklist:**
- [ ] Install Firebase CLI
- [ ] Login to Firebase
- [ ] Deploy Firestore rules
- [ ] Enable Firebase Storage
- [ ] Test all features
- [ ] Restrict API keys
- [ ] Set up usage monitoring
- [ ] Configure billing alerts
- [ ] Document any custom configurations

**Last Updated**: February 18, 2026
