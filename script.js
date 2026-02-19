// ===== NAVIGATION SCROLL EFFECT =====
const navbar = document.querySelector('.navbar');
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

// Smooth scroll for navigation links
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            const offsetTop = targetSection.offsetTop - 70;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }

        // Close mobile menu after clicking
        navMenu.classList.remove('active');
        
        // Update active link
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
    });
});

// Mobile menu toggle
navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
        navMenu.classList.remove('active');
    }
});

// ===== ACTIVE NAVIGATION BASED ON SCROLL =====
const sections = document.querySelectorAll('section[id]');

function updateActiveNav() {
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinks.forEach(link => link.classList.remove('active'));
            if (navLink) {
                navLink.classList.add('active');
            }
        }
    });
}

window.addEventListener('scroll', updateActiveNav);

// ===== SCROLL ANIMATIONS =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Add fade-in class to elements
const animatedElements = document.querySelectorAll(`
    .about-content,
    .project-card,
    .skill-card,
    .timeline-item,
    .vision-content,
    .contact-content
`);

animatedElements.forEach(el => {
    el.classList.add('fade-in');
    observer.observe(el);
});

// ===== FIREBASE CONFIGURATION =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, doc, updateDoc, increment, arrayUnion, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB6lxgjNY4CRNHAe3pAgR5SYv1ohL8brOI",
  authDomain: "francis-pwavwe.firebaseapp.com",
  projectId: "francis-pwavwe",
  storageBucket: "francis-pwavwe.firebasestorage.app",
  messagingSenderId: "658069378543",
  appId: "1:658069378543:web:87b1dcb0dd27d3255bd21a"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ===== CONTACT FORM HANDLING =====
const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get form data
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        subject: document.getElementById('subject').value,
        message: document.getElementById('message').value,
        timestamp: serverTimestamp()
    };

    try {
        // Save to Firestore
        await addDoc(collection(db, 'messages'), formData);
        
        // Show success message
        showNotification('Message sent successfully! Francis will get back to you soon.');
        
        // Reset form
        contactForm.reset();
    } catch (error) {
        console.error('Error sending message:', error);
        
        // Fallback to mailto link
        const mailtoLink = `mailto:pwavwef@gmail.com?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`)}`;
        window.location.href = mailtoLink;
        
        showNotification('Message is being prepared in your email client!');
        contactForm.reset();
    }
});

// ===== NOTIFICATION SYSTEM =====
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: linear-gradient(135deg, #1E3A8A, #3B82F6);
        color: white;
        padding: 1.5rem 2rem;
        border-radius: 8px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        font-family: 'Inter', sans-serif;
        font-weight: 500;
        max-width: 350px;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;

    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // Add to page
    document.body.appendChild(notification);

    // Remove after 4 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
            if (style.parentNode) {
                document.head.removeChild(style);
            }
        }, 300);
    }, 4000);
}

// ===== SMOOTH SCROLL TO TOP =====
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// ===== PARALLAX EFFECT ON HERO =====
const hero = document.querySelector('.hero');

window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    if (hero && scrolled < hero.offsetHeight) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// ===== CURSOR ENHANCEMENT (OPTIONAL) =====
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

if (!isTouchDevice) {
    // Add smooth hover effects for cards
    const cards = document.querySelectorAll('.project-card, .skill-card, .timeline-content');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
        });
    });
}

// ===== SCROLL PROGRESS INDICATOR =====
function updateScrollProgress() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollPercent = (scrollTop / scrollHeight) * 100;
    
    // Create or update progress bar
    let progressBar = document.getElementById('scroll-progress');
    if (!progressBar) {
        progressBar = document.createElement('div');
        progressBar.id = 'scroll-progress';
        progressBar.style.cssText = `
            position: fixed;
            top: 70px;
            left: 0;
            width: 0%;
            height: 3px;
            background: linear-gradient(90deg, #1E3A8A, #D4AF37);
            z-index: 9999;
            transition: width 0.1s ease;
        `;
        document.body.appendChild(progressBar);
    }
    
    progressBar.style.width = `${scrollPercent}%`;
}

window.addEventListener('scroll', updateScrollProgress);

// ===== PERFORMANCE: LAZY LOAD OPTIMIZATION =====
// Set initial state
document.addEventListener('DOMContentLoaded', () => {
    // Update active nav on load
    updateActiveNav();
    
    // Add visible class to hero elements immediately
    const heroElements = document.querySelectorAll('.hero-title, .hero-subtitle, .hero-cta');
    heroElements.forEach(el => el.classList.add('visible'));
    
    // Initialize scroll progress
    updateScrollProgress();
});

// ===== KEYBOARD NAVIGATION =====
document.addEventListener('keydown', (e) => {
    // Press 'Escape' to close mobile menu
    if (e.key === 'Escape' && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
    }
    
    // Press 'Home' to scroll to top
    if (e.key === 'Home') {
        e.preventDefault();
        scrollToTop();
    }
});

// ===== SMOOTH REVEAL FOR TIMELINE =====
const timelineItems = document.querySelectorAll('.timeline-item');
timelineItems.forEach((item, index) => {
    item.style.transitionDelay = `${index * 0.1}s`;
});

// ===== ENHANCE FORM ACCESSIBILITY =====
const formInputs = document.querySelectorAll('.form-group input, .form-group textarea');

formInputs.forEach(input => {
    // Add floating label effect
    input.addEventListener('focus', () => {
        input.parentElement.classList.add('focused');
    });
    
    input.addEventListener('blur', () => {
        if (!input.value) {
            input.parentElement.classList.remove('focused');
        }
    });
    
    // Validate on blur
    input.addEventListener('blur', () => {
        if (input.hasAttribute('required') && !input.value) {
            input.style.borderColor = '#EF4444';
        } else {
            input.style.borderColor = '';
        }
    });
    
    input.addEventListener('input', () => {
        input.style.borderColor = '';
    });
});

// ===== CONSOLE EASTER EGG =====
console.log('%c👋 Hello, Fellow Developer!', 'font-size: 20px; font-weight: bold; color: #1E3A8A;');
console.log('%cThis website was built with precision and passion.', 'font-size: 14px; color: #64748B;');
console.log('%cInterested in collaborating? Reach out: pwavwef@gmail.com', 'font-size: 14px; color: #3B82F6;');
console.log('%c- Francis Pwavwe', 'font-size: 12px; font-style: italic; color: #D4AF37;');

// ===== CV DOWNLOAD FUNCTIONALITY =====
document.addEventListener('DOMContentLoaded', () => {
    const downloadCVButton = document.getElementById('downloadCV');
    
    if (downloadCVButton) {
        downloadCVButton.addEventListener('click', (e) => {
            e.preventDefault();
            generateAndDownloadCV();
        });
    }
});

function generateAndDownloadCV() {
    // Create CV content
    const cvContent = `
FRANCIS PWAVWE
Strategic Thinker. Tourism Professional. Digital Innovator.

CONTACT INFORMATION
Email: pwavwef@gmail.com
Location: Cape Coast, Ghana
LinkedIn: https://linkedin.com/in/francis-pwavwe

PROFILE
I'm Francis Pwavwe, a Tourism Management student at the University of Cape Coast and the Founder of AZ Learner – an academic support platform designed to improve student retention and performance through innovative digital solutions.

As a member of both the Oguaa Hall Army Cadet Corps and the UCC Armed Forces Cadet Corps, I bring military precision to my strategic thinking while maintaining a creative and innovative approach to problem-solving.

My passion lies at the intersection of leadership, digital systems, and innovation. I'm driven by the challenge of creating impactful solutions in tourism planning, travel operations, and strategic management – with a focus on building systems that transform experiences and drive sustainable growth.

I'm committed to pursuing an international career in tourism strategy, leveraging technology and strategic thinking to create meaningful change in the African educational and tourism landscape.

EDUCATION & PROGRAMS
Harvard Aspire Leaders Program, Cohort 5
2025

Tourism Management Student
University of Cape Coast
2021 - Present
Pursuing comprehensive education in tourism management, strategic planning, and hospitality operations. Conducting research on sustainable tourism development and digital transformation in the industry.

EXPERIENCE
Intern - Housekeeping & Food and Beverage
Kempinski Hotel Gold Coast City
August - October 2025
Gained hands-on experience in luxury hospitality operations, working across Housekeeping and Food and Beverage departments. Developed practical skills in guest service excellence, operational efficiency, and maintaining high-quality standards in a five-star hotel environment.

Founder & CEO
AZ Learner
2023 - Present
Founded and leading an education-tech platform focused on improving student retention and academic performance through innovative digital solutions and personalized learning experiences.

Head of Security & Transport Committee
Journey to the East Event
2024
Led security and transportation operations for a major regional event, managing logistics, coordinating teams, and ensuring seamless execution of all safety and transport protocols.

Digital Strategy Consultant
Torchlight Tours
2023 - 2024
Developed and implemented social media strategy to enhance brand visibility, audience engagement, and conversion rates for a tourism company operating in competitive markets.

Cadet Member
Oguaa Hall Army Cadet Corps & UCC Armed Forces Cadet Corps
2022 - Present
Active member developing leadership skills, discipline, and strategic thinking through military training and cadet corps activities. Contributing to campus security initiatives and leadership development programs.

CORE COMPETENCIES
• Tourism Planning - Strategic development and management of tourism experiences
• Research & Data Analysis - Evidence-based decision making and insights generation
• Travel & Tour Operations - End-to-end management of travel services and experiences
• Event Coordination - Seamless planning and execution of complex events
• Leadership & Team Management - Building and guiding high-performing teams
• Digital Strategy - Leveraging technology for competitive advantage
• Systems Thinking - Holistic approach to complex problem-solving
• Public Speaking - Clear and compelling communication to diverse audiences

FEATURED PROJECTS
AZ Learner
An innovative academic support platform designed to improve student retention and performance through personalized learning paths, analytics-driven insights, and collaborative study tools. Currently supporting students across multiple disciplines at the University of Cape Coast.

Torchlight Tours Social Media Strategy
Developed and implemented a comprehensive social media strategy for Torchlight Tours, focusing on audience engagement, brand positioning, and conversion optimization in the competitive tourism market.

Journey to the East
Served as Head of Security and Transport Committee for this major event, coordinating logistics, ensuring participant safety, and managing a team responsible for seamless transportation and security operations.

Tourism Research & Analysis
Conducting research on sustainable tourism development, visitor experience optimization, and the impact of digital transformation on tourism operations in West Africa.

VISION
To become a leading international tourism strategist, pioneering innovative systems that transform the African tourism landscape while revolutionizing student experiences across the continent.

I envision a future where strategic thinking meets digital innovation – where African students have access to world-class educational support systems, and where tourism operations leverage technology to create sustainable, impactful experiences.

---
© 2026 Francis Pwavwe. Building the future, one strategic decision at a time.
    `.trim();

    // Create a Blob from the text content
    const blob = new Blob([cvContent], { type: 'text/plain;charset=utf-8' });
    
    // Create a download link
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Francis_Pwavwe_CV.txt';
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL
    URL.revokeObjectURL(link.href);
    
    // Show notification
    showNotification('CV downloaded successfully!');
}

// ===== BLOGS FUNCTIONALITY =====
let blogs = [];
let currentBlog = null;
const BLOG_STORAGE_KEY = 'blogInteractions';

// Get user session ID (for anonymous interactions)
function getSessionId() {
    let sessionId = localStorage.getItem('blogSessionId');
    if (!sessionId) {
        sessionId = 'anon_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
        localStorage.setItem('blogSessionId', sessionId);
    }
    return sessionId;
}

// Get blog interactions from localStorage
function getBlogInteractions() {
    const stored = localStorage.getItem(BLOG_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
}

// Save blog interactions to localStorage
function saveBlogInteraction(blogId, type) {
    const interactions = getBlogInteractions();
    if (!interactions[blogId]) {
        interactions[blogId] = { liked: false, comments: [] };
    }
    if (type === 'like') {
        interactions[blogId].liked = !interactions[blogId].liked;
    }
    localStorage.setItem(BLOG_STORAGE_KEY, JSON.stringify(interactions));
    return interactions[blogId];
}

// Load blogs from Firestore
function loadBlogs() {
    const blogsContainer = document.getElementById('blogsContainer');
    
    try {
        const q = query(
            collection(db, 'blogs'),
            orderBy('timestamp', 'desc')
        );

        onSnapshot(q, (snapshot) => {
            blogs = [];
            snapshot.forEach((doc) => {
                blogs.push({ id: doc.id, ...doc.data() });
            });
            
            renderBlogs();
        }, (error) => {
            console.error('Error loading blogs:', error);
            blogsContainer.innerHTML = `
                <div class="blog-card">
                    <div class="blog-card-content">
                        <p style="color: var(--medium-gray);">Unable to load blogs at this time. Please check back later.</p>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error('Error setting up blog listener:', error);
        blogsContainer.innerHTML = `
            <div class="blog-card">
                <div class="blog-card-content">
                    <p style="color: var(--medium-gray);">Blogs feature is currently unavailable.</p>
                </div>
            </div>
        `;
    }
}

// Extract text from HTML content
function extractText(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
}

// Sanitize URL to prevent XSS
function sanitizeUrl(url) {
    if (!url) return null;
    // Only allow http, https, and data URLs
    const urlPattern = /^(https?:\/\/|data:image\/)/i;
    return urlPattern.test(url) ? url : null;
}

// Sanitize HTML content to prevent XSS while preserving basic formatting
function sanitizeHtml(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    
    // Remove script tags and event handlers
    const scripts = div.querySelectorAll('script');
    scripts.forEach(script => script.remove());
    
    // Remove event handler attributes
    const allElements = div.querySelectorAll('*');
    allElements.forEach(el => {
        // Remove all on* event attributes
        Array.from(el.attributes).forEach(attr => {
            if (attr.name.startsWith('on')) {
                el.removeAttribute(attr.name);
            }
        });
        
        // Sanitize href and src attributes
        if (el.hasAttribute('href')) {
            const href = el.getAttribute('href');
            if (!sanitizeUrl(href) && !href.startsWith('#') && !href.startsWith('mailto:')) {
                el.removeAttribute('href');
            }
        }
        if (el.hasAttribute('src')) {
            const src = el.getAttribute('src');
            if (!sanitizeUrl(src)) {
                el.removeAttribute('src');
            }
        }
    });
    
    return div.innerHTML;
}

// Get first image from blog content
function getFirstImage(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    const img = div.querySelector('img');
    return img ? sanitizeUrl(img.src) : null;
}

// Truncate text to first N lines
function truncateToLines(text, lines = 5) {
    const lineArray = text.split('\n').filter(line => line.trim());
    return lineArray.slice(0, lines).join('\n');
}

// Render blogs
function renderBlogs() {
    const blogsContainer = document.getElementById('blogsContainer');
    const interactions = getBlogInteractions();
    
    if (blogs.length === 0) {
        blogsContainer.innerHTML = `
            <div class="blog-card">
                <div class="blog-card-content">
                    <div class="blog-loading-text">No blogs available yet. Check back soon!</div>
                </div>
            </div>
        `;
        return;
    }

    blogsContainer.innerHTML = blogs.map(blog => {
        const date = blog.timestamp?.toDate();
        const formattedDate = date ? new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date) : 'Recently';

        const fullText = extractText(blog.content);
        const preview = truncateToLines(fullText, 5);
        const imageUrl = getFirstImage(blog.content);
        const isLiked = interactions[blog.id]?.liked || false;
        const likeCount = blog.likes || 0;
        const commentCount = blog.comments || 0;

        return `
            <div class="blog-card" data-blog-id="${blog.id}">
                <div class="blog-image">
                    ${imageUrl ? `<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(blog.title || 'Blog image')}" />` : '📝'}
                </div>
                <div class="blog-card-content">
                    <h3 class="blog-card-title">${escapeHtml(blog.title || 'Untitled')}</h3>
                    <div class="blog-card-meta">${formattedDate}</div>
                    <div class="blog-card-preview">${escapeHtml(preview)}${fullText.length > preview.length ? '...' : ''}</div>
                    <div class="blog-card-actions">
                        <button class="blog-action-btn ${isLiked ? 'active' : ''}" onclick="handleLike('${blog.id}')">
                            <span class="icon">${isLiked ? '❤️' : '🤍'}</span>
                            <span>${likeCount}</span>
                        </button>
                        <button class="blog-action-btn" onclick="openBlog('${blog.id}')">
                            <span class="icon">💬</span>
                            <span>${commentCount}</span>
                        </button>
                        <button class="blog-action-btn" onclick="shareBlog('${blog.id}')">
                            <span class="icon">🔗</span>
                            <span>Share</span>
                        </button>
                    </div>
                    <button class="blog-view-more" onclick="openBlog('${blog.id}')">
                        View Full Blog
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Handle like action
window.handleLike = async function(blogId) {
    const sessionId = getSessionId();
    const interaction = saveBlogInteraction(blogId, 'like');
    
    try {
        const blogRef = doc(db, 'blogs', blogId);
        await updateDoc(blogRef, {
            likes: increment(interaction.liked ? 1 : -1)
        });
    } catch (error) {
        console.error('Error updating like:', error);
        // Like is still saved locally even if Firestore update fails
    }
};

// Share blog
window.shareBlog = function(blogId) {
    const blog = blogs.find(b => b.id === blogId);
    if (!blog) return;

    const url = window.location.href.split('#')[0] + '#blog-' + blogId;
    const text = `Check out this blog: ${blog.title || 'Untitled'}`;

    if (navigator.share) {
        navigator.share({
            title: blog.title || 'Blog Post',
            text: text,
            url: url
        }).catch(err => console.log('Error sharing:', err));
    } else {
        // Fallback: Copy to clipboard
        navigator.clipboard.writeText(`${text}\n${url}`).then(() => {
            showNotification('Blog link copied to clipboard!');
        }).catch(() => {
            showNotification('Unable to share at this time.');
        });
    }
};

// Open blog modal
window.openBlog = function(blogId) {
    const blog = blogs.find(b => b.id === blogId);
    if (!blog) return;

    currentBlog = blog;
    const imageUrl = getFirstImage(blog.content);
    const interactions = getBlogInteractions();
    const isLiked = interactions[blog.id]?.liked || false;
    const likeCount = blog.likes || 0;

    const date = blog.timestamp?.toDate();
    const formattedDate = date ? new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date) : 'Recently';

    // Create or get modal
    let modal = document.getElementById('blogModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'blogModal';
        modal.className = 'blog-modal';
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div class="blog-modal-content">
            <button class="blog-modal-close" onclick="closeBlog()">×</button>
            <div class="blog-breadcrumbs">
                <a href="#home" onclick="closeBlog()">Home</a>
                <span class="breadcrumb-separator">›</span>
                <a href="#blogs" onclick="closeBlog()">Blogs</a>
                <span class="breadcrumb-separator">›</span>
                <span class="breadcrumb-current">${escapeHtml(blog.title || 'Untitled')}</span>
            </div>
            ${imageUrl ? `<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(blog.title || 'Blog image')}" class="blog-modal-image" />` : ''}
            <div class="blog-modal-body">
                <h2 class="blog-modal-title">${escapeHtml(blog.title || 'Untitled')}</h2>
                <div class="blog-modal-meta">Published on ${formattedDate}</div>
                <div class="blog-modal-content-text">${sanitizeHtml(blog.content)}</div>
                <div class="blog-modal-actions">
                    <button class="blog-action-btn ${isLiked ? 'active' : ''}" onclick="handleLike('${blog.id}')">
                        <span class="icon">${isLiked ? '❤️' : '🤍'}</span>
                        <span>Like (${likeCount})</span>
                    </button>
                    <button class="blog-action-btn" onclick="shareBlog('${blog.id}')">
                        <span class="icon">🔗</span>
                        <span>Share</span>
                    </button>
                </div>
                <div class="blog-comments-section">
                    <h3 class="blog-comments-title">Comments</h3>
                    <div class="blog-comment-form">
                        <textarea 
                            class="blog-comment-input" 
                            id="commentInput" 
                            placeholder="Share your thoughts anonymously..."
                        ></textarea>
                        <button class="blog-comment-submit" onclick="submitComment('${blog.id}')">
                            Post Comment
                        </button>
                    </div>
                    <div class="blog-comments-list" id="commentsList">
                        <div style="color: var(--medium-gray); text-align: center; padding: 2rem;">
                            Loading comments...
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Update URL hash to the specific blog without triggering page scroll
    history.replaceState(null, null, '#blog-' + blogId);
    
    // Load comments
    loadComments(blogId);

    // Close on outside click
    modal.onclick = function(e) {
        if (e.target === modal) {
            closeBlog();
        }
    };
};

// Close blog modal
window.closeBlog = function() {
    const modal = document.getElementById('blogModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        currentBlog = null;
        
        // Clear the blog-specific hash from URL if present
        if (window.location.hash.startsWith('#blog-')) {
            // Use replaceState to avoid triggering hashchange event
            history.replaceState(null, null, window.location.pathname + '#blogs');
        }
    }
};

// Load comments for a blog
async function loadComments(blogId) {
    const commentsList = document.getElementById('commentsList');
    if (!commentsList) return;

    try {
        const blogRef = doc(db, 'blogs', blogId);
        const blogDoc = await getDoc(blogRef);
        
        if (blogDoc.exists()) {
            const blogData = blogDoc.data();
            const comments = blogData.blogComments || [];
            
            if (comments.length === 0) {
                commentsList.innerHTML = `
                    <div style="color: var(--medium-gray); text-align: center; padding: 2rem;">
                        No comments yet. Be the first to share your thoughts!
                    </div>
                `;
                return;
            }

            commentsList.innerHTML = comments.map(comment => `
                <div class="blog-comment">
                    <div class="blog-comment-author">Anonymous User</div>
                    <div class="blog-comment-date">${new Date(comment.timestamp).toLocaleString()}</div>
                    <div class="blog-comment-text">${escapeHtml(comment.text)}</div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading comments:', error);
        commentsList.innerHTML = `
            <div style="color: var(--medium-gray); text-align: center; padding: 2rem;">
                Unable to load comments.
            </div>
        `;
    }
}

// Submit comment
window.submitComment = async function(blogId) {
    const commentInput = document.getElementById('commentInput');
    if (!commentInput) return;

    const text = commentInput.value.trim();
    if (!text) {
        showNotification('Please enter a comment.');
        return;
    }

    try {
        const blogRef = doc(db, 'blogs', blogId);
        const comment = {
            text: text,
            timestamp: new Date().toISOString(),
            sessionId: getSessionId()
        };

        await updateDoc(blogRef, {
            blogComments: arrayUnion(comment),
            comments: increment(1)
        });

        commentInput.value = '';
        showNotification('Comment posted successfully!');
        
        // Reload comments
        loadComments(blogId);
    } catch (error) {
        console.error('Error posting comment:', error);
        showNotification('Unable to post comment. Please try again.');
    }
};

// Horizontal scroll functionality
function setupBlogScroll() {
    const scrollLeft = document.getElementById('scrollLeft');
    const scrollRight = document.getElementById('scrollRight');
    const blogsContainer = document.getElementById('blogsContainer');

    if (!scrollLeft || !scrollRight || !blogsContainer) return;

    const SCROLL_AMOUNT = 370; // Width of blog card plus gap
    const SCROLL_THRESHOLD = 5; // Tolerance for scroll position detection

    scrollLeft.addEventListener('click', () => {
        blogsContainer.scrollBy({
            left: -SCROLL_AMOUNT,
            behavior: 'smooth'
        });
    });

    scrollRight.addEventListener('click', () => {
        blogsContainer.scrollBy({
            left: SCROLL_AMOUNT,
            behavior: 'smooth'
        });
    });

    // Update scroll button states
    function updateScrollButtons() {
        const { scrollLeft: left, scrollWidth, clientWidth } = blogsContainer;
        
        scrollLeft.disabled = left <= 0;
        scrollRight.disabled = left + clientWidth >= scrollWidth - SCROLL_THRESHOLD;
    }

    blogsContainer.addEventListener('scroll', updateScrollButtons);
    window.addEventListener('resize', updateScrollButtons);
    
    // Initial update
    setTimeout(updateScrollButtons, 100);
}

// Initialize blogs on page load
document.addEventListener('DOMContentLoaded', () => {
    loadBlogs();
    setupBlogScroll();
    
    // Check if URL has a specific blog hash (e.g., #blog-abc123)
    const hash = window.location.hash;
    if (hash && hash.startsWith('#blog-')) {
        const blogId = hash.substring(6); // Remove '#blog-' prefix
        // Wait a bit for blogs to load, then open the specific blog
        setTimeout(() => {
            if (blogs.find(b => b.id === blogId)) {
                openBlog(blogId);
            }
        }, 1000);
    }
});

// Also handle hash changes (when user navigates using back/forward buttons)
window.addEventListener('hashchange', () => {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#blog-')) {
        const blogId = hash.substring(6);
        if (blogs.find(b => b.id === blogId)) {
            openBlog(blogId);
        }
    }
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeBlog();
    }
});

