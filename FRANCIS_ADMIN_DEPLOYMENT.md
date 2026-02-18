# Francis Admin Panel Deployment Guide

This guide explains how to deploy the `francis.html` admin panel to GitHub Pages.

## Overview

The `francis.html` file is a standalone admin panel that provides:
- 🔐 Secure login (restricted to pwavwef@gmail.com)
- 📧 Message viewer for contact form submissions
- 🤖 AI Assistant powered by Google Gemini

## Quick Deployment to GitHub Pages

### Option 1: Access via Direct URL (Simplest)

Once your repository is deployed to GitHub Pages, you can access the admin panel at:

```
https://pwavwef-web.github.io/Francis-Pwavwe/francis.html
```

No additional setup needed! Just navigate to this URL.

### Option 2: Add a Link to Your Main Website

Add a discreet admin link to your `index.html`:

```html
<!-- Add this somewhere in your footer or navigation -->
<a href="francis.html" style="opacity: 0.1;">Admin</a>
```

This creates a nearly invisible link that only you know about.

### Option 3: Create a Dedicated Admin Subdomain

If you have a custom domain, you can create:
```
admin.yourwebsite.com → francis.html
```

Configure this in your DNS settings with your domain provider.

## Security Features

### Authentication
- Firebase Authentication with email/password
- Access restricted to `pwavwef@gmail.com` only
- Automatic logout and redirect for unauthorized users

### Data Protection
- Firestore security rules enforce server-side access control
- XSS protection with HTML escaping
- All user input sanitized before display

### API Keys
The HTML file contains two API keys:

1. **Firebase API Key**: Safe to expose in client code
   - Firebase security rules restrict data access
   - See `firestore.rules` for access control configuration

2. **Gemini API Key**: Currently exposed in client code
   - ⚠️ For production use, consider moving to a backend proxy
   - Current risk is limited since only one authorized user can access the panel

## Accessing the Admin Panel

1. Navigate to `https://pwavwef-web.github.io/Francis-Pwavwe/francis.html`
2. Enter your email: `pwavwef@gmail.com`
3. Enter your Firebase Auth password
4. Click "Sign In"

If you haven't set up a Firebase Auth password yet:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `francis-pwavwe`
3. Go to Authentication → Users
4. Add your email or reset your password

## Features

### Messages Screen
- View all contact form submissions from your website
- Messages are stored in Firestore's `messages` collection
- Click on a message to expand and view full details
- Delete messages you no longer need
- Real-time updates (no refresh needed)

### AI Assistant Screen
- Chat with Gemini AI for:
  - 💰 Financial planning and budgeting
  - 💳 Expense tracking and spending analysis
  - 📊 Budget optimization
  - 📅 Financial goal planning
  - 🥗 Dietary advice and meal planning
  - 🎯 Personal productivity tips
- Chat history is maintained during your session
- Supports multi-line messages
- Press Enter to send, Shift+Enter for new line

## Troubleshooting

### Issue: Stuck on Loading Screen
**Cause**: Firebase scripts are being blocked by ad blocker or privacy extension

**Solution**: 
1. Disable ad blocker for your admin panel URL
2. Or add `https://www.gstatic.com` to your allowed list
3. The page has a 3-second timeout to show login screen even if Firebase is blocked

### Issue: "Access Denied" Error
**Cause**: Trying to login with an email other than pwavwef@gmail.com

**Solution**: Only `pwavwef@gmail.com` can access this panel. This is by design for security.

### Issue: Can't Login with Correct Credentials
**Possible Causes**:
1. Password is incorrect
2. Account not yet created in Firebase Auth

**Solution**:
1. Check your Firebase Console → Authentication → Users
2. Reset password if needed
3. Create user account if it doesn't exist

### Issue: No Messages Showing
**Possible Causes**:
1. No messages have been sent yet from your website's contact form
2. Firestore connection issue

**Solution**:
1. Test by submitting a message from your website's contact form
2. Check Firebase Console → Firestore Database to see if messages are being stored
3. Check browser console for any error messages

### Issue: AI Assistant Not Responding
**Possible Causes**:
1. Gemini API key is invalid or quota exceeded
2. Network connectivity issue

**Solution**:
1. Check the browser console for error messages
2. Verify API key in [Google AI Studio](https://makersuite.google.com/app/apikey)
3. Check API quota and billing settings

## Maintenance

### Updating the Admin Panel

To make changes to the admin panel:

1. Edit `francis.html` in your repository
2. Commit and push changes to GitHub
3. GitHub Pages will automatically update (usually within 1-2 minutes)
4. Clear browser cache and refresh to see changes

### Monitoring Usage

- **Messages**: View in Firebase Console → Firestore Database → messages collection
- **Authentication**: Firebase Console → Authentication → Users
- **AI Usage**: Check Google Cloud Console for Gemini API usage

## Privacy & Data

### What Data is Stored?

**Messages Collection (Firestore)**:
- Name, email, subject, message from contact form
- Timestamp of submission
- No tracking or analytics data

**Authentication**:
- Your email address
- Encrypted password (not accessible even by you)
- Login timestamps

**AI Chat**:
- Chat history is NOT stored
- Conversations are only kept in browser memory during session
- Cleared when you logout or close the browser

### Data Retention

- Messages remain in Firestore until you manually delete them
- You can export or backup messages from Firebase Console
- Consider periodically cleaning old messages for privacy

## Best Practices

1. **Strong Password**: Use a strong, unique password for your Firebase Auth account
2. **Regular Monitoring**: Check messages regularly
3. **Logout**: Always logout when done, especially on shared computers
4. **HTTPS Only**: Only access the admin panel over HTTPS
5. **Bookmark**: Bookmark the direct URL for easy access
6. **Private Browsing**: Consider using incognito/private mode on shared devices

## Support

If you encounter issues not covered in this guide:

1. Check the browser console for error messages (F12)
2. Review Firebase Console for any service disruptions
3. Verify your internet connection
4. Try a different browser

## Technical Details

- **Framework**: Pure HTML/CSS/JavaScript (no dependencies)
- **Firebase SDK**: v10.7.1 (loaded via CDN)
- **AI Model**: Google Gemini Pro
- **File Size**: ~31KB
- **Browser Support**: Modern browsers (Chrome, Firefox, Safari, Edge)
- **Mobile**: Fully responsive, works on phones and tablets

## Comparison with francis.dart

This HTML version provides the same features as the Flutter `francis.dart` application but:

- ✅ No Flutter/Dart dependencies needed
- ✅ No build process required
- ✅ Easier deployment (single file)
- ✅ Works in any browser
- ✅ Faster load times
- ✅ Same security and functionality

The HTML version is recommended for web-only admin panel usage.
