# Quick Start Guide - Francis Admin Panel

## What is This?

This is a private admin panel **exclusively for Francis Pwavwe** to:
1. 📨 View messages from website visitors
2. 🤖 Chat with an AI assistant for personal finance, budgeting, and life planning

## Quick Setup (5 minutes)

### Step 1: Set Up Firebase Account
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. The project "francis-pwavwe" should already exist
3. Create your admin account:
   - Go to **Authentication** → **Users** → **Add User**
   - Email: `pwavwef@gmail.com`
   - Set a strong password (save it!)

### Step 2: Enable Firestore
1. In Firebase Console, go to **Firestore Database**
2. Click **Create database**
3. Select **Start in production mode**
4. Choose location: `us-central` (or nearest to Ghana)
5. Click **Enable**

### Step 3: Set Up Security Rules
1. In Firestore, go to **Rules** tab
2. Copy the contents from `firestore.rules` file in this project
3. Click **Publish**

### Step 4: Get Gemini API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click **Create API Key**
3. Copy the key (starts with "AIza...")
4. Open `francis.dart` and find this line (around line 455):
   ```dart
   apiKey: 'YOUR_GEMINI_API_KEY_HERE',
   ```
5. Replace with your actual key:
   ```dart
   apiKey: 'AIzaSy...your-actual-key...',
   ```

### Step 5: Install Flutter (if not already installed)

**On macOS:**
```bash
# Install Flutter
git clone https://github.com/flutter/flutter.git -b stable
export PATH="$PATH:`pwd`/flutter/bin"
flutter doctor
```

**On Windows:**
1. Download [Flutter SDK](https://docs.flutter.dev/get-started/install/windows)
2. Extract to `C:\flutter`
3. Add to PATH: `C:\flutter\bin`

**On Linux:**
```bash
snap install flutter --classic
flutter doctor
```

### Step 6: Run the App
```bash
cd /path/to/Francis-Pwavwe
flutter pub get
flutter run -d chrome  # Run in web browser
```

## Using the Admin Panel

### Login
- Email: `pwavwef@gmail.com`
- Password: (the one you set in Firebase)

### View Messages
- Click **Messages** tab
- See all website contact form submissions
- Click a message to expand
- Click Delete to remove

### Use AI Assistant
- Click **AI Assistant** tab
- Type questions like:
  - "Create a monthly budget for me"
  - "How can I save money on groceries?"
  - "Plan healthy meals for this week"
  - "What are good investment options for students?"

## Updating the Website

The website (`index.html`) now automatically saves contact form messages to Firebase!

**To deploy the website update:**
```bash
# If using GitHub Pages, just push to main branch
git push origin main

# Or use Firebase Hosting
firebase deploy --only hosting
```

## Testing

### Test the Contact Form:
1. Open your website: https://pwavwef-web.github.io/Francis-Pwavwe/
2. Scroll to Contact section
3. Fill out and submit the form
4. Check the admin panel - message should appear!

### Test the AI Assistant:
1. Login to admin panel
2. Go to AI Assistant
3. Ask: "Help me budget $500 for this month"
4. AI should respond with budget suggestions

## Troubleshooting

**Problem**: Can't log in
- Check email is exactly `pwavwef@gmail.com`
- Verify password in Firebase Console → Authentication
- Make sure Authentication is enabled

**Problem**: Messages not showing
- Check Firestore rules are published
- Verify `messages` collection exists (created automatically on first message)
- Try submitting a test message from website

**Problem**: AI not responding
- Verify Gemini API key is correct in `francis.dart`
- Check internet connection
- Make sure API key is active in Google AI Studio

## Cost Estimate

**Firebase (Free Tier includes):**
- 50,000 reads/day
- 20,000 writes/day
- 1GB storage
- Should be **free** for personal use!

**Gemini AI (Free Tier includes):**
- 60 requests per minute
- Should be **free** for personal use!

## Security Notes

✅ Only you (pwavwef@gmail.com) can access the admin panel  
✅ Firebase Authentication protects all data  
✅ Firestore rules prevent unauthorized access  
✅ All communication is encrypted (HTTPS)

## Next Steps

1. ✅ Set up Firebase account
2. ✅ Deploy the updated website
3. ✅ Install and run the admin panel
4. ✅ Test both features
5. 🎉 Start managing messages and getting AI assistance!

---

Need help? Email yourself at pwavwef@gmail.com 😄

**Enjoy your new admin panel!** 🚀
