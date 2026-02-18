# Francis Portal - Firebase Deployment Guide

This guide explains how to deploy the Firestore and Storage security rules for the Francis Personal Portal.

## Prerequisites

- Firebase CLI installed (`npm install -g firebase-tools`)
- Firebase project: `francis-pwavwe`
- Authenticated with Firebase CLI (`firebase login`)

## Files Overview

### Firestore Rules (`firestore.rules`)
Defines security rules for all Firestore collections:
- `messages`: Contact form submissions
- `transactions`: Financial tracking data
- `tasks`: Planning and task management
- `blogs`: Blog posts
- `projectFiles`: Project file metadata

### Storage Rules (`storage.rules`)
Defines security rules for Firebase Storage:
- `projects/{userId}/`: User's uploaded project files

## Deployment Steps

### 1. Initialize Firebase (if not already done)

```bash
cd /path/to/Francis-Pwavwe
firebase init
```

Select:
- Firestore
- Storage
- Hosting (if not already configured)

### 2. Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

Expected output:
```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/francis-pwavwe/overview
```

### 3. Deploy Storage Rules

```bash
firebase deploy --only storage:rules
```

Expected output:
```
✔  Deploy complete!
```

### 4. Deploy Everything (Optional)

To deploy all Firebase resources at once:

```bash
firebase deploy
```

This deploys:
- Firestore rules
- Storage rules
- Hosting (your website)

## Verification

### Verify Firestore Rules

1. Go to [Firebase Console](https://console.firebase.google.com/project/francis-pwavwe/firestore/rules)
2. Check that rules are updated
3. Test rules using the Rules Playground

### Verify Storage Rules

1. Go to [Firebase Console](https://console.firebase.google.com/project/francis-pwavwe/storage/rules)
2. Check that rules are updated

### Test Security

**Test 1: Unauthorized Access**
- Try accessing francis.html without logging in
- Should show login screen only

**Test 2: Wrong Email**
- Try logging in with a different email
- Should show "Access denied" error

**Test 3: Correct Login**
- Log in with pwavwef@gmail.com
- Should see full portal dashboard

**Test 4: Data Operations**
- Add a transaction → Should succeed
- Add a task → Should succeed
- Upload a file → Should succeed
- All data should save to Firestore/Storage

## Firebase Configuration

### Project Details
- Project ID: `francis-pwavwe`
- Auth Domain: `francis-pwavwe.firebaseapp.com`
- Storage Bucket: `francis-pwavwe.firebasestorage.app`

### Collections Structure

**messages**
```javascript
{
  name: string,
  email: string,
  subject: string,
  message: string,
  timestamp: timestamp
}
```

**transactions**
```javascript
{
  userId: string,
  type: 'income' | 'expense',
  category: string,
  amount: number,
  description: string,
  date: string (YYYY-MM-DD),
  timestamp: timestamp
}
```

**tasks**
```javascript
{
  userId: string,
  title: string,
  priority: 'low' | 'medium' | 'high',
  dueDate: string (YYYY-MM-DD),
  completed: boolean,
  timestamp: timestamp
}
```

**blogs**
```javascript
{
  userId: string,
  title: string,
  content: string (HTML),
  timestamp: timestamp
}
```

**projectFiles**
```javascript
{
  userId: string,
  name: string,
  size: number,
  type: string,
  url: string,
  path: string,
  timestamp: timestamp
}
```

## Security Rules Explained

### Firestore Rules

**Messages Collection:**
- Anyone can CREATE (for contact form)
- Only pwavwef@gmail.com can READ and DELETE

**Other Collections (transactions, tasks, blogs, projectFiles):**
- Only pwavwef@gmail.com can READ
- Only pwavwef@gmail.com can CREATE (with own userId)
- Only pwavwef@gmail.com can UPDATE/DELETE own documents

**Why this structure?**
- Prevents unauthorized access
- Ensures data integrity (userId validation)
- Allows public contact form submissions
- Protects personal data

### Storage Rules

**projects/{userId}/ folder:**
- Only authenticated user with matching userId can upload
- Only authenticated user with matching userId can download
- Only authenticated user with matching userId can delete

**Why this structure?**
- User-specific file isolation
- Prevents unauthorized file access
- Prevents quota abuse
- Clean folder structure per user

## Monitoring

### Check Usage

```bash
firebase firestore:usage
```

### View Logs

```bash
firebase functions:log
```

### Monitor in Console

1. Firestore Usage: https://console.firebase.google.com/project/francis-pwavwe/firestore/usage
2. Storage Usage: https://console.firebase.google.com/project/francis-pwavwe/storage/usage
3. Authentication: https://console.firebase.google.com/project/francis-pwavwe/authentication/users

## Troubleshooting

### Issue: Permission Denied

**Cause:** Rules not deployed or user not authenticated

**Solution:**
```bash
# Re-deploy rules
firebase deploy --only firestore:rules
firebase deploy --only storage:rules

# Check user is logged in as pwavwef@gmail.com
```

### Issue: Rules Syntax Error

**Cause:** Invalid rules syntax

**Solution:**
1. Check rules file for syntax errors
2. Use Firebase Console Rules Playground to test
3. Check Firebase CLI output for specific errors

### Issue: File Upload Fails

**Cause:** Storage rules not deployed or file too large

**Solution:**
```bash
# Deploy storage rules
firebase deploy --only storage:rules

# Check file size limits (Spark: 5GB total, Blaze: unlimited)
```

### Issue: Cannot Read Data

**Cause:** User not authenticated or wrong userId

**Solution:**
1. Ensure user is logged in
2. Check browser console for errors
3. Verify userId matches current user

## Maintenance

### Regular Tasks

1. **Monitor Usage** (Weekly)
   - Check Firestore read/write counts
   - Check Storage usage
   - Review Authentication logs

2. **Backup Data** (Monthly)
   - Export Firestore collections
   - Download critical files from Storage

3. **Review Security** (Quarterly)
   - Audit access logs
   - Review and update rules if needed
   - Check for unauthorized access attempts

### Updating Rules

When you need to update rules:

1. Edit `firestore.rules` or `storage.rules`
2. Test locally if possible
3. Deploy: `firebase deploy --only firestore:rules` or `firebase deploy --only storage:rules`
4. Verify in Firebase Console
5. Test in application

## Cost Management

### Firebase Spark Plan (Free)
- Firestore: 50K reads/day, 20K writes/day
- Storage: 5GB total, 1GB downloads/day
- Authentication: Unlimited

### Firebase Blaze Plan (Pay as you go)
- Required for external API calls (Gemini AI)
- Firestore: $0.06 per 100K reads
- Storage: $0.026/GB/month
- Set budget alerts in Firebase Console

### Cost Optimization Tips

1. **Minimize Reads**
   - Use real-time listeners efficiently
   - Cache data when possible
   - Limit query results

2. **Optimize Storage**
   - Compress files before upload
   - Delete old/unused files regularly
   - Use appropriate file formats

3. **Monitor API Usage**
   - Track Gemini API calls
   - Set usage limits
   - Implement rate limiting if needed

## Support

If you encounter issues:

1. Check Firebase Console for errors
2. Review browser console logs
3. Test rules in Rules Playground
4. Consult Firebase documentation: https://firebase.google.com/docs

---

**Last Updated:** 2026-02-18  
**Firebase Project:** francis-pwavwe  
**Deployed by:** Francis Pwavwe
