# Francis Portal - Quick Start

## Access Your Portal

🔗 **URL:** https://pwavwef-web.github.io/Francis-Pwavwe/francis.html

## Login

- **Email:** pwavwef@gmail.com
- **Password:** Your Firebase password

## What You Can Do

### 💰 Finances
Track your spending and manage your budget
- Add income/expenses with categories
- View pie chart of spending
- Get AI financial advice
- **Default Budget:** GH₵ 1000/month (change in code if needed)

### 📝 Planning
Organize your tasks and goals
- Create tasks with priorities
- Set due dates
- Mark tasks complete
- Get AI productivity advice

### ✍️ Blogs
Write and publish your thoughts
- Use rich text formatting
- Add images and links
- Publish blog posts
- View all your blogs

### 📁 Projects
Upload and manage your files
- Drag-and-drop files
- Download anytime
- Supports: PDF, DOC, XLS, PPT, ZIP, Images

### 📧 Messages
View contact form submissions from your website

### 🤖 AI Assistant
Chat with AI for advice on anything

## Categories for Expenses

- 🍕 Food
- 📱 Airtime
- 🚗 Transport
- 📚 Education
- 🎬 Entertainment
- 🏥 Health
- ⚡ Utilities
- 📦 Other

## Tips

1. **Add transactions daily** for accurate tracking
2. **Use priorities wisely** - not everything is high priority
3. **Save blog drafts** in the editor before publishing
4. **Organize files** with clear names
5. **Check AI advice** regularly for insights

## Customize Your Budget

To change your monthly budget from GH₵ 1000:

1. Open `francis.html` in a text editor
2. Find line ~1137: `const MONTHLY_BUDGET = 1000;`
3. Change the number to your desired budget
4. Save and the changes will appear on next load

## Need Help?

📖 **Full Guide:** FRANCIS_PORTAL_GUIDE.md
🚀 **Deployment:** FIREBASE_DEPLOYMENT.md
🔧 **Technical Details:** IMPLEMENTATION_SUMMARY.md

## Deployment (Firebase Rules)

If you make changes to Firestore or Storage rules:

```bash
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
```

## Troubleshooting

**Can't log in?**
- Check you're using pwavwef@gmail.com
- Verify password is correct

**Data not loading?**
- Check internet connection
- Refresh the page
- Check browser console for errors

**Chart not showing?**
- Add some expense transactions first
- Refresh the page

---

**Enjoy your personal portal! 🎉**
