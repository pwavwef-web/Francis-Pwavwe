# Francis Portal - Feature Guide

## Quick Start Guide

### Accessing the Portal
1. Open `francis.html` in your web browser
2. Enter your credentials (pwavwef@gmail.com)
3. You'll be greeted with the Dashboard

## Navigation

The portal uses a **left-side navigation rail** with 7 main sections:

1. 📊 **Dashboard** - Overview and quick actions
2. 💰 **Finances** - Money management
3. 📅 **Planning** - Tasks and goals
4. ✍️ **Blogs** - Blog posts
5. 📁 **Projects** - File storage
6. 📧 **Messages** - Contact submissions
7. 🤖 **AI Assistant** - Chat with AI

## Key Features

### Dashboard
- **Quick Stats**: See total monthly expenses, active plans, and blog count
- **Quick Actions**: Jump directly to adding expenses, creating plans, writing blogs, or uploading projects
- **Recent Activity**: Track your latest actions

### Finances

#### Wallet Management
- View current balance at a glance
- Click "Update Balance" to adjust your wallet amount

#### Expense Tracking
1. Click "Add Expense"
2. Enter amount (in GH₵)
3. Select category (Food, Airtime, Transport, etc.)
4. Add description
5. Click "Save Expense"

#### Budget Management
- Set monthly budget limit
- Visual progress bar shows percentage used
- Color-coded warnings (green → yellow → red)

#### Spending Analytics
- **Pie Chart**: Visual breakdown by category
- **Recent Expenses**: Scrollable list of latest transactions

#### AI Financial Advice
- Click "Get AI Advice"
- AI analyzes your spending patterns
- Provides personalized recommendations
- Suggests ways to optimize budget

### Planning

#### Creating Plans
1. Click "Create New Plan"
2. Enter plan title
3. Add detailed description
4. Set due date (optional)
5. Choose priority (Low/Medium/High)
6. Click "Save Plan"

#### AI Planning Assistant
- While creating a plan, click "Get AI Advice"
- AI provides:
  - Actionable steps
  - Potential challenges
  - Success metrics
  - Time management tips

### Blogs

#### Rich Text Editor Features
- **Text Formatting**: Bold, Italic, Underline
- **Lists**: Bullet points and numbered lists
- **Links**: Insert clickable URLs
- **Images**: Embed images via URL
- **Font Sizes**: Small, Normal, Large, XLarge

#### Publishing Workflow
1. Click "Write New Blog Post"
2. Enter blog title
3. Use editor toolbar to format content
4. Click "Publish Blog"
5. View on main Blogs page

### Projects

#### Uploading Projects
1. Enter project name
2. Add description
3. Select files (can upload multiple)
4. Click "Upload Project"
5. Files are stored in Firebase Storage

#### Managing Projects
- View all projects with metadata
- Download individual files
- Delete entire projects

### Messages
- Automatically receives contact form submissions from your main portfolio
- View sender details and message content
- Delete messages when no longer needed

### AI Assistant
- Type any question or request
- Get help with:
  - Financial planning
  - Task organization
  - Blog ideas
  - General advice
- Powered by Google Gemini

## Data Storage

All data is automatically saved to Firebase Firestore:
- **Finances**: Wallet, budget, expenses
- **Plans**: Tasks and AI advice
- **Blogs**: Published posts
- **Projects**: Metadata and file URLs
- **Messages**: Contact submissions

## Tips & Tricks

### Finances
- 💡 Update your wallet balance weekly for accurate tracking
- 💡 Set realistic monthly budgets
- 💡 Use specific descriptions for expenses
- 💡 Request AI advice monthly for insights

### Planning
- 💡 Break large goals into smaller plans
- 💡 Set High priority for urgent items
- 💡 Use AI advice to refine your strategies

### Blogs
- 💡 Preview content before publishing
- 💡 Use images to enhance posts
- 💡 Keep paragraphs short for readability

### Projects
- 💡 Use clear, descriptive project names
- 💡 Add detailed descriptions for future reference
- 💡 Organize related files in single projects

## Keyboard Shortcuts

- **Escape**: Close modal dialogs
- **Enter**: Submit forms (in most cases)
- **Shift+Enter**: New line in text areas

## Troubleshooting

### Can't log in?
- Ensure you're using the correct email (pwavwef@gmail.com)
- Check your password
- Clear browser cache if needed

### Charts not showing?
- Wait a few seconds for Chart.js to load
- Ensure you have at least one expense recorded
- Refresh the page

### Files not uploading?
- Check file sizes (Firebase has limits)
- Ensure stable internet connection
- Verify Firebase Storage is enabled

### AI not responding?
- Check internet connection
- API key may need renewal
- Try rephrasing your question

## Mobile Usage

The portal is fully responsive:
- Navigation rail adjusts for smaller screens
- Modal dialogs are touch-friendly
- All features work on mobile browsers

## Privacy & Security

- ✅ Authentication required
- ✅ Data encrypted in transit
- ✅ Access restricted to pwavwef@gmail.com only
- ✅ Firestore security rules enforced
- ✅ XSS protection implemented

## Support

Questions or issues? Contact Francis Pwavwe at pwavwef@gmail.com

---

**Built with**: HTML, CSS, JavaScript, Firebase, Google Gemini AI
