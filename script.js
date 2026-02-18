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
import { getFirestore, collection, addDoc, serverTimestamp, query, orderBy, getDocs, doc, updateDoc, increment, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

// ===== BLOGS SECTION =====
let blogsData = [];
let userInteractions = JSON.parse(localStorage.getItem('blogInteractions') || '{}');

// Demo blog data for demonstration when Firebase is unavailable
const demoBlogsData = [
    {
        id: 'demo1',
        title: 'The Future of Tourism in West Africa',
        content: '<p>Tourism in West Africa is experiencing a transformative shift driven by digital innovation and sustainable practices. As we navigate through 2026, the integration of technology in tourism operations is no longer optional—it\'s essential for growth and competitiveness.</p><p>From mobile booking platforms to AI-powered customer service, the landscape is changing rapidly. Hotels and tour operators must adapt to meet the evolving expectations of modern travelers who demand seamless, personalized experiences.</p><img src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800" alt="Tourism landscape" /><p>The key to success lies in balancing traditional hospitality with cutting-edge technology, creating experiences that are both authentic and efficient.</p>',
        timestamp: { toDate: () => new Date('2026-02-15') },
        likes: 24,
        comments: 8,
        shares: 12
    },
    {
        id: 'demo2',
        title: 'Building AZ Learner: Lessons in EdTech Innovation',
        content: '<p>Creating an education technology platform from scratch has been one of the most challenging and rewarding experiences of my entrepreneurial journey. AZ Learner was born from a simple observation: students needed better tools to succeed academically.</p><p>The platform focuses on three core pillars: personalized learning paths, data-driven insights, and collaborative study tools. Each feature was designed with student success in mind, backed by research and user feedback.</p><p>One of the biggest lessons I learned was the importance of iterative development. We launched with a minimum viable product and continuously improved based on user needs. This approach allowed us to stay agile and responsive to our community.</p>',
        timestamp: { toDate: () => new Date('2026-02-10') },
        likes: 42,
        comments: 15,
        shares: 18
    },
    {
        id: 'demo3',
        title: 'Leadership Lessons from the Harvard Aspire Program',
        content: '<p>The Harvard Aspire Leaders Program was a transformative experience that reshaped my understanding of leadership in the 21st century. Cohort 5 brought together leaders from diverse backgrounds, creating a rich learning environment.</p><p>Key takeaways included the importance of emotional intelligence, strategic thinking, and the ability to navigate complex, ambiguous situations. The program emphasized that leadership is not about having all the answers, but about asking the right questions and empowering others.</p><p>These insights have directly influenced how I approach my work with AZ Learner and my tourism management studies. Leadership is about creating systems that enable others to succeed.</p>',
        timestamp: { toDate: () => new Date('2026-02-05') },
        likes: 56,
        comments: 22,
        shares: 31
    },
    {
        id: 'demo4',
        title: 'Digital Strategy in Tourism: A Case Study',
        content: '<p>During my time as a Digital Strategy Consultant with Torchlight Tours, I developed and implemented a comprehensive social media strategy that significantly increased brand visibility and engagement.</p><img src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800" alt="Digital marketing" /><p>The strategy focused on authentic storytelling, user-generated content, and data-driven decision making. By analyzing engagement metrics and customer feedback, we were able to optimize our content for maximum impact.</p><p>This experience taught me the power of strategic digital marketing in the tourism industry and the importance of staying ahead of trends.</p>',
        timestamp: { toDate: () => new Date('2026-01-28') },
        likes: 33,
        comments: 11,
        shares: 9
    },
    {
        id: 'demo5',
        title: 'Sustainable Tourism: Balancing Growth and Conservation',
        content: '<p>As tourism continues to grow globally, the question of sustainability becomes increasingly critical. How do we promote economic development through tourism while preserving the natural and cultural resources that make destinations attractive?</p><p>My research at the University of Cape Coast focuses on this delicate balance. Sustainable tourism is not just about environmental protection—it encompasses economic viability, social equity, and cultural preservation.</p><p>The future of tourism lies in creating experiences that benefit local communities, protect ecosystems, and provide authentic, meaningful experiences for travelers. This requires innovative thinking and collaborative partnerships.</p>',
        timestamp: { toDate: () => new Date('2026-01-20') },
        likes: 48,
        comments: 19,
        shares: 25
    }
];

// Load blogs from Firestore or use demo data
async function loadBlogs() {
    const blogsCarousel = document.getElementById('blogsCarousel');
    
    try {
        // Check if Firebase is available
        if (typeof db !== 'undefined') {
            // Listen for real-time updates
            const blogsQuery = query(collection(db, 'blogs'), orderBy('timestamp', 'desc'));
            
            onSnapshot(blogsQuery, (snapshot) => {
                blogsData = [];
                snapshot.forEach((doc) => {
                    blogsData.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                
                // If no blogs loaded from Firebase, use demo data
                if (blogsData.length === 0) {
                    blogsData = demoBlogsData;
                }
                renderBlogs();
            }, (error) => {
                console.error('Error loading blogs:', error);
                // Load demo blogs on error
                blogsData = demoBlogsData;
                renderBlogs();
            });
        } else {
            // Firebase not available, use demo data
            blogsData = demoBlogsData;
            renderBlogs();
        }
    } catch (error) {
        console.error('Error setting up blog listener:', error);
        // Load demo blogs on error
        blogsData = demoBlogsData;
        renderBlogs();
    }
}

// Render blogs in carousel
function renderBlogs() {
    const blogsCarousel = document.getElementById('blogsCarousel');
    
    if (blogsData.length === 0) {
        blogsCarousel.innerHTML = '<div class="blog-loading">No blog posts available yet.</div>';
        return;
    }
    
    blogsCarousel.innerHTML = blogsData.map(blog => {
        const date = blog.timestamp?.toDate();
        const formattedDate = date ? new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date) : 'No date';
        
        // Extract text preview (first 5 lines approximately)
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = blog.content || '';
        const textContent = tempDiv.textContent || tempDiv.innerText || '';
        const preview = textContent.substring(0, 300) + (textContent.length > 300 ? '...' : '');
        
        // Extract first image from content
        const imgMatch = blog.content?.match(/<img[^>]+src="([^">]+)"/);
        const imageUrl = imgMatch ? imgMatch[1] : null;
        
        // Get interaction data
        const interactions = userInteractions[blog.id] || { liked: false, comments: [] };
        const likes = (blog.likes || 0);
        const comments = (blog.comments || 0);
        const shares = (blog.shares || 0);
        
        return `
            <div class="blog-card" data-blog-id="${blog.id}">
                <div class="blog-image">
                    ${imageUrl ? `<img src="${imageUrl}" alt="${escapeHtml(blog.title || 'Blog image')}" />` : '✍️'}
                </div>
                <div class="blog-card-content">
                    <h3 class="blog-card-title">${escapeHtml(blog.title || 'Untitled')}</h3>
                    <div class="blog-card-date">${formattedDate}</div>
                    <div class="blog-card-preview">${escapeHtml(preview)}</div>
                    <div class="blog-card-actions">
                        <button class="blog-action-btn ${interactions.liked ? 'active' : ''}" onclick="toggleLike('${blog.id}')" title="Like this post">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                            </svg>
                            <span>${likes}</span>
                        </button>
                        <button class="blog-action-btn" onclick="toggleComments('${blog.id}')" title="View comments">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
                            </svg>
                            <span>${comments}</span>
                        </button>
                        <button class="blog-action-btn" onclick="shareBlog('${blog.id}', '${escapeHtml(blog.title || 'Blog post')}')" title="Share this post">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
                            </svg>
                            <span>${shares}</span>
                        </button>
                    </div>
                    <a href="#" class="blog-view-more" onclick="openBlogModal('${blog.id}'); return false;">View More →</a>
                </div>
                <div class="blog-comment-section" id="comments-${blog.id}" style="display: none;">
                    <div class="blog-comments" id="comment-list-${blog.id}"></div>
                    <form class="blog-comment-form" onsubmit="addComment(event, '${blog.id}')">
                        <input type="text" class="blog-comment-input" placeholder="Add a comment..." required>
                        <button type="submit" class="blog-comment-submit">Post</button>
                    </form>
                </div>
            </div>
        `;
    }).join('');
}

// Toggle like
window.toggleLike = async function(blogId) {
    const interactions = userInteractions[blogId] || { liked: false, comments: [] };
    const newLikedState = !interactions.liked;
    
    try {
        const blogRef = doc(db, 'blogs', blogId);
        await updateDoc(blogRef, {
            likes: increment(newLikedState ? 1 : -1)
        });
        
        // Update local storage
        userInteractions[blogId] = { ...interactions, liked: newLikedState };
        localStorage.setItem('blogInteractions', JSON.stringify(userInteractions));
        
    } catch (error) {
        console.error('Error updating like:', error);
        showNotification('Unable to update like. Please try again.');
    }
};

// Toggle comments section
window.toggleComments = function(blogId) {
    const commentsSection = document.getElementById(`comments-${blogId}`);
    const isVisible = commentsSection.style.display !== 'none';
    
    // Hide all comment sections
    document.querySelectorAll('.blog-comment-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Toggle current section
    if (!isVisible) {
        commentsSection.style.display = 'block';
        loadComments(blogId);
    }
};

// Load comments for a blog
function loadComments(blogId) {
    const commentList = document.getElementById(`comment-list-${blogId}`);
    const interactions = userInteractions[blogId] || { liked: false, comments: [] };
    
    if (interactions.comments.length === 0) {
        commentList.innerHTML = '<div style="text-align: center; color: var(--medium-gray); padding: 1rem;">No comments yet. Be the first to comment!</div>';
        return;
    }
    
    commentList.innerHTML = interactions.comments.map(comment => `
        <div class="blog-comment">
            <div class="blog-comment-author">${escapeHtml(comment.author)}</div>
            <div class="blog-comment-text">${escapeHtml(comment.text)}</div>
        </div>
    `).join('');
}

// Add comment
window.addComment = async function(event, blogId) {
    event.preventDefault();
    
    const form = event.target;
    const input = form.querySelector('.blog-comment-input');
    const commentText = input.value.trim();
    
    if (!commentText) return;
    
    try {
        const blogRef = doc(db, 'blogs', blogId);
        await updateDoc(blogRef, {
            comments: increment(1)
        });
        
        // Save comment locally
        const interactions = userInteractions[blogId] || { liked: false, comments: [] };
        interactions.comments.push({
            author: 'Anonymous',
            text: commentText,
            timestamp: new Date().toISOString()
        });
        
        userInteractions[blogId] = interactions;
        localStorage.setItem('blogInteractions', JSON.stringify(userInteractions));
        
        // Clear input and reload comments
        input.value = '';
        loadComments(blogId);
        
        showNotification('Comment added successfully!');
    } catch (error) {
        console.error('Error adding comment:', error);
        showNotification('Unable to add comment. Please try again.');
    }
};

// Share blog
window.shareBlog = async function(blogId, title) {
    const url = window.location.href;
    
    try {
        if (navigator.share) {
            await navigator.share({
                title: title,
                text: `Check out this blog post: ${title}`,
                url: url
            });
        } else {
            // Fallback: copy to clipboard
            await navigator.clipboard.writeText(url);
            showNotification('Link copied to clipboard!');
        }
        
        // Increment share count
        const blogRef = doc(db, 'blogs', blogId);
        await updateDoc(blogRef, {
            shares: increment(1)
        });
    } catch (error) {
        console.error('Error sharing:', error);
        showNotification('Unable to share. Please copy the URL manually.');
    }
};

// Open blog modal
window.openBlogModal = function(blogId) {
    const blog = blogsData.find(b => b.id === blogId);
    if (!blog) return;
    
    const date = blog.timestamp?.toDate();
    const formattedDate = date ? new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(date) : 'No date';
    
    // Extract first image from content
    const imgMatch = blog.content?.match(/<img[^>]+src="([^">]+)"/);
    const imageUrl = imgMatch ? imgMatch[1] : null;
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'blog-modal active';
    modal.innerHTML = `
        <div class="blog-modal-content">
            <button class="blog-modal-close" onclick="closeBlogModal()">×</button>
            ${imageUrl ? `<img src="${imageUrl}" alt="${escapeHtml(blog.title || 'Blog image')}" class="blog-modal-image" />` : ''}
            <div class="blog-modal-body">
                <h2 class="blog-modal-title">${escapeHtml(blog.title || 'Untitled')}</h2>
                <div class="blog-modal-date">${formattedDate}</div>
                <div class="blog-modal-content-text">${blog.content || ''}</div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    // Close on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeBlogModal();
        }
    });
};

// Close blog modal
window.closeBlogModal = function() {
    const modal = document.querySelector('.blog-modal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = '';
    }
};

// Carousel navigation
function setupBlogCarousel() {
    const carousel = document.getElementById('blogsCarousel');
    const prevBtn = document.querySelector('.carousel-btn-prev');
    const nextBtn = document.querySelector('.carousel-btn-next');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            carousel.scrollBy({ left: -370, behavior: 'smooth' });
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            carousel.scrollBy({ left: 370, behavior: 'smooth' });
        });
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize blogs when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadBlogs();
    setupBlogCarousel();
});
