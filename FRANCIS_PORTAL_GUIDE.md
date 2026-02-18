# Francis Personal Portal - Complete Guide

A comprehensive personal management portal featuring finances, planning, blogs, projects, and AI assistance.

## 🚀 Features

### 1. Dashboard
- **Overview Statistics**: Quick view of expenses, budget, tasks, and blog posts
- **Quick Actions**: Fast access to common tasks across all modules
- **Real-time Updates**: All stats update automatically

### 2. 💰 Finances
Track your money like a pro!

**Features:**
- **Income & Expense Tracking**: Log all transactions with categories
- **Categories**: Food, Airtime, Transport, Education, Entertainment, Health, Utilities, Other
- **Budget Management**: Set monthly budgets and track remaining balance
- **Visual Analytics**: Pie chart showing spending breakdown by category
- **Statistics Dashboard**:
  - Total Income
  - Total Expenses
  - Budget Remaining
  - Net Balance
- **Transaction History**: View all transactions with dates and descriptions
- **AI Financial Advisor**: Get personalized advice on spending and budgeting

**How to Use:**
1. Navigate to the Finances tab
2. Select transaction type (Income/Expense)
3. Choose category
4. Enter amount in GH₵
5. Add description and date
6. Click "Add Transaction"
7. View your spending visualized in the pie chart
8. Click "Get Advice" for AI-powered financial recommendations

### 3. 📝 Planning
Stay organized and productive!

**Features:**
- **Task Management**: Create, track, and complete tasks
- **Priority Levels**: High, Medium, Low priority tasks
- **Due Dates**: Never miss a deadline
- **Task Completion**: Check off completed tasks
- **Task Deletion**: Remove unnecessary tasks
- **AI Planning Advisor**: Get advice on task prioritization and time management

**How to Use:**
1. Navigate to the Planning tab
2. Enter task title
3. Select priority level
4. Set due date
5. Click "Add Task"
6. Check the checkbox to mark tasks as complete
7. Click "Get Advice" for AI planning recommendations

### 4. ✍️ Blogs
Share your thoughts and ideas!

**Features:**
- **Rich Text Editor**: Full-featured text formatting
- **Text Formatting**:
  - Bold, Italic, Underline
  - Headings (H1, H2, H3)
  - Ordered and unordered lists
- **Media Support**:
  - Insert images via URL
  - Add hyperlinks
- **Blog Publishing**: Publish and view all your blog posts
- **Blog Management**: Delete old posts

**How to Use:**
1. Navigate to the Blogs tab
2. Enter blog title
3. Use the formatting toolbar to style your content
4. Click formatting buttons (B, I, U) for text styles
5. Select heading levels from dropdown
6. Click link icon to add hyperlinks
7. Click image icon to insert images (enter image URL)
8. Click "Publish Blog Post" when done
9. View all published blogs below the editor

**Toolbar Guide:**
- **B**: Bold text
- **I**: Italic text
- **U**: Underline text
- **1. List**: Numbered list
- **• List**: Bullet list
- **🔗 Link**: Insert hyperlink
- **🖼️ Image**: Insert image
- **Heading**: Select heading level (H1-H3)

### 5. 📁 Projects
Upload and manage your project files!

**Features:**
- **File Upload**: Drag-and-drop or click to upload
- **Multiple Files**: Upload multiple files at once
- **Supported Formats**:
  - Documents: PDF, DOC, DOCX
  - Spreadsheets: XLS, XLSX
  - Presentations: PPT, PPTX
  - Archives: ZIP
  - Images: JPG, PNG, GIF, etc.
- **File Management**:
  - View all uploaded files
  - Download files anytime
  - Delete unwanted files
- **File Information**: See file name and size
- **Cloud Storage**: Files stored securely in Firebase Storage

**How to Use:**
1. Navigate to the Projects tab
2. Drag files onto the upload area OR click to browse
3. Select one or multiple files
4. Files upload automatically
5. View all files in "My Files" section
6. Click "Download" to retrieve a file
7. Click "Delete" to remove a file

### 6. 📧 Messages
View contact form submissions from your website!

**Features:**
- **Message Inbox**: All messages from website contact form
- **Message Details**: Name, email, subject, message content, timestamp
- **Message Management**: Delete read messages
- **Real-time Sync**: New messages appear automatically

**How to Use:**
1. Navigate to the Messages tab
2. View all messages from your website
3. Click "Delete" to remove a message

### 7. 🤖 AI Assistant
Your personal AI advisor!

**Features:**
- **General AI Chat**: Ask anything
- **Context-Aware**: Remembers conversation history
- **Specialized Advice**: Finances, planning, productivity, and more
- **Real-time Responses**: Powered by Google Gemini AI

**How to Use:**
1. Navigate to the AI Assistant tab
2. Type your question or request
3. Press Enter or click "Send"
4. Receive personalized AI responses

**Example Questions:**
- "How can I save more money this month?"
- "Help me prioritize my tasks"
- "Suggest a budget for a student"
- "What are some productivity tips?"

## 🔐 Security

**Authentication:**
- Email/Password authentication via Firebase
- Access restricted to pwavwef@gmail.com only
- Automatic logout for unauthorized users

**Data Security:**
- All data stored in Firebase Firestore
- User-specific data isolation (userId validation)
- Secure file storage in Firebase Storage
- Firestore security rules enforce access control

**Privacy:**
- Only you can access your data
- Messages from contact form are separate from personal data
- AI conversations are not stored permanently

## 🛠️ Technical Details

**Frontend:**
- Pure HTML/CSS/JavaScript (no build required)
- Chart.js for data visualization
- Responsive design for mobile and desktop

**Backend:**
- Firebase Authentication
- Firebase Firestore (Database)
- Firebase Storage (File storage)
- Google Gemini AI (AI assistance)

**Firebase Collections:**
- `messages`: Contact form submissions
- `transactions`: Financial transactions
- `tasks`: Planning tasks
- `blogs`: Blog posts
- `projectFiles`: Project file metadata

**Firebase Storage:**
- `projects/{userId}/`: User's project files

## 📱 Access

**URL:**
```
https://pwavwef-web.github.io/Francis-Pwavwe/francis.html
```

**Login:**
- Email: pwavwef@gmail.com
- Password: [Your Firebase password]

## 🚀 Deployment

The portal is automatically deployed via GitHub Pages when you push changes.

**To Deploy Updates:**
1. Make changes to `francis.html`
2. Commit and push to GitHub
3. Changes are live in a few minutes

**Firebase Rules Deployment:**
```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage:rules
```

## 💡 Tips & Best Practices

**Finances:**
- Add transactions daily for accurate tracking
- Review spending patterns weekly
- Use AI advice to optimize your budget
- Set realistic monthly budgets

**Planning:**
- Break large tasks into smaller ones
- Use priority levels wisely (not everything is high priority)
- Review and update tasks daily
- Use AI advice for productivity tips

**Blogs:**
- Save drafts by keeping content in the editor before publishing
- Use headings to structure longer posts
- Preview before publishing (content shows immediately after publish)
- Add images to make posts more engaging

**Projects:**
- Organize files with clear naming conventions
- Delete old versions to save storage space
- Regular backups recommended
- Use folders in file names (e.g., "2024/Project1.pdf")

## 🔧 Troubleshooting

**Login Issues:**
- Ensure you're using pwavwef@gmail.com
- Check password is correct
- Clear browser cache if issues persist

**Data Not Loading:**
- Check internet connection
- Refresh the page
- Check browser console for errors

**File Upload Issues:**
- Check file size (Firebase has limits)
- Verify file type is supported
- Ensure stable internet connection

**AI Not Responding:**
- Check internet connection
- Verify API quota hasn't been exceeded
- Try refreshing the page

**Chart Not Showing:**
- Add some transactions first
- Ensure transactions are expenses (not income)
- Refresh the page

## 📊 Data Management

**Exporting Data:**
Currently, data export is not built-in. Access Firebase Console to export collections.

**Backup Strategy:**
- Firebase automatically backs up data
- For manual backup, use Firebase Console
- Download files periodically from Projects tab

**Data Limits:**
- Firestore: Generous free tier
- Storage: 5GB on Spark plan, unlimited on Blaze plan
- Functions: Blaze plan required for external API calls

## 🎨 Customization

**Colors:**
All colors are defined in CSS. Main gradient:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

**Budget:**
Default monthly budget is GH₵ 1000. Modify in JavaScript:
```javascript
const monthlyBudget = 1000; // Change this value
```

**Categories:**
Add/modify expense categories in the HTML select dropdown.

## 🆘 Support

For issues or questions:
- Email: pwavwef@gmail.com
- Check Firebase Console for backend issues
- Review browser console for errors

## 📝 Version History

**Version 2.0** (Current)
- Complete redesign as personal portal
- Added Finances module with charts
- Added Planning module
- Added Blogs with rich text editor
- Added Projects with file upload
- Added Dashboard with overview
- Modern gradient UI design
- Improved mobile responsiveness

**Version 1.0**
- Basic admin panel
- Messages inbox
- AI Assistant

---

**Built with ❤️ by Francis Pwavwe**  
*Powered by Firebase & Google Gemini AI*
