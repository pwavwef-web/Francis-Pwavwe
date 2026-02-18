# Francis Admin Panel - Setup Guide

This Flutter application provides a secure admin panel exclusively for Francis Pwavwe (pwavwef@gmail.com) to:
- View messages submitted through the website contact form
- Access an AI-powered personal assistant for finance, budgeting, dietary advice, and planning

## Features

### 1. Secure Authentication
- **Restricted Access**: Only pwavwef@gmail.com can log in
- Firebase Authentication integration
- Automatic logout on unauthorized access attempts

### 2. Messages Dashboard
- View all messages from the website contact form in real-time
- Messages are stored in Firebase Firestore
- Each message includes:
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

## Prerequisites

Before running this application, ensure you have:

1. **Flutter SDK** (version 3.0.0 or higher)
   ```bash
   flutter --version
   ```

2. **Firebase Project** already set up with:
   - Firebase Authentication enabled
   - Cloud Firestore database created
   - pwavwef@gmail.com user account created in Firebase Authentication

3. **Google Gemini API Key** for AI assistant functionality

## Installation Steps

### 1. Clone the Repository

```bash
cd /path/to/Francis-Pwavwe
```

### 2. Install Flutter Dependencies

```bash
flutter pub get
```

### 3. Configure Gemini API Key

Edit `francis.dart` and replace `YOUR_GEMINI_API_KEY_HERE` with your actual Gemini API key:

```dart
_model = GenerativeModel(
  model: 'gemini-pro',
  apiKey: 'YOUR_ACTUAL_GEMINI_API_KEY', // Replace this
);
```

**To get a Gemini API key:**
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy and paste it into the code

### 4. Firebase Setup

The Firebase configuration is already included in the code. However, ensure:

1. **Firestore Database** is created:
   - Go to Firebase Console → Firestore Database
   - Create database (start in production mode or test mode)
   - The `messages` collection will be created automatically when the first message is submitted

2. **Authentication is enabled**:
   - Go to Firebase Console → Authentication
   - Enable Email/Password authentication
   - Create a user account with email: pwavwef@gmail.com

3. **Firestore Security Rules** (Important!):
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Messages collection - read/write only for authenticated admin
       match /messages/{messageId} {
         allow read, write: if request.auth != null && request.auth.token.email == 'pwavwef@gmail.com';
       }
       
       // Public write for website contact form
       match /messages/{messageId} {
         allow create: if request.resource.data.keys().hasAll(['name', 'email', 'subject', 'message', 'timestamp']);
       }
     }
   }
   ```

### 5. Run the Application

```bash
flutter run -d chrome  # For web
# OR
flutter run -d macos   # For macOS
# OR
flutter run -d windows # For Windows
```

## Website Integration

The website contact form (`index.html`) has been updated to automatically save messages to Firebase Firestore. When users submit the contact form:

1. Message is saved to Firestore's `messages` collection
2. Success notification is displayed
3. You can view the message immediately in the admin panel

## Usage

### Logging In

1. Launch the Francis Admin Panel application
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
3. Press Enter or click the Send button
4. The AI will respond with personalized advice

**Example prompts:**
- "Help me create a monthly budget for a university student"
- "I spend too much on food. How can I save money?"
- "Suggest a healthy meal plan for this week under $50"
- "How should I allocate my savings between emergency fund and investments?"
- "What are some good financial goals for a 20-year-old?"

## Project Structure

```
Francis-Pwavwe/
├── francis.dart          # Main Flutter application
├── pubspec.yaml         # Flutter dependencies
├── index.html           # Website with contact form
├── script.js            # Website JavaScript (includes Firebase integration)
├── firebase-config.js   # Firebase configuration for web
└── README_FRANCIS.md    # This file
```

## Security Considerations

1. **Email Restriction**: Hardcoded check ensures only pwavwef@gmail.com can access
2. **Firebase Authentication**: All operations require authenticated user
3. **Firestore Rules**: Database rules prevent unauthorized access
4. **API Key**: Keep your Gemini API key secure (consider using environment variables in production)

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
- Verify Gemini API key is valid and correctly entered
- Check internet connection
- Ensure you haven't exceeded API rate limits

## Development Notes

### Adding New Features

The app is modular and can be easily extended:

- **New AI Capabilities**: Edit the prompt in `_AIAssistantScreenState._sendMessage()`
- **Additional Dashboard Tabs**: Add new `NavigationRailDestination` and corresponding screens
- **Message Filters**: Implement filtering in `MessagesScreen` StreamBuilder

### Testing

```bash
flutter test
```

### Building for Production

**Web:**
```bash
flutter build web
```

**macOS:**
```bash
flutter build macos
```

**Windows:**
```bash
flutter build windows
```

## Support

For issues or questions:
- Email: pwavwef@gmail.com
- Check Firebase Console for backend issues
- Review Flutter and Firebase documentation

## Future Enhancements

Potential features to add:
- [ ] Message search and filtering
- [ ] Email notifications for new messages
- [ ] Export messages to CSV/PDF
- [ ] Advanced AI features (expense tracking, receipt scanning)
- [ ] Calendar integration for planning
- [ ] Data visualization for spending patterns
- [ ] Mobile app version (iOS/Android)

---

**Built with Flutter & Firebase**  
© 2026 Francis Pwavwe
