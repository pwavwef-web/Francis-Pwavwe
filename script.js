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
import { getFirestore, collection, addDoc, serverTimestamp, query, orderBy, limit, onSnapshot, doc, updateDoc, increment, arrayUnion, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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
let blogsData = [];
let blogInteractions = {};

// Load blog interactions from localStorage
function loadBlogInteractions() {
    const stored = localStorage.getItem('blogInteractions');
    if (stored) {
        blogInteractions = JSON.parse(stored);
    }
}

// Save blog interactions to localStorage
function saveBlogInteractions() {
    localStorage.setItem('blogInteractions', JSON.stringify(blogInteractions));
}

// Demo blogs data (fallback when Firebase is unavailable)
const demoBlogsData = [
    {
        id: 'demo-1',
        title: 'The Future of Tourism in Africa',
        content: `<p>Africa's tourism industry stands at a pivotal moment. With its rich cultural heritage, diverse ecosystems, and untapped potential, the continent is poised for a tourism revolution.</p>
        
        <p>Through my studies and experiences, I've identified three key areas that will shape the future:</p>
        
        <p><strong>1. Digital Transformation:</strong> Leveraging technology to enhance visitor experiences and streamline operations.</p>
        
        <p><strong>2. Sustainable Practices:</strong> Balancing economic growth with environmental conservation and community development.</p>
        
        <p><strong>3. Strategic Marketing:</strong> Positioning African destinations competitively in the global market.</p>
        
        <p>The journey ahead is exciting, and I'm committed to being part of this transformation.</p>`,
        timestamp: { toDate: () => new Date(2026, 1, 15) },
        likes: 42,
        comments: 8,
        shares: 15
    },
    {
        id: 'demo-2',
        title: 'Lessons from the Harvard Aspire Leaders Program',
        content: `<p>Participating in the Harvard Aspire Leaders Program has been a transformative experience. The program challenged me to think beyond conventional boundaries and embrace innovative approaches to leadership.</p>
        
        <p>Key takeaways include the importance of adaptive leadership in dynamic environments, the power of collaborative problem-solving, and the necessity of maintaining ethical standards while pursuing ambitious goals.</p>
        
        <p>These lessons are directly applicable to my work in tourism management and educational technology, where I strive to create meaningful impact.</p>`,
        timestamp: { toDate: () => new Date(2026, 1, 10) },
        likes: 35,
        comments: 12,
        shares: 8
    },
    {
        id: 'demo-3',
        title: 'Building AZ Learner: A Journey of Innovation',
        content: `<p>Creating AZ Learner has been one of the most rewarding experiences of my academic journey. What started as an idea to help fellow students has evolved into a comprehensive platform supporting student success.</p>
        
        <p>The challenges we've overcome - from technical hurdles to understanding diverse learning needs - have taught me invaluable lessons about perseverance, user-centered design, and the importance of continuous iteration.</p>
        
        <p>As we continue to grow, our mission remains clear: empowering students to reach their full potential through innovative digital solutions.</p>`,
        timestamp: { toDate: () => new Date(2026, 1, 5) },
        likes: 58,
        comments: 15,
        shares: 22
    },
    {
        id: 'demo-4',
        title: 'Hospitality Excellence: Insights from Kempinski',
        content: `<p>My internship at Kempinski Hotel Gold Coast City opened my eyes to the intricacies of luxury hospitality management. Working across Housekeeping and Food & Beverage departments provided a holistic view of hotel operations.</p>
        
        <p>The experience reinforced the importance of attention to detail, guest-centric service, and teamwork in delivering exceptional experiences. These principles are universal and applicable to any service-oriented industry.</p>
        
        <p>I'm grateful for the mentorship and hands-on learning that has shaped my understanding of operational excellence.</p>`,
        timestamp: { toDate: () => new Date(2026, 0, 28) },
        likes: 31,
        comments: 6,
        shares: 9
    }
];

// Initialize blogs section
function initializeBlogs() {
    loadBlogInteractions();
    
    try {
        // Query blogs from Firebase
        const blogsQuery = query(
            collection(db, 'blogs'),
            orderBy('timestamp', 'desc'),
            limit(10)
        );

        // Listen for real-time updates
        onSnapshot(blogsQuery, (snapshot) => {
            blogsData = [];
            snapshot.forEach((doc) => {
                blogsData.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            // Use demo data if no blogs found
            if (blogsData.length === 0) {
                blogsData = demoBlogsData;
            }
            
            renderBlogs();
        }, (error) => {
            console.error('Error fetching blogs:', error);
            // Use demo blogs as fallback
            blogsData = demoBlogsData;
            renderBlogs();
        });
    } catch (error) {
        console.error('Firebase initialization error:', error);
        // Use demo blogs as fallback
        blogsData = demoBlogsData;
        renderBlogs();
    }
}

// Render blogs in the UI
function renderBlogs() {
    const blogsWrapper = document.getElementById('blogsWrapper');
    
    if (!blogsWrapper) return;
    
    if (blogsData.length === 0) {
        blogsWrapper.innerHTML = `
            <div class="blog-card-empty">
                <div class="blog-card-empty-icon">✍️</div>
                <p>No blog posts available yet. Check back soon!</p>
            </div>
        `;
        return;
    }

    blogsWrapper.innerHTML = blogsData.map(blog => {
        const blogId = blog.id;
        const interaction = blogInteractions[blogId] || { liked: false, likes: 0, comments: 0, shares: 0 };
        
        // Format date
        let formattedDate = 'Recently';
        if (blog.timestamp && blog.timestamp.toDate) {
            const date = blog.timestamp.toDate();
            formattedDate = new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }).format(date);
        }

        // Get excerpt (first 5 lines or ~200 chars)
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = blog.content || '';
        const textContent = tempDiv.textContent || tempDiv.innerText || '';
        const excerpt = textContent.substring(0, 200) + (textContent.length > 200 ? '...' : '');

        // Get likes, comments, shares from Firebase or local storage
        const likes = blog.likes || interaction.likes || 0;
        const comments = blog.comments || interaction.comments || 0;
        const shares = blog.shares || interaction.shares || 0;

        return `
            <div class="blog-card" data-blog-id="${blogId}">
                <div class="blog-card-image">
                    <span>✍️</span>
                </div>
                <div class="blog-card-content">
                    <h3 class="blog-card-title">${escapeHtml(blog.title || 'Untitled')}</h3>
                    <div class="blog-card-meta">
                        <span class="blog-card-date">
                            📅 ${formattedDate}
                        </span>
                    </div>
                    <div class="blog-card-excerpt">
                        ${escapeHtml(excerpt)}
                    </div>
                </div>
                <div class="blog-card-actions">
                    <button class="blog-action-btn ${interaction.liked ? 'liked' : ''}" onclick="toggleLike('${blogId}', event)" title="Like">
                        ${interaction.liked ? '❤️' : '🤍'}
                        <span class="action-count">${likes}</span>
                    </button>
                    <button class="blog-action-btn" onclick="openBlogModal('${blogId}')" title="Comment">
                        💬
                        <span class="action-count">${comments}</span>
                    </button>
                    <button class="blog-action-btn" onclick="shareBlog('${blogId}')" title="Share">
                        🔗
                        <span class="action-count">${shares}</span>
                    </button>
                </div>
                <div class="blog-card-footer">
                    <button class="btn-view-more" onclick="openBlogModal('${blogId}')">
                        View More
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Render error state
function renderBlogsError() {
    const blogsWrapper = document.getElementById('blogsWrapper');
    if (!blogsWrapper) return;
    
    blogsWrapper.innerHTML = `
        <div class="blog-card-empty">
            <div class="blog-card-empty-icon">⚠️</div>
            <p>Unable to load blogs. Please try again later.</p>
        </div>
    `;
}

// Toggle like on a blog
window.toggleLike = async function(blogId, event) {
    event.stopPropagation();
    
    if (!blogInteractions[blogId]) {
        blogInteractions[blogId] = { liked: false, likes: 0, comments: 0, shares: 0 };
    }
    
    const isLiked = blogInteractions[blogId].liked;
    blogInteractions[blogId].liked = !isLiked;
    blogInteractions[blogId].likes = isLiked ? 
        Math.max(0, (blogInteractions[blogId].likes || 0) - 1) : 
        (blogInteractions[blogId].likes || 0) + 1;
    
    saveBlogInteractions();
    
    // Update in Firebase
    try {
        const blogRef = doc(db, 'blogs', blogId);
        await updateDoc(blogRef, {
            likes: increment(isLiked ? -1 : 1)
        });
    } catch (error) {
        console.error('Error updating likes:', error);
    }
    
    renderBlogs();
};

// Share blog
window.shareBlog = async function(blogId) {
    const blog = blogsData.find(b => b.id === blogId);
    if (!blog) return;
    
    const shareUrl = window.location.href;
    const shareText = `Check out this blog: ${blog.title}`;
    
    // Update share count
    if (!blogInteractions[blogId]) {
        blogInteractions[blogId] = { liked: false, likes: 0, comments: 0, shares: 0 };
    }
    blogInteractions[blogId].shares = (blogInteractions[blogId].shares || 0) + 1;
    saveBlogInteractions();
    
    try {
        const blogRef = doc(db, 'blogs', blogId);
        await updateDoc(blogRef, {
            shares: increment(1)
        });
    } catch (error) {
        console.error('Error updating shares:', error);
    }
    
    // Try native share API
    if (navigator.share) {
        try {
            await navigator.share({
                title: blog.title,
                text: shareText,
                url: shareUrl
            });
            showNotification('Blog shared successfully!');
        } catch (error) {
            if (error.name !== 'AbortError') {
                fallbackShare(shareUrl, shareText);
            }
        }
    } else {
        fallbackShare(shareUrl, shareText);
    }
    
    renderBlogs();
};

// Fallback share method
function fallbackShare(url, text) {
    // Copy to clipboard
    const textArea = document.createElement('textarea');
    textArea.value = `${text}\n${url}`;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
        document.execCommand('copy');
        showNotification('Link copied to clipboard!');
    } catch (error) {
        showNotification('Share link: ' + url);
    }
    
    document.body.removeChild(textArea);
}

// Open blog modal
window.openBlogModal = function(blogId) {
    const blog = blogsData.find(b => b.id === blogId);
    if (!blog) return;
    
    // Create modal if it doesn't exist
    let modal = document.getElementById('blogModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'blogModal';
        modal.className = 'blog-modal';
        document.body.appendChild(modal);
    }
    
    // Format date
    let formattedDate = 'Recently';
    if (blog.timestamp && blog.timestamp.toDate) {
        const date = blog.timestamp.toDate();
        formattedDate = new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }
    
    const interaction = blogInteractions[blogId] || { liked: false, likes: 0, comments: 0, shares: 0 };
    const likes = blog.likes || interaction.likes || 0;
    const shares = blog.shares || interaction.shares || 0;
    
    modal.innerHTML = `
        <div class="blog-modal-content">
            <div class="blog-modal-header">
                <button class="blog-modal-close" onclick="closeBlogModal()">&times;</button>
                <h2 class="blog-modal-title">${escapeHtml(blog.title || 'Untitled')}</h2>
                <div class="blog-modal-meta">
                    📅 Published on ${formattedDate}
                </div>
            </div>
            <div class="blog-modal-body">
                <div class="blog-modal-content-text">
                    ${blog.content || '<p>No content available.</p>'}
                </div>
            </div>
            <div class="blog-modal-actions">
                <button class="blog-action-btn ${interaction.liked ? 'liked' : ''}" onclick="toggleLike('${blogId}', event)">
                    ${interaction.liked ? '❤️' : '🤍'}
                    <span class="action-count">${likes}</span>
                    <span>Like</span>
                </button>
                <button class="blog-action-btn" onclick="shareBlog('${blogId}')">
                    🔗
                    <span class="action-count">${shares}</span>
                    <span>Share</span>
                </button>
            </div>
            <div class="blog-comment-section">
                <h3>Comments</h3>
                <div class="blog-comment-form">
                    <textarea 
                        class="blog-comment-input" 
                        id="commentInput-${blogId}" 
                        placeholder="Write a comment (anonymous)..."
                    ></textarea>
                    <button class="btn btn-primary" onclick="postComment('${blogId}')">
                        Post Comment
                    </button>
                </div>
                <div class="blog-comment-list" id="commentList-${blogId}">
                    <p style="color: var(--medium-gray); text-align: center;">Loading comments...</p>
                </div>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Load comments
    loadComments(blogId);
    
    // Close modal on outside click
    modal.onclick = function(event) {
        if (event.target === modal) {
            closeBlogModal();
        }
    };
};

// Close blog modal
window.closeBlogModal = function() {
    const modal = document.getElementById('blogModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
};

// Post comment
window.postComment = async function(blogId) {
    const commentInput = document.getElementById(`commentInput-${blogId}`);
    if (!commentInput) return;
    
    const commentText = commentInput.value.trim();
    if (!commentText) {
        showNotification('Please write a comment first!');
        return;
    }
    
    // Create comment object
    const newComment = {
        id: Date.now().toString(),
        text: commentText,
        author: 'Anonymous',
        timestamp: new Date()
    };
    
    try {
        // Try Firebase first
        const commentsRef = collection(db, 'blogs', blogId, 'comments');
        await addDoc(commentsRef, {
            text: commentText,
            author: 'Anonymous',
            timestamp: serverTimestamp()
        });
        
        // Update comment count
        const blogRef = doc(db, 'blogs', blogId);
        await updateDoc(blogRef, {
            comments: increment(1)
        });
        
        // Update local interaction
        if (!blogInteractions[blogId]) {
            blogInteractions[blogId] = { liked: false, likes: 0, comments: 0, shares: 0 };
        }
        blogInteractions[blogId].comments = (blogInteractions[blogId].comments || 0) + 1;
        saveBlogInteractions();
        
        commentInput.value = '';
        showNotification('Comment posted successfully!');
        
        // Reload comments
        loadComments(blogId);
        renderBlogs();
    } catch (error) {
        console.error('Error posting comment:', error);
        
        // Fallback to localStorage for demo blogs
        const commentsKey = `blog-comments-${blogId}`;
        let comments = JSON.parse(localStorage.getItem(commentsKey) || '[]');
        comments.unshift(newComment);
        localStorage.setItem(commentsKey, JSON.stringify(comments));
        
        // Update local interaction
        if (!blogInteractions[blogId]) {
            blogInteractions[blogId] = { liked: false, likes: 0, comments: 0, shares: 0 };
        }
        blogInteractions[blogId].comments = (blogInteractions[blogId].comments || 0) + 1;
        saveBlogInteractions();
        
        commentInput.value = '';
        showNotification('Comment posted successfully!');
        
        // Reload comments from localStorage
        loadCommentsFromLocalStorage(blogId);
        renderBlogs();
    }
};

// Load comments
async function loadComments(blogId) {
    const commentList = document.getElementById(`commentList-${blogId}`);
    if (!commentList) return;
    
    try {
        const commentsRef = collection(db, 'blogs', blogId, 'comments');
        const commentsQuery = query(commentsRef, orderBy('timestamp', 'desc'));
        
        onSnapshot(commentsQuery, (snapshot) => {
            if (snapshot.empty) {
                commentList.innerHTML = '<p style="color: var(--medium-gray); text-align: center;">No comments yet. Be the first to comment!</p>';
                return;
            }
            
            const comments = [];
            snapshot.forEach((doc) => {
                comments.push({ id: doc.id, ...doc.data() });
            });
            
            commentList.innerHTML = comments.map(comment => {
                let commentDate = 'Just now';
                if (comment.timestamp && comment.timestamp.toDate) {
                    const date = comment.timestamp.toDate();
                    commentDate = new Intl.DateTimeFormat('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    }).format(date);
                }
                
                return `
                    <div class="blog-comment-item">
                        <div class="blog-comment-author">${escapeHtml(comment.author || 'Anonymous')}</div>
                        <div class="blog-comment-text">${escapeHtml(comment.text)}</div>
                        <div class="blog-comment-date">${commentDate}</div>
                    </div>
                `;
            }).join('');
        });
    } catch (error) {
        console.error('Error loading comments:', error);
        // Fallback to localStorage
        loadCommentsFromLocalStorage(blogId);
    }
}

// Load comments from localStorage (fallback)
function loadCommentsFromLocalStorage(blogId) {
    const commentList = document.getElementById(`commentList-${blogId}`);
    if (!commentList) return;
    
    const commentsKey = `blog-comments-${blogId}`;
    const comments = JSON.parse(localStorage.getItem(commentsKey) || '[]');
    
    if (comments.length === 0) {
        commentList.innerHTML = '<p style="color: var(--medium-gray); text-align: center;">No comments yet. Be the first to comment!</p>';
        return;
    }
    
    commentList.innerHTML = comments.map(comment => {
        let commentDate = 'Just now';
        if (comment.timestamp) {
            const date = new Date(comment.timestamp);
            commentDate = new Intl.DateTimeFormat('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).format(date);
        }
        
        return `
            <div class="blog-comment-item">
                <div class="blog-comment-author">${escapeHtml(comment.author || 'Anonymous')}</div>
                <div class="blog-comment-text">${escapeHtml(comment.text)}</div>
                <div class="blog-comment-date">${commentDate}</div>
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

// Initialize blogs on page load
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for Firebase to initialize
    setTimeout(() => {
        initializeBlogs();
    }, 1000);
});


