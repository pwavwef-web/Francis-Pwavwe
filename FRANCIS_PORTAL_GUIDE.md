# Francis Personal Portal - User Guide

## Overview

The Francis Personal Portal is a comprehensive web-based application designed to help you manage your personal finances, plan tasks and goals, write and publish blogs, and organize project files. All data is securely stored in Firebase with authentication required for access.

## Features

### 🔐 Secure Authentication
- Restricted access for Francis Pwavwe only (pwavwef@gmail.com)
- Firebase Authentication integration
- Automatic session management

### 📊 Dashboard
- Quick overview of all portal activities
- Statistics for transactions, tasks, blogs, and projects
- Welcome screen with recent activity

### 💰 Finances Management

Track and manage your finances with powerful tools:

#### Features:
- **Wallet Balance Tracker**: Real-time balance calculation based on income and expenses
- **Daily Spending Monitor**: Track how much you've spent today
- **Monthly Budget Display**: Set and monitor your monthly budget
- **Transaction Log**: Detailed record of all financial activities
- **Category Tracking**: Organize spending by categories:
  - Food
  - Airtime
  - Transport
  - Education
  - Entertainment
  - Shopping
  - Bills
  - Other
- **Visual Analytics**: Interactive pie chart showing spending breakdown by category
- **AI Financial Advisor**: Get personalized advice on budgeting, saving, and spending

#### How to Use:
1. Click on the **Finances** tab in the navigation
2. View your current wallet balance, today's spending, and monthly budget at the top
3. Click **+ Add Transaction** to log a new transaction
4. Fill in the amount, category, description, and type (income/expense)
5. View all transactions in the Recent Transactions panel
6. Check the pie chart for visual breakdown of spending
7. Use the AI Financial Advisor chatbot for personalized financial advice

### 📅 Planning & Tasks

Stay organized with intelligent task management:

#### Features:
- **Task Management**: Create, view, and delete tasks
- **Goal Setting**: Set and track personal goals
- **Priority Levels**: Categorize tasks as high, medium, or low priority
- **Due Dates**: Set deadlines for tasks
- **AI Planning Assistant**: Get help with time management and goal planning

#### How to Use:
1. Navigate to the **Planning** tab
2. Click **+ Add Task** to create a new task
3. Enter task title, description, priority level, and due date
4. View all tasks in a organized table format
5. Delete completed tasks when done
6. Chat with the AI Planning Assistant for productivity tips and planning advice

### 📝 Blogs

Write and publish blog posts with rich formatting:

#### Features:
- **Rich Text Editor**: Full-featured editor with formatting options
- **Text Formatting**: Bold, italic, underline, and more
- **Lists**: Create bulleted and numbered lists
- **Links**: Insert hyperlinks to external resources
- **Images**: Add images via URL
- **Font Sizes**: Adjust text size (Small, Normal, Large, Huge)
- **Edit & Delete**: Modify or remove published blogs
- **Timestamp**: Automatic date tracking for all posts

#### How to Use:
1. Go to the **Blogs** tab
2. Click **+ Write New Blog** to open the editor
3. Enter a blog title
4. Use the toolbar to format your content:
   - **B** for bold text
   - **I** for italic text
   - **U** for underline
   - **• List** for bullet points
   - **1. List** for numbered lists
   - **🔗 Link** to insert hyperlinks
   - **🖼️ Image** to add images
   - Font Size dropdown to adjust text size
5. Click **Publish Blog** to save
6. Click **Cancel** to discard changes
7. Edit or delete existing blogs using the action buttons

### 📁 Projects

Upload, organize, and retrieve project files:

#### Features:
- **File Upload**: Upload multiple files per project
- **Cloud Storage**: All files stored securely in Firebase Storage
- **Project Organization**: Group related files by project
- **Download Capability**: Retrieve files anytime, anywhere
- **Project Metadata**: Add names and descriptions to projects

#### How to Use:
1. Navigate to the **Projects** tab
2. Enter a project name and description
3. Click the upload area to select files (multiple files supported)
4. Review selected files
5. Click **Upload Project** to save to the cloud
6. View all projects in the My Projects section
7. Click **Download** to retrieve project files
8. Click **Delete** to remove a project and its files

### 📧 Messages

View and manage contact form submissions from your main website:

#### Features:
- Real-time message notifications
- Message details (name, email, subject, message, timestamp)
- Delete unwanted messages

#### How to Use:
1. Go to the **Messages** tab
2. View all messages from your website contact form
3. Click **Delete** to remove messages

## Technical Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Firebase (Firestore, Storage, Authentication)
- **Charts**: Chart.js for data visualization
- **AI**: Google Gemini API for intelligent assistance
- **No Build Required**: Direct deployment to any static hosting

## Deployment

### Firebase Setup

1. **Update Firestore Rules**:
   Deploy the updated `firestore.rules` file to Firebase:
   ```bash
   firebase deploy --only firestore:rules
   ```

2. **Enable Firebase Storage**:
   - Go to Firebase Console → Storage
   - Enable Firebase Storage for the project
   - Storage rules are automatically configured for authenticated access

### GitHub Pages Deployment

The portal can be accessed at:
```
https://pwavwef-web.github.io/Francis-Pwavwe/francis.html
```

Or set as the main admin page by configuring routes.

### Local Testing

To test locally:
```bash
# Using Python
python3 -m http.server 8000

# Using Node.js
npx http-server

# Using VS Code Live Server
# Install "Live Server" extension and right-click francis.html
```

Then open: `http://localhost:8000/francis.html`

## Security

### Authentication
- Only the email `pwavwef@gmail.com` can access the portal
- All other emails are automatically rejected
- Firebase handles secure password authentication

### Data Protection
- All database operations require authentication
- Firestore rules restrict access to authenticated admin only
- Each collection (transactions, tasks, blogs, projects, messages) has specific security rules

### API Keys
⚠️ **Important Security Notes**:

1. **Firebase API Key**:
   - Visible in client code (normal for Firebase web apps)
   - Must be restricted in Google Cloud Console to authorized domains
   - See `DEPLOYMENT_FRANCIS.md` for detailed steps

2. **Gemini AI API Key**:
   - Currently using direct API calls (suitable for personal use only)
   - Monitor usage in Google AI Studio
   - Set up billing alerts to prevent abuse
   - For production, consider implementing a backend proxy

## Data Structure

### Firestore Collections

**transactions**:
```json
{
  "amount": 50.00,
  "category": "Food",
  "description": "Lunch at cafeteria",
  "type": "expense",
  "timestamp": "2026-02-18T20:00:00Z"
}
```

**tasks**:
```json
{
  "title": "Complete project proposal",
  "description": "Write detailed proposal for AZ Learner expansion",
  "priority": "high",
  "dueDate": "2026-03-01",
  "completed": false,
  "timestamp": "2026-02-18T20:00:00Z"
}
```

**blogs**:
```json
{
  "title": "My Journey in Tourism Management",
  "content": "<p>Rich HTML content...</p>",
  "timestamp": "2026-02-18T20:00:00Z",
  "updatedAt": "2026-02-19T10:00:00Z"
}
```

**projects**:
```json
{
  "name": "AZ Learner Marketing Materials",
  "description": "Branding and marketing documents",
  "files": ["https://storage.googleapis.com/..."],
  "fileNames": ["logo.png", "brochure.pdf"],
  "timestamp": "2026-02-18T20:00:00Z"
}
```

**messages**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Collaboration Opportunity",
  "message": "I would like to discuss...",
  "timestamp": "2026-02-18T20:00:00Z"
}
```

## AI Assistants

The portal includes two specialized AI assistants powered by Google Gemini:

### Financial Advisor
- Provides budgeting advice
- Analyzes spending patterns
- Suggests savings strategies
- Helps with financial goal setting
- Offers personalized recommendations based on student/young professional context

### Planning Assistant
- Helps with task prioritization
- Suggests time management strategies
- Assists with goal setting
- Provides productivity tips
- Offers planning advice for academic and career goals

## Tips & Best Practices

### Finances
- Log transactions daily for accurate tracking
- Review the spending pie chart weekly
- Set realistic monthly budgets
- Use specific categories for better insights
- Consult the AI advisor when making major financial decisions

### Planning
- Set clear, actionable task titles
- Use priority levels to focus on what matters
- Set realistic due dates
- Review and update tasks regularly
- Break large goals into smaller tasks

### Blogs
- Save drafts frequently (publish early, edit later)
- Use headings and lists for readability
- Add images to make posts engaging
- Include links to relevant resources
- Review posts before publishing

### Projects
- Use descriptive project names
- Group related files together
- Add detailed descriptions for future reference
- Backup important projects locally as well
- Organize files logically before uploading

## Troubleshooting

### Cannot Sign In
- Verify you're using pwavwef@gmail.com
- Check your password is correct
- Ensure Firebase Authentication is enabled
- Clear browser cache and try again

### Transactions Not Appearing
- Check internet connection
- Verify Firestore rules are deployed
- Refresh the page
- Check browser console for errors

### Pie Chart Not Showing
- Ensure Chart.js is loading (check console)
- Add at least one expense transaction
- Refresh the page

### File Upload Failing
- Verify Firebase Storage is enabled
- Check file size (large files may take time)
- Ensure stable internet connection
- Try uploading one file at a time

### AI Assistant Not Responding
- Check internet connection
- Verify Gemini API key is valid
- Check API quota hasn't been exceeded
- Look for errors in browser console

## Browser Compatibility

Works on all modern browsers:
- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Opera

**Requirements**: JavaScript must be enabled

## Support

For issues, questions, or feature requests:
- Email: pwavwef@gmail.com
- Check Firebase Console for backend issues
- Review browser console for client-side errors

## Future Enhancements

Potential features for future releases:
- Budget goal setting and tracking
- Recurring transaction support
- Task completion tracking and statistics
- Blog categories and tags
- Project collaboration features
- Export functionality for financial reports
- Calendar view for tasks
- Mobile app version
- Offline support

---

**Built with Firebase, Chart.js, and Gemini AI**  
© 2026 Francis Pwavwe - Personal Portal v2.0
