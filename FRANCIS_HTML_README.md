# Francis Admin Panel - HTML Version

This is the HTML/JavaScript version of the Francis Admin Panel, equivalent to the `francis.dart` Flutter application. It can be easily deployed and accessed directly from GitHub Pages.

## Features

### 1. Secure Authentication
- **Restricted Access**: Only pwavwef@gmail.com can log in
- Firebase Authentication integration
- Automatic logout on unauthorized access attempts

### 2. Messages Dashboard
- View all messages from the website contact form in real-time
- Messages are stored in Firebase Firestore
- Each message displays:
  - Sender's name and email
  - Subject line
  - Message content
  - Timestamp
- Delete messages directly from the dashboard
- Expandable card view for easy reading

### 3. AI Personal Assistant
- Powered by Google's Gemini AI
- Specialized assistance for:
  - 💰 **Financial Planning**: Budget creation, expense tracking, savings goals
  - 💳 **Spending Management**: Analyze spending patterns and optimize expenses
  - 📊 **Budget Optimization**: Smart recommendations for better financial health
  - 🥗 **Dietary Advice**: Meal planning, nutrition tips, healthy eating on a budget
  - 📅 **Personal Planning**: Goal setting, time management, productivity tips
- Real-time chat interface with message history
- Context-aware responses tailored to your needs

## Deployment

### GitHub Pages Deployment

The `francis.html` file can be deployed directly on GitHub Pages:

1. **Access via direct URL**:
   ```
   https://pwavwef-web.github.io/Francis-Pwavwe/francis.html
   ```

2. **Or set as a separate admin subdomain** (optional):
   - Create a new branch called `gh-pages-admin`
   - Copy `francis.html` to `index.html` in that branch
   - Configure GitHub Pages to use that branch
   - Access at: `https://pwavwef-web.github.io/Francis-Pwavwe/admin/`

### Local Testing

To test locally:

1. **Simple HTTP Server (Python)**:
   ```bash
   python3 -m http.server 8000
   ```
   Then open: `http://localhost:8000/francis.html`

2. **Node.js HTTP Server**:
   ```bash
   npx http-server
   ```
   Then open: `http://localhost:8080/francis.html`

3. **VS Code Live Server**:
   - Install "Live Server" extension
   - Right-click on `francis.html` → "Open with Live Server"

## Usage

### Logging In

1. Open `francis.html` in your browser
2. Enter email: `pwavwef@gmail.com`
3. Enter your Firebase password
4. Click "Sign In"

**Note**: Any other email address will be rejected with "Access denied" message.

### Viewing Messages

1. After logging in, you'll see the Messages screen by default
2. Messages are listed in chronological order (newest first)
3. Click on a message card to expand and read the full content
4. Use the "Delete" button to remove messages
5. Messages sync in real-time - new submissions appear automatically

### Using the AI Assistant

1. Click on "AI Assistant" in the navigation rail
2. Type your question or request in the text field
3. Press Enter or click the Send button (➤)
4. The AI will respond with personalized advice

**Example prompts:**
- "Help me create a monthly budget for a university student"
- "I spend too much on food. How can I save money?"
- "Suggest a healthy meal plan for this week under $50"
- "How should I allocate my savings between emergency fund and investments?"
- "What are some good financial goals for a 20-year-old?"

## Technical Details

### Architecture
- **Frontend**: Pure HTML/CSS/JavaScript (no build step required)
- **Authentication**: Firebase Authentication
- **Database**: Firebase Firestore
- **AI**: Google Gemini API

### Firebase Configuration
The app uses the same Firebase configuration as the main website:
- Project: `francis-pwavwe`
- Auth Domain: `francis-pwavwe.firebaseapp.com`
- Firestore collection: `messages`

### Security
- Email validation ensures only `pwavwef@gmail.com` can access
- Firebase security rules protect the Firestore database
- Authentication required for all operations

### Browser Compatibility
Works on all modern browsers:
- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

**Requirements**: JavaScript must be enabled

## Advantages Over Flutter Version

1. **No Installation**: Works directly in browser
2. **No Build Required**: Just open the HTML file
3. **Easy Deployment**: Works on any static hosting (GitHub Pages, Netlify, Vercel, etc.)
4. **Cross-Platform**: Works on any device with a browser
5. **Instant Updates**: Changes take effect immediately without rebuilding

## Comparison with francis.dart

| Feature | francis.html | francis.dart |
|---------|-------------|--------------|
| Authentication | ✅ | ✅ |
| Messages Dashboard | ✅ | ✅ |
| AI Assistant | ✅ | ✅ |
| Real-time Updates | ✅ | ✅ |
| Delete Messages | ✅ | ✅ |
| No Installation | ✅ | ❌ |
| Works Offline | ❌ | ✅ |
| Native Performance | ❌ | ✅ |
| Mobile App | ❌ | ✅ |

## Troubleshooting

### Issue: "Firebase not initialized"
**Solution**: Ensure you have an internet connection and Firebase configuration is correct.

### Issue: "Unable to sign in"
**Solution**: 
- Verify pwavwef@gmail.com account exists in Firebase Authentication
- Check password is correct
- Ensure Email/Password authentication is enabled in Firebase Console

### Issue: "No messages appearing"
**Solution**:
- Check Firestore database has a `messages` collection
- Verify security rules allow reads for authenticated admin
- Test submitting a message through the website contact form

### Issue: "AI Assistant not responding"
**Solution**:
- Verify Gemini API key is valid
- Check internet connection
- Ensure you haven't exceeded API rate limits
- Check browser console for errors

### Issue: "CORS errors in console"
**Solution**: 
- Don't open the HTML file directly (file://)
- Use a local web server (see "Local Testing" above)
- For production, deploy to GitHub Pages or similar hosting

## Security Considerations

⚠️ **IMPORTANT SECURITY NOTICE**:

1. **API Keys Exposure**: 
   - Both Firebase and Gemini API keys are visible in the client-side HTML file
   - This is **normal for Firebase** web apps but requires proper configuration:
     - **MUST restrict Firebase API key** in Google Cloud Console to authorized domains
     - **MUST configure Firestore security rules** to prevent unauthorized access
     - **MUST monitor Gemini API usage** to prevent quota abuse
   
2. **Firebase API Key Protection**:
   - Go to Google Cloud Console → APIs & Services → Credentials
   - Edit your Firebase API key
   - Restrict to HTTP referrers (your GitHub Pages domain)
   - Restrict to only Firebase APIs (Auth, Firestore)
   - See `DEPLOYMENT_FRANCIS.md` for detailed steps

3. **Gemini API Key Protection**:
   - ⚠️ **WARNING**: The key is publicly accessible, allowing anyone to use your quota
   - This is acceptable for **personal use only** with quota monitoring
   - Set up billing alerts in Google AI Studio
   - Monitor usage regularly
   - For production, implement a backend proxy or Cloud Function
   - See `DEPLOYMENT_FRANCIS.md` for detailed recommendations

4. **Authentication**: 
   - Only pwavwef@gmail.com can access the panel
   - Firebase handles secure password authentication
   - Sessions expire automatically
   - Additional email validation in code prevents other users

5. **Data Access**:
   - All database operations require authentication
   - Firestore rules prevent unauthorized access
   - Messages can only be viewed/deleted by the authenticated admin
   - Contact form can create messages (public endpoint)

## Support

For issues or questions:
- Email: pwavwef@gmail.com
- Check Firebase Console for backend issues
- Review browser console for client-side errors

---

**Built with Firebase & Gemini AI**  
© 2026 Francis Pwavwe
