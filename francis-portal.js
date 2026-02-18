// ========================================
// NAVIGATION & SCREEN MANAGEMENT
// ========================================

window.switchScreen = function(screenName) {
    // Update navigation
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        if (item.dataset.screen === screenName) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Update screens
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenName + 'Screen').classList.add('active');
};

// ========================================
// MODAL MANAGEMENT
// ========================================

window.openModal = function(modalId) {
    document.getElementById(modalId).classList.add('active');
};

window.closeModal = function(modalId) {
    document.getElementById(modalId).classList.remove('active');
};

// ========================================
// FINANCES MODULE
// ========================================

let walletBalance = 0;
let monthlyBudget = 0;
let expenses = [];
let spendingChart = null;

window.initializeFinances = async function() {
    // Load wallet balance
    const walletDoc = await window.getDocs(window.query(window.collection(window.db, 'finances'), window.where('type', '==', 'wallet')));
    if (!walletDoc.empty) {
        const data = walletDoc.docs[0].data();
        walletBalance = data.balance || 0;
        document.getElementById('walletBalance').textContent = walletBalance.toFixed(2);
    }

    // Load budget
    const budgetDoc = await window.getDocs(window.query(window.collection(window.db, 'finances'), window.where('type', '==', 'budget')));
    if (!budgetDoc.empty) {
        const data = budgetDoc.docs[0].data();
        monthlyBudget = data.limit || 0;
        document.getElementById('budgetLimit').value = monthlyBudget;
    }

    // Listen to expenses
    const expensesQuery = window.query(
        window.collection(window.db, 'finances'),
        window.where('type', '==', 'expense'),
        window.orderBy('timestamp', 'desc')
    );

    window.onSnapshot(expensesQuery, (snapshot) => {
        expenses = [];
        snapshot.forEach(doc => {
            expenses.push({ id: doc.id, ...doc.data() });
        });
        updateFinancesUI();
    });

    // Initialize Chart.js
    loadChartJS();
};

function loadChartJS() {
    // Load Chart.js from CDN
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js';
    script.onload = () => {
        updateSpendingChart();
    };
    document.head.appendChild(script);
}

function updateFinancesUI() {
    // Calculate today's spending
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayExpenses = expenses.filter(e => {
        const expenseDate = e.timestamp?.toDate();
        return expenseDate && expenseDate >= today;
    });

    const todayTotal = todayExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    document.getElementById('todaySpending').textContent = todayTotal.toFixed(2);

    // Calculate monthly spending
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthlyExpenses = expenses.filter(e => {
        const expenseDate = e.timestamp?.toDate();
        return expenseDate && expenseDate >= firstDayOfMonth;
    });

    const monthlyTotal = monthlyExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    // Update dashboard
    document.getElementById('dashTotalExpenses').textContent = `GH₵ ${monthlyTotal.toFixed(2)}`;

    // Update budget status
    if (monthlyBudget > 0) {
        const percentage = (monthlyTotal / monthlyBudget) * 100;
        const budgetStatus = document.getElementById('budgetStatus');
        budgetStatus.innerHTML = `
            <div style="margin-top: 10px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span>Spent: GH₵ ${monthlyTotal.toFixed(2)} / GH₵ ${monthlyBudget.toFixed(2)}</span>
                    <span>${percentage.toFixed(1)}%</span>
                </div>
                <div style="background: #e0e0e0; height: 20px; border-radius: 10px; overflow: hidden;">
                    <div style="background: ${percentage > 100 ? '#ef4444' : percentage > 80 ? '#f59e0b' : '#10b981'}; 
                                height: 100%; width: ${Math.min(percentage, 100)}%; transition: width 0.3s;"></div>
                </div>
            </div>
        `;
    }

    // Update recent expenses
    const recentExpensesDiv = document.getElementById('recentExpenses');
    if (expenses.length === 0) {
        recentExpensesDiv.innerHTML = '<p style="color: #666;">No expenses recorded</p>';
    } else {
        recentExpensesDiv.innerHTML = expenses.slice(0, 10).map(e => `
            <div class="expense-item">
                <div>
                    <strong>${e.description || 'Expense'}</strong>
                    <span class="category-badge">${e.category}</span>
                    <div style="font-size: 12px; color: #666; margin-top: 4px;">
                        ${e.timestamp?.toDate().toLocaleDateString()}
                    </div>
                </div>
                <div style="font-weight: 700; color: #ef4444;">
                    -GH₵ ${(e.amount || 0).toFixed(2)}
                </div>
            </div>
        `).join('');
    }

    // Update chart
    updateSpendingChart();
}

function updateSpendingChart() {
    if (typeof Chart === 'undefined') return;

    // Calculate spending by category
    const categoryTotals = {};
    expenses.forEach(e => {
        const category = e.category || 'Other';
        categoryTotals[category] = (categoryTotals[category] || 0) + (e.amount || 0);
    });

    const ctx = document.getElementById('spendingChart');
    if (!ctx) return;

    if (spendingChart) {
        spendingChart.destroy();
    }

    const categories = Object.keys(categoryTotals);
    const totals = Object.values(categoryTotals);

    if (categories.length === 0) {
        ctx.getContext('2d').clearRect(0, 0, ctx.width, ctx.height);
        return;
    }

    spendingChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: categories,
            datasets: [{
                data: totals,
                backgroundColor: [
                    '#1e3a8a', '#3b82f6', '#60a5fa', '#93c5fd',
                    '#ef4444', '#f59e0b', '#10b981', '#8b5cf6'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

window.updateWallet = async function() {
    const newBalance = prompt('Enter new wallet balance (GH₵):', walletBalance);
    if (newBalance === null) return;

    const balance = parseFloat(newBalance);
    if (isNaN(balance)) {
        alert('Invalid amount');
        return;
    }

    walletBalance = balance;
    document.getElementById('walletBalance').textContent = balance.toFixed(2);

    // Save to Firestore
    const walletQuery = await window.getDocs(
        window.query(window.collection(window.db, 'finances'), window.where('type', '==', 'wallet'))
    );

    if (walletQuery.empty) {
        await window.addDoc(window.collection(window.db, 'finances'), {
            type: 'wallet',
            balance: balance,
            timestamp: window.serverTimestamp()
        });
    } else {
        await window.updateDoc(window.doc(window.db, 'finances', walletQuery.docs[0].id), {
            balance: balance,
            timestamp: window.serverTimestamp()
        });
    }
};

window.saveBudget = async function() {
    const limit = parseFloat(document.getElementById('budgetLimit').value);
    if (isNaN(limit)) {
        alert('Invalid budget amount');
        return;
    }

    monthlyBudget = limit;

    // Save to Firestore
    const budgetQuery = await window.getDocs(
        window.query(window.collection(window.db, 'finances'), window.where('type', '==', 'budget'))
    );

    if (budgetQuery.empty) {
        await window.addDoc(window.collection(window.db, 'finances'), {
            type: 'budget',
            limit: limit,
            timestamp: window.serverTimestamp()
        });
    } else {
        await window.updateDoc(window.doc(window.db, 'finances', budgetQuery.docs[0].id), {
            limit: limit,
            timestamp: window.serverTimestamp()
        });
    }

    alert('Budget saved successfully!');
    updateFinancesUI();
};

window.addExpense = function() {
    document.getElementById('expenseAmount').value = '';
    document.getElementById('expenseCategory').value = 'Food';
    document.getElementById('expenseDescription').value = '';
    window.openModal('expenseModal');
};

window.saveExpense = async function() {
    const amount = parseFloat(document.getElementById('expenseAmount').value);
    const category = document.getElementById('expenseCategory').value;
    const description = document.getElementById('expenseDescription').value;

    if (isNaN(amount) || amount <= 0) {
        alert('Invalid amount');
        return;
    }

    await window.addDoc(window.collection(window.db, 'finances'), {
        type: 'expense',
        amount: amount,
        category: category,
        description: description,
        timestamp: window.serverTimestamp()
    });

    window.closeModal('expenseModal');
    alert('Expense added successfully!');
};

window.getFinancialAdvice = async function() {
    const adviceDiv = document.getElementById('financialAdvice');
    const loadingDiv = document.getElementById('adviceLoading');
    const contentDiv = document.getElementById('adviceContent');

    adviceDiv.style.display = 'block';
    loadingDiv.style.display = 'block';
    contentDiv.innerHTML = '';

    // Prepare financial data
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthlyExpenses = expenses.filter(e => {
        const expenseDate = e.timestamp?.toDate();
        return expenseDate && expenseDate >= firstDayOfMonth;
    });

    const monthlyTotal = monthlyExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    const categoryTotals = {};
    monthlyExpenses.forEach(e => {
        const category = e.category || 'Other';
        categoryTotals[category] = (categoryTotals[category] || 0) + (e.amount || 0);
    });

    const prompt = `As a financial advisor AI, analyze this spending data and provide personalized advice:

Wallet Balance: GH₵ ${walletBalance.toFixed(2)}
Monthly Budget: GH₵ ${monthlyBudget.toFixed(2)}
Total Spent This Month: GH₵ ${monthlyTotal.toFixed(2)}

Spending by Category:
${Object.entries(categoryTotals).map(([cat, amt]) => `- ${cat}: GH₵ ${amt.toFixed(2)}`).join('\n')}

Please provide:
1. Analysis of current spending patterns
2. Budget performance assessment
3. Specific recommendations to optimize spending
4. Tips for better financial management

Keep the advice practical and actionable for a student/young professional in Ghana.`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${window.GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();
        const advice = data.candidates[0].content.parts[0].text;

        loadingDiv.style.display = 'none';
        contentDiv.innerHTML = `<div style="white-space: pre-wrap; line-height: 1.6;">${escapeHtml(advice)}</div>`;
    } catch (error) {
        loadingDiv.style.display = 'none';
        contentDiv.innerHTML = `<div style="color: #ef4444;">Error getting advice: ${error.message}</div>`;
    }
};

// ========================================
// PLANNING MODULE
// ========================================

let plans = [];

window.initializePlanning = function() {
    const plansQuery = window.query(
        window.collection(window.db, 'plans'),
        window.orderBy('timestamp', 'desc')
    );

    window.onSnapshot(plansQuery, (snapshot) => {
        plans = [];
        snapshot.forEach(doc => {
            plans.push({ id: doc.id, ...doc.data() });
        });
        updatePlansUI();
        updateDashboard();
    });
};

function updatePlansUI() {
    const plansList = document.getElementById('plansList');
    
    if (plans.length === 0) {
        plansList.innerHTML = '<div class="card"><p style="color: #666;">No plans created yet</p></div>';
        return;
    }

    plansList.innerHTML = plans.map(plan => `
        <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                <div>
                    <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 5px;">${escapeHtml(plan.title)}</h3>
                    <div style="font-size: 12px; color: #666;">
                        Due: ${plan.dueDate ? new Date(plan.dueDate).toLocaleDateString() : 'No due date'} | 
                        Priority: <span style="color: ${plan.priority === 'High' ? '#ef4444' : plan.priority === 'Medium' ? '#f59e0b' : '#10b981'}">
                            ${plan.priority}
                        </span>
                    </div>
                </div>
                <button class="btn btn-danger" onclick="deletePlan('${plan.id}')">Delete</button>
            </div>
            <p style="color: #333; line-height: 1.6; white-space: pre-wrap;">${escapeHtml(plan.description)}</p>
            ${plan.aiAdvice ? `
                <div style="margin-top: 15px; padding: 15px; background: #f0f9ff; border-left: 4px solid #3b82f6; border-radius: 4px;">
                    <strong style="color: #1e3a8a;">AI Advice:</strong>
                    <p style="margin-top: 8px; white-space: pre-wrap; color: #333;">${escapeHtml(plan.aiAdvice)}</p>
                </div>
            ` : ''}
        </div>
    `).join('');
}

window.createNewPlan = function() {
    document.getElementById('planTitle').value = '';
    document.getElementById('planDescription').value = '';
    document.getElementById('planDueDate').value = '';
    document.getElementById('planPriority').value = 'Medium';
    window.openModal('planModal');
};

window.savePlan = async function() {
    const title = document.getElementById('planTitle').value.trim();
    const description = document.getElementById('planDescription').value.trim();
    const dueDate = document.getElementById('planDueDate').value;
    const priority = document.getElementById('planPriority').value;

    if (!title) {
        alert('Please enter a plan title');
        return;
    }

    await window.addDoc(window.collection(window.db, 'plans'), {
        title: title,
        description: description,
        dueDate: dueDate,
        priority: priority,
        timestamp: window.serverTimestamp()
    });

    window.closeModal('planModal');
    alert('Plan created successfully!');
};

window.getPlanAdvice = async function() {
    const title = document.getElementById('planTitle').value.trim();
    const description = document.getElementById('planDescription').value.trim();

    if (!title || !description) {
        alert('Please enter plan title and description first');
        return;
    }

    const prompt = `As a planning and productivity advisor, help with this plan:

Title: ${title}
Description: ${description}

Provide:
1. Analysis of the plan
2. Actionable steps to achieve it
3. Potential challenges and how to overcome them
4. Time management tips
5. Success metrics to track progress

Be specific and practical.`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${window.GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();
        const advice = data.candidates[0].content.parts[0].text;

        alert('AI Advice received! It will be added to your plan.');

        // Save the plan with advice
        await window.addDoc(window.collection(window.db, 'plans'), {
            title: document.getElementById('planTitle').value.trim(),
            description: document.getElementById('planDescription').value.trim(),
            dueDate: document.getElementById('planDueDate').value,
            priority: document.getElementById('planPriority').value,
            aiAdvice: advice,
            timestamp: window.serverTimestamp()
        });

        window.closeModal('planModal');
    } catch (error) {
        alert('Error getting AI advice: ' + error.message);
    }
};

window.deletePlan = async function(planId) {
    if (!confirm('Are you sure you want to delete this plan?')) return;
    
    await window.deleteDoc(window.doc(window.db, 'plans', planId));
};

// ========================================
// BLOGS MODULE
// ========================================

let blogs = [];

window.initializeBlogs = function() {
    const blogsQuery = window.query(
        window.collection(window.db, 'blogs'),
        window.orderBy('timestamp', 'desc')
    );

    window.onSnapshot(blogsQuery, (snapshot) => {
        blogs = [];
        snapshot.forEach(doc => {
            blogs.push({ id: doc.id, ...doc.data() });
        });
        updateBlogsUI();
        updateDashboard();
    });
};

function updateBlogsUI() {
    const blogsList = document.getElementById('blogsList');
    
    if (blogs.length === 0) {
        blogsList.innerHTML = '<div class="card"><p style="color: #666;">No blog posts yet</p></div>';
        return;
    }

    blogsList.innerHTML = blogs.map(blog => `
        <div class="blog-post">
            <h2 class="blog-title">${escapeHtml(blog.title)}</h2>
            <div class="blog-meta">
                Published on ${blog.timestamp?.toDate().toLocaleDateString()} at ${blog.timestamp?.toDate().toLocaleTimeString()}
            </div>
            <div class="blog-content">${sanitizeHtml(blog.content)}</div>
            <div style="margin-top: 15px;">
                <button class="btn btn-danger" onclick="deleteBlog('${blog.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

// Sanitize HTML to prevent XSS while allowing basic formatting
function sanitizeHtml(html) {
    if (!html) return '';
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Remove script tags
    const scripts = tempDiv.querySelectorAll('script');
    scripts.forEach(script => script.remove());
    
    // Remove on* event attributes from all elements
    const allElements = tempDiv.querySelectorAll('*');
    allElements.forEach(el => {
        Array.from(el.attributes).forEach(attr => {
            if (attr.name.startsWith('on')) {
                el.removeAttribute(attr.name);
            }
        });
    });
    
    return tempDiv.innerHTML;
}

window.createNewBlog = function() {
    document.getElementById('blogTitle').value = '';
    document.getElementById('blogEditor').innerHTML = '';
    window.openModal('blogModal');
};

window.saveBlog = async function() {
    const title = document.getElementById('blogTitle').value.trim();
    const content = document.getElementById('blogEditor').innerHTML;

    if (!title) {
        alert('Please enter a blog title');
        return;
    }

    if (!content || content.trim() === '') {
        alert('Please write some content');
        return;
    }

    await window.addDoc(window.collection(window.db, 'blogs'), {
        title: title,
        content: content,
        timestamp: window.serverTimestamp()
    });

    window.closeModal('blogModal');
    alert('Blog post published successfully!');
};

window.deleteBlog = async function(blogId) {
    if (!confirm('Are you sure you want to delete this blog post?')) return;
    
    await window.deleteDoc(window.doc(window.db, 'blogs', blogId));
};

// Rich text editor functions
window.formatText = function(command, value = null) {
    document.execCommand(command, false, value);
    document.getElementById('blogEditor').focus();
};

window.insertLink = function() {
    const url = prompt('Enter URL:');
    if (url) {
        document.execCommand('createLink', false, url);
    }
};

window.insertImage = function() {
    const url = prompt('Enter image URL:');
    if (url) {
        document.execCommand('insertImage', false, url);
    }
};

// ========================================
// PROJECTS MODULE
// ========================================

let projects = [];

window.initializeProjects = function() {
    const projectsQuery = window.query(
        window.collection(window.db, 'projects'),
        window.orderBy('timestamp', 'desc')
    );

    window.onSnapshot(projectsQuery, (snapshot) => {
        projects = [];
        snapshot.forEach(doc => {
            projects.push({ id: doc.id, ...doc.data() });
        });
        updateProjectsUI();
    });
};

function updateProjectsUI() {
    const projectsList = document.getElementById('projectsList');
    
    if (projects.length === 0) {
        projectsList.innerHTML = '<div class="card"><p style="color: #666;">No projects uploaded yet</p></div>';
        return;
    }

    projectsList.innerHTML = projects.map(project => `
        <div class="card">
            <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 10px;">${escapeHtml(project.name)}</h3>
            <p style="color: #666; margin-bottom: 15px;">${escapeHtml(project.description)}</p>
            <div style="font-size: 12px; color: #666; margin-bottom: 15px;">
                Uploaded on ${project.timestamp?.toDate().toLocaleDateString()}
            </div>
            ${project.files && project.files.length > 0 ? `
                <div class="file-list">
                    <strong>Files:</strong>
                    ${project.files.map(file => `
                        <div class="file-item">
                            <span>📄 ${escapeHtml(file.name)}</span>
                            <a href="${file.url}" target="_blank" class="btn btn-secondary" style="padding: 6px 12px; font-size: 12px;">Download</a>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            <div style="margin-top: 15px;">
                <button class="btn btn-danger" onclick="deleteProject('${project.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

window.uploadProject = async function() {
    const name = document.getElementById('projectName').value.trim();
    const description = document.getElementById('projectDescription').value.trim();
    const filesInput = document.getElementById('projectFiles');
    const files = filesInput.files;

    if (!name) {
        alert('Please enter a project name');
        return;
    }

    if (files.length === 0) {
        alert('Please select at least one file');
        return;
    }

    try {
        // Upload files to Firebase Storage
        const uploadedFiles = [];
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const storageRef = window.ref(window.storage, `projects/${Date.now()}_${file.name}`);
            await window.uploadBytes(storageRef, file);
            const url = await window.getDownloadURL(storageRef);
            
            uploadedFiles.push({
                name: file.name,
                url: url,
                size: file.size
            });
        }

        // Save project to Firestore
        await window.addDoc(window.collection(window.db, 'projects'), {
            name: name,
            description: description,
            files: uploadedFiles,
            timestamp: window.serverTimestamp()
        });

        // Clear form
        document.getElementById('projectName').value = '';
        document.getElementById('projectDescription').value = '';
        document.getElementById('projectFiles').value = '';

        alert('Project uploaded successfully!');
    } catch (error) {
        alert('Error uploading project: ' + error.message);
    }
};

window.deleteProject = async function(projectId) {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    await window.deleteDoc(window.doc(window.db, 'projects', projectId));
};

// ========================================
// MESSAGES MODULE
// ========================================

window.initializeMessages = function() {
    const messagesQuery = window.query(
        window.collection(window.db, 'messages'),
        window.orderBy('timestamp', 'desc')
    );

    window.onSnapshot(messagesQuery, (snapshot) => {
        const messagesContent = document.getElementById('messagesContent');
        
        if (snapshot.empty) {
            messagesContent.innerHTML = `
                <div class="card">
                    <p style="color: #666; text-align: center;">No messages yet</p>
                </div>
            `;
            return;
        }

        messagesContent.innerHTML = '';
        snapshot.forEach(doc => {
            const data = doc.data();
            const card = createMessageCard(doc.id, data);
            messagesContent.appendChild(card);
        });
    });
};

function createMessageCard(id, data) {
    const card = document.createElement('div');
    card.className = 'card';
    
    const timestamp = data.timestamp?.toDate();
    const formattedTime = timestamp 
        ? timestamp.toLocaleDateString() + ' ' + timestamp.toLocaleTimeString()
        : 'No date';
    
    card.innerHTML = `
        <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
            <div>
                <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 5px;">${escapeHtml(data.name || 'Unknown')}</h3>
                <div style="font-size: 14px; color: #666;">${escapeHtml(data.email || 'No email')}</div>
                <div style="font-size: 12px; color: #999; margin-top: 5px;">${escapeHtml(formattedTime)}</div>
            </div>
            <button class="btn btn-danger" onclick="deleteMessage('${id}')">Delete</button>
        </div>
        <div style="margin-bottom: 10px;">
            <strong>Subject:</strong> ${escapeHtml(data.subject || 'No subject')}
        </div>
        <div style="padding: 15px; background: #f9fafb; border-radius: 8px; white-space: pre-wrap;">
            ${escapeHtml(data.message || 'No message')}
        </div>
    `;
    
    return card;
}

window.deleteMessage = async function(messageId) {
    if (!confirm('Delete this message?')) return;
    await window.deleteDoc(window.doc(window.db, 'messages', messageId));
};

// ========================================
// AI ASSISTANT MODULE
// ========================================

let chatMessages = [];

window.initializeAI = function() {
    const chatMessagesDiv = document.getElementById('chatMessages');
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    
    // Add welcome message
    if (chatMessages.length === 0) {
        addChatMessage({
            text: `Hello Francis! I'm your AI assistant. I can help you with:

💰 Financial planning and budgeting
📅 Planning and goal setting
✍️ Blog writing ideas
📁 Project organization
🎯 Personal productivity

How can I assist you today?`,
            isUser: false
        });
    }
    
    // Send message handler
    async function sendMessage() {
        const text = chatInput.value.trim();
        if (!text) return;
        
        chatInput.value = '';
        
        addChatMessage({ text: text, isUser: true });
        
        sendBtn.disabled = true;
        sendBtn.textContent = 'Thinking...';
        
        try {
            const response = await callGeminiAPI(text);
            addChatMessage({ text: response, isUser: false });
        } catch (error) {
            addChatMessage({ 
                text: `Sorry, I encountered an error: ${error.message}`, 
                isUser: false 
            });
        } finally {
            sendBtn.disabled = false;
            sendBtn.textContent = 'Send';
        }
    }
    
    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
};

function addChatMessage(message) {
    chatMessages.push(message);
    
    const chatMessagesDiv = document.getElementById('chatMessages');
    const bubble = document.createElement('div');
    bubble.style.cssText = `
        margin-bottom: 15px;
        display: flex;
        justify-content: ${message.isUser ? 'flex-end' : 'flex-start'};
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
        max-width: 70%;
        padding: 12px 16px;
        border-radius: 12px;
        background: ${message.isUser ? '#1e3a8a' : '#e0e0e0'};
        color: ${message.isUser ? 'white' : '#333'};
        white-space: pre-wrap;
        line-height: 1.5;
    `;
    content.textContent = message.text;
    
    bubble.appendChild(content);
    chatMessagesDiv.appendChild(bubble);
    chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;
}

async function callGeminiAPI(userMessage) {
    const prompt = `You are a personal AI assistant for Francis Pwavwe. You specialize in:
1. Financial planning, budgeting, and spending management
2. Personal productivity and planning
3. Blog writing and content creation
4. Project management
5. Academic and career advice

User's question: ${userMessage}

Provide helpful, practical, and personalized advice. Be concise but thorough.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${window.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
        })
    });

    if (!response.ok) {
        throw new Error('Failed to get AI response');
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}

// ========================================
// DASHBOARD MODULE
// ========================================

window.updateDashboard = async function() {
    // Update stats
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // Calculate monthly expenses
    if (expenses.length > 0) {
        const monthlyExpenses = expenses.filter(e => {
            const expenseDate = e.timestamp?.toDate();
            return expenseDate && expenseDate >= firstDayOfMonth;
        });
        const monthlyTotal = monthlyExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
        document.getElementById('dashTotalExpenses').textContent = `GH₵ ${monthlyTotal.toFixed(2)}`;
    }

    // Update active plans
    document.getElementById('dashActivePlans').textContent = plans.length;

    // Update blog posts
    document.getElementById('dashBlogPosts').textContent = blogs.length;

    // Update recent activity
    const recentActivity = document.getElementById('recentActivity');
    const activities = [];

    // Add recent expenses
    if (expenses.length > 0) {
        const recentExpense = expenses[0];
        activities.push(`Added expense: ${recentExpense.description} - GH₵${recentExpense.amount}`);
    }

    // Add recent plans
    if (plans.length > 0) {
        activities.push(`Created plan: ${plans[0].title}`);
    }

    // Add recent blogs
    if (blogs.length > 0) {
        activities.push(`Published blog: ${blogs[0].title}`);
    }

    if (activities.length > 0) {
        recentActivity.innerHTML = activities.map(a => `
            <div style="padding: 10px; border-bottom: 1px solid #e0e0e0;">
                ${escapeHtml(a)}
            </div>
        `).join('');
    }
};

// ========================================
// UTILITY FUNCTIONS
// ========================================

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    console.log('Francis Portal loaded successfully');
});
