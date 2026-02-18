# Francis Personal Portal

## Overview

The Francis Personal Portal (`francis.html`) is a comprehensive personal management system designed exclusively for Francis Pwavwe. It provides a secure, feature-rich environment for managing finances, planning, blogging, projects, and more.

## Features

### 🔐 Secure Authentication
- Email/password authentication via Firebase
- Restricted access to pwavwef@gmail.com only
- Automatic session management

### 📊 Dashboard
- Overview of all portal activities
- Quick stats: monthly expenses, active plans, blog posts
- Quick action buttons to navigate to key features
- Recent activity feed

### 💰 Financial Management

**Wallet Balance**
- Track current wallet balance
- Quick balance updates

**Expense Tracking**
- Record daily expenses
- Categorize spending (Food, Airtime, Transport, Education, Entertainment, Health, Other)
- View spending history
- Track today's spending vs. total expenses

**Monthly Budget**
- Set monthly budget limits
- Visual progress bar showing budget usage
- Alerts when approaching or exceeding budget

**Spending Analytics**
- Interactive pie chart visualization
- Spending breakdown by category
- Real-time updates

**AI Financial Advisor**
- Get personalized financial advice based on your spending patterns
- AI-powered analysis using Google Gemini
- Actionable recommendations for better financial management

### 📅 Planning & Goals

**Task Management**
- Create and organize plans
- Set due dates and priorities (Low, Medium, High)
- Track plan status

**AI Planning Assistant**
- Get AI-powered advice for your plans
- Receive actionable steps to achieve goals
- Identify potential challenges and solutions
- Time management tips

### ✍️ Blog Management

**Rich Text Editor**
- Bold, italic, and underline formatting
- Bullet and numbered lists
- Insert links and images
- Multiple font sizes
- Full HTML content support

**Blog Publishing**
- Create and publish blog posts
- View all published blogs
- Delete old posts
- Timestamp tracking

### 📁 Project Files

**File Storage**
- Upload multiple files per project
- Store project documentation
- Add project names and descriptions
- Retrieve files anytime

**Project Organization**
- View all projects in one place
- Download individual files
- Delete completed projects
- Firebase Storage integration

### 📧 Messages
- View contact form submissions from the main portfolio
- Read and delete messages
- Track message timestamps

### 🤖 AI Assistant
- General-purpose AI chat interface
- Help with finances, planning, blogging, and more
- Powered by Google Gemini AI
- Context-aware responses

## Technical Stack

### Frontend
- HTML5
- CSS3 (custom styling, responsive design)
- Vanilla JavaScript (ES6+)

### Backend Services
- **Firebase Authentication** - User authentication
- **Cloud Firestore** - NoSQL database for all data
- **Firebase Storage** - File storage for project uploads
- **Google Gemini AI** - AI-powered assistance

### Data Collections

The portal uses the following Firestore collections:

1. **finances**
   - `type: 'wallet'` - Wallet balance
   - `type: 'budget'` - Monthly budget limit
   - `type: 'expense'` - Individual expenses

2. **plans**
   - Task/goal planning data
   - AI advice for plans

3. **blogs**
   - Blog posts with rich HTML content
   - Publication timestamps

4. **projects**
   - Project metadata
   - File URLs and information

5. **messages**
   - Contact form submissions

## Security

### Firestore Rules
- All collections restricted to authenticated user (pwavwef@gmail.com)
- Messages collection allows public writes (for contact form)
- Read/write/delete operations validated by authentication

### Authentication
- Firebase Authentication with email/password
- Session persistence
- Automatic logout for unauthorized users

## Usage

### Accessing the Portal
1. Navigate to `francis.html`
2. Enter credentials:
   - Email: pwavwef@gmail.com
   - Password: [Your password]
3. Access granted to full portal

### Adding an Expense
1. Go to Finances tab
2. Click "Add Expense"
3. Enter amount, category, and description
4. Click "Save Expense"
5. View updated statistics and charts

### Creating a Plan
1. Go to Planning tab
2. Click "Create New Plan"
3. Fill in title, description, due date, and priority
4. Optionally click "Get AI Advice" for suggestions
5. Click "Save Plan"

### Writing a Blog Post
1. Go to Blogs tab
2. Click "Write New Blog Post"
3. Enter title
4. Use rich text editor to format content
5. Click "Publish Blog"

### Uploading a Project
1. Go to Projects tab
2. Enter project name and description
3. Select files to upload
4. Click "Upload Project"
5. Files are stored in Firebase Storage

### Getting Financial Advice
1. Go to Finances tab
2. Scroll to "AI Financial Analysis & Advice"
3. Click "Get AI Advice"
4. Review personalized recommendations

## Design Highlights

- **Clean, Modern UI** - Professional design with blue/white theme
- **Responsive Layout** - Works on desktop and mobile devices
- **Navigation Rail** - Easy access to all features
- **Modal Dialogs** - Non-intrusive data entry
- **Real-time Updates** - Firestore listeners for instant data sync
- **Visual Feedback** - Loading states, success messages, error handling

## Firebase Configuration

The portal is configured to use the `francis-pwavwe` Firebase project with Blaze plan enabled for:
- Firestore database
- Authentication
- Storage
- External API calls (Google Gemini)

## Future Enhancements

Potential additions:
- Export financial data to CSV/Excel
- Calendar view for plans
- Blog categories and tags
- Project collaboration features
- Budget forecasting with AI
- Spending alerts and notifications
- Dark mode theme
- Mobile app version

## Support

For issues or questions, contact Francis Pwavwe at pwavwef@gmail.com

---

Built with ❤️ by Francis Pwavwe | Powered by Firebase & Google Gemini AI
