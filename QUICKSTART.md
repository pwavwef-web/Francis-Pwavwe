# Quick Start Guide for Francis Admin Panel

## 🚀 Getting Started in 5 Minutes

### Step 1: Set Up Firebase Authentication
1. Go to https://console.firebase.google.com/
2. Select your project: **francis-pwavwe**
3. Click on **Authentication** in the left menu
4. Click **Get Started** (if not already set up)
5. Click on **Sign-in method** tab
6. Click **Email/Password**
7. Toggle **Enable** 
8. Click **Save**
9. Go to **Users** tab
10. Click **Add user**
11. Email: `pwavwef@gmail.com`
12. Password: Create a strong password (remember it!)
13. Click **Add user**

### Step 2: Set Up Firestore Database
1. In Firebase Console, click **Firestore Database**
2. Click **Create database**
3. Select **Start in production mode**
4. Choose a location (e.g., `us-central`)
5. Click **Enable**
6. Click **Rules** tab
7. Replace the rules with:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /messages/{messageId} {
      allow read, update: if request.auth != null && request.auth.token.email == 'pwavwef@gmail.com';
      allow create: if true;
    }
  }
}
```
8. Click **Publish**

### Step 3: Install Flutter (if not already installed)
```bash
# On macOS
brew install flutter

# On Linux
# Download from https://flutter.dev/docs/get-started/install/linux

# On Windows
# Download from https://flutter.dev/docs/get-started/install/windows
```

Verify installation:
```bash
flutter doctor
```

### Step 4: Run the Admin Panel
```bash
cd /path/to/Francis-Pwavwe
flutter pub get
flutter run -d chrome
```

### Step 5: Log In
1. The app will open in your browser
2. Enter email: `pwavwef@gmail.com`
3. Enter the password you created in Step 1
4. Click **Sign In**

## 📱 Features Overview

### Messages Tab
- See all messages from your website contact form
- Messages appear in real-time
- Click to expand and read full message
- Mark as read/unread
- Reply to messages

### AI Assistant Tab
- Select a category: Finance, Budget, Planning, or Dietary
- Type your question
- Get intelligent responses
- Continue conversations for detailed help

## 🎯 Common Tasks

### Check New Messages
1. Open admin panel
2. Look for blue-highlighted messages (unread)
3. Click to read
4. Mark as read when done

### Use AI for Budget Planning
1. Click **AI Assistant** tab
2. Select **Budget** category
3. Type: "Help me create a monthly budget"
4. Follow the AI's recommendations

### Track Finances
1. Go to **AI Assistant**
2. Select **Finance** category
3. Ask about expense tracking
4. Create categories for your spending

## 🔧 Troubleshooting

### Can't Sign In
- Check you're using `pwavwef@gmail.com`
- Verify password is correct
- Ensure Firebase Authentication is enabled
- Check internet connection

### No Messages Showing
- Verify Firestore is set up
- Check Firestore rules are correct
- Test by submitting a message on your website

### App Won't Run
```bash
flutter clean
flutter pub get
flutter run -d chrome
```

## 📞 Need Help?

If you encounter any issues:
1. Check the full FRANCIS_README.md for detailed documentation
2. Verify all Firebase setup steps are complete
3. Ensure Flutter is properly installed (`flutter doctor`)

---

**You're all set!** 🎉

Your admin panel is ready to use. Start managing your website messages and leverage AI to help with your daily tasks!
