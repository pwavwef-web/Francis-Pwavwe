# Francis Admin Panel

A Flutter-based admin dashboard exclusively for Francis Pwavwe (pwavwef@gmail.com) to manage website messages and access an AI-powered personal assistant.

## Features

### 🔐 Secure Authentication
- **Restricted Access**: Only pwavwef@gmail.com can access the admin panel
- Firebase Authentication integration
- Automatic session management

### 📧 Message Management
- View all messages submitted through the website contact form
- Real-time updates using Firebase Firestore
- Mark messages as read/unread
- See message timestamps and sender information
- Quick reply functionality

### 🤖 AI Personal Assistant
Integrated AI assistant to help with:
- **💰 Finance Management**: Track income, expenses, and financial goals
- **💵 Budget & Spending**: Create and manage budgets using the 50/30/20 rule
- **📅 Planning**: Organize academic tasks, AZ Learner activities, and personal goals
- **🥗 Dietary Advice**: Get personalized nutrition and meal planning suggestions

## Setup Instructions

### Prerequisites
- Flutter SDK (>=3.0.0)
- Firebase account
- The Firebase project is already configured with the provided credentials

### Installation

1. **Clone the repository** (if not already done):
   ```bash
   git clone https://github.com/pwavwef-web/Francis-Pwavwe.git
   cd Francis-Pwavwe
   ```

2. **Install Flutter dependencies**:
   ```bash
   flutter pub get
   ```

3. **Set up Firebase Authentication**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project: `francis-pwavwe`
   - Navigate to Authentication > Sign-in method
   - Enable Email/Password authentication
   - Add a user with email: `pwavwef@gmail.com` and set a strong password

4. **Set up Firestore Database**:
   - In Firebase Console, go to Firestore Database
   - Create database in production mode
   - Set up the following security rules:

   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Messages collection - anyone can write, only authenticated user can read
       match /messages/{messageId} {
         allow read, update: if request.auth != null && request.auth.token.email == 'pwavwef@gmail.com';
         allow create: if true;
       }
     }
   }
   ```

5. **Run the Flutter app**:
   ```bash
   flutter run -d chrome
   ```
   Or for mobile:
   ```bash
   flutter run -d <device-name>
   ```

## Project Structure

```
Francis-Pwavwe/
├── francis.dart          # Main Flutter admin application
├── pubspec.yaml         # Flutter dependencies
├── index.html           # Main website (with Firebase integration)
├── script.js            # Website scripts (updated to save messages to Firestore)
├── styles.css           # Website styles
└── FRANCIS_README.md    # This file
```

## How It Works

### Website Integration
1. Visitors fill out the contact form on the website
2. Form submissions are saved to Firebase Firestore in the `messages` collection
3. Messages include: name, email, subject, message, timestamp, and read status

### Admin Panel
1. Francis logs in with pwavwef@gmail.com credentials
2. Dashboard shows two main sections:
   - **Messages**: Real-time view of all contact form submissions
   - **AI Assistant**: Interactive AI helper for personal management

### AI Assistant Categories
- **Finance**: Track and analyze financial transactions
- **Budget**: Create and manage budgets with smart recommendations
- **Planning**: Organize tasks and set goals across different areas
- **Dietary**: Get nutrition advice and meal planning help

## Usage Examples

### Viewing Messages
1. Log in to the admin panel
2. Navigate to the "Messages" tab
3. Click on any message to expand and view details
4. Mark messages as read/unread
5. Use the reply button to respond via email

### Using AI Assistant
1. Navigate to the "AI Assistant" tab
2. Select a category (Finance, Budget, Planning, or Dietary)
3. Type your question or request
4. Get intelligent responses tailored to your needs
5. Continue the conversation for more detailed assistance

## Security Notes

- Only pwavwef@gmail.com can access the admin panel
- All data is stored securely in Firebase Firestore
- Authentication is handled by Firebase Auth
- Website visitors can submit messages without authentication
- Messages are transmitted securely over HTTPS

## Firebase Configuration

The app uses the following Firebase configuration:
```dart
apiKey: "AIzaSyB6lxgjNY4CRNHAe3pAgR5SYv1ohL8brOI"
authDomain: "francis-pwavwe.firebaseapp.com"
projectId: "francis-pwavwe"
storageBucket: "francis-pwavwe.firebasestorage.app"
messagingSenderId: "658069378543"
appId: "1:658069378543:web:87b1dcb0dd27d3255bd21a"
```

## Deployment

### Web Deployment
```bash
flutter build web
# Deploy the build/web directory to your hosting provider
```

### Mobile Deployment
```bash
# Android
flutter build apk

# iOS
flutter build ios
```

## Support

For issues or questions, contact Francis Pwavwe at pwavwef@gmail.com

## License

© 2026 Francis Pwavwe. All rights reserved.
