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
import { getFirestore, collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

// ===== BLOG SECTION FUNCTIONALITY =====
// Blog data
let blogsData = [];
let blogLikes = JSON.parse(localStorage.getItem('blogLikes') || '{}');
let blogComments = JSON.parse(localStorage.getItem('blogComments') || '{}');

// Fetch blogs from Firebase
async function fetchBlogs() {
    try {
        const blogsQuery = query(
            collection(db, 'blogs'),
            orderBy('timestamp', 'desc'),
            limit(10) // Fetch latest 10 blogs
        );
        
        const querySnapshot = await getDocs(blogsQuery);
        blogsData = [];
        
        querySnapshot.forEach((doc) => {
            blogsData.push({ id: doc.id, ...doc.data() });
        });
        
        displayBlogs();
    } catch (error) {
        console.error('Error fetching blogs:', error);
        
        // Use mock data for testing when Firebase is unavailable
        blogsData = [
            {
                id: 'demo1',
                title: 'My Journey in Tourism Management',
                content: '<p>As a Tourism Management student at the University of Cape Coast, I have learned that sustainable tourism is not just about preserving our natural resources, but about creating meaningful experiences that benefit both visitors and local communities. Through my internship at Kempinski Hotel Gold Coast City, I gained invaluable insights into luxury hospitality operations.</p><p>The future of tourism in Africa is bright, and I am committed to being part of this transformation.</p>',
                timestamp: { toDate: () => new Date('2026-02-15') }
            },
            {
                id: 'demo2',
                title: 'Leadership Lessons from Harvard Aspire Program',
                content: '<img src="https://via.placeholder.com/400x200/1E3A8A/FFFFFF?text=Leadership" alt="Leadership" /><p>Completing the Harvard Aspire Leaders Program was a transformative experience. The program taught me that true leadership is about empowering others and creating systems that enable success.</p><p>Key takeaways included strategic thinking, global perspectives, and the importance of continuous learning in leadership development.</p>',
                timestamp: { toDate: () => new Date('2026-02-10') }
            },
            {
                id: 'demo3',
                title: 'Building AZ Learner: An EdTech Journey',
                content: '<p>Founding AZ Learner has been one of the most challenging yet rewarding experiences of my life. The platform addresses a critical need in our educational system - improving student retention and academic performance through personalized learning.</p><p>We have helped hundreds of students across multiple disciplines, and this is just the beginning.</p>',
                timestamp: { toDate: () => new Date('2026-02-05') }
            }
        ];
        
        displayBlogs();
    }
}

// Extract plain text from HTML content
function extractPlainText(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
}

// Truncate text to approximately 5 lines (about 250 characters)
function truncateText(text, maxLength = 250) {
    const plainText = extractPlainText(text);
    if (plainText.length <= maxLength) {
        return plainText;
    }
    return plainText.substring(0, maxLength).trim() + '...';
}

// Extract first image from blog content
function extractFirstImage(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    const img = div.querySelector('img');
    return img ? img.src : null;
}

// Display blogs in the horizontal scroll
function displayBlogs() {
    const wrapper = document.getElementById('blogCardsWrapper');
    
    if (blogsData.length === 0) {
        wrapper.innerHTML = '<div class="blog-loading">No blogs available yet. Check back soon!</div>';
        return;
    }
    
    wrapper.innerHTML = blogsData.map(blog => {
        const imageUrl = extractFirstImage(blog.content);
        const preview = truncateText(blog.content);
        const date = blog.timestamp?.toDate();
        const formattedDate = date ? new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date) : 'Recently';
        
        const likeCount = blogLikes[blog.id] || 0;
        const commentCount = (blogComments[blog.id] || []).length;
        const isLiked = localStorage.getItem(`blog_liked_${blog.id}`) === 'true';
        
        return `
            <div class="blog-card">
                <div class="blog-card-image">
                    ${imageUrl ? `<img src="${imageUrl}" alt="${escapeHtml(blog.title)}" />` : '📝'}
                </div>
                <div class="blog-card-content">
                    <div class="blog-card-meta">${formattedDate}</div>
                    <h3 class="blog-card-title">${escapeHtml(blog.title)}</h3>
                    <div class="blog-card-preview">${preview}</div>
                    <div class="blog-card-actions">
                        <button class="blog-action-btn ${isLiked ? 'liked' : ''}" onclick="toggleLike('${blog.id}')">
                            <span class="action-icon">${isLiked ? '❤️' : '🤍'}</span>
                            <span>${likeCount}</span>
                        </button>
                        <button class="blog-action-btn" onclick="openBlogModal('${blog.id}')">
                            <span class="action-icon">💬</span>
                            <span>${commentCount}</span>
                        </button>
                        <button class="blog-action-btn" onclick="shareBlog('${blog.id}')">
                            <span class="action-icon">🔗</span>
                            <span>Share</span>
                        </button>
                    </div>
                    <div class="blog-card-footer">
                        <button class="btn-view-more" onclick="openBlogModal('${blog.id}')">View More</button>
                    </div>
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

// Toggle like on a blog
window.toggleLike = function(blogId) {
    const isLiked = localStorage.getItem(`blog_liked_${blogId}`) === 'true';
    
    if (isLiked) {
        // Unlike
        blogLikes[blogId] = Math.max((blogLikes[blogId] || 1) - 1, 0);
        localStorage.setItem(`blog_liked_${blogId}`, 'false');
    } else {
        // Like
        blogLikes[blogId] = (blogLikes[blogId] || 0) + 1;
        localStorage.setItem(`blog_liked_${blogId}`, 'true');
    }
    
    localStorage.setItem('blogLikes', JSON.stringify(blogLikes));
    displayBlogs();
};

// Share blog
window.shareBlog = async function(blogId) {
    const blog = blogsData.find(b => b.id === blogId);
    if (!blog) return;
    
    const shareData = {
        title: blog.title,
        text: truncateText(blog.content, 100),
        url: window.location.href + '#blogs'
    };
    
    try {
        if (navigator.share) {
            await navigator.share(shareData);
        } else {
            // Fallback: Copy to clipboard
            await navigator.clipboard.writeText(shareData.url);
            showNotification('Link copied to clipboard!');
        }
    } catch (error) {
        console.log('Share cancelled or failed:', error);
    }
};

// Open blog modal
window.openBlogModal = function(blogId) {
    const blog = blogsData.find(b => b.id === blogId);
    if (!blog) return;
    
    const modal = document.getElementById('blogModal');
    const modalBody = document.getElementById('blogModalBody');
    
    const imageUrl = extractFirstImage(blog.content);
    const date = blog.timestamp?.toDate();
    const formattedDate = date ? new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(date) : 'Recently';
    
    const likeCount = blogLikes[blog.id] || 0;
    const commentCount = (blogComments[blog.id] || []).length;
    const isLiked = localStorage.getItem(`blog_liked_${blog.id}`) === 'true';
    const comments = blogComments[blog.id] || [];
    
    modalBody.innerHTML = `
        <h2 class="blog-modal-title">${escapeHtml(blog.title)}</h2>
        <div class="blog-modal-meta">Published on ${formattedDate}</div>
        ${imageUrl ? `<img src="${imageUrl}" alt="${escapeHtml(blog.title)}" class="blog-modal-image" />` : ''}
        <div class="blog-modal-content-text">${blog.content}</div>
        <div class="blog-modal-actions">
            <button class="blog-action-btn ${isLiked ? 'liked' : ''}" onclick="toggleLikeModal('${blog.id}')">
                <span class="action-icon">${isLiked ? '❤️' : '🤍'}</span>
                <span id="modal-like-count-${blog.id}">${likeCount}</span>
            </button>
            <button class="blog-action-btn">
                <span class="action-icon">💬</span>
                <span>${commentCount} Comments</span>
            </button>
            <button class="blog-action-btn" onclick="shareBlog('${blog.id}')">
                <span class="action-icon">🔗</span>
                <span>Share</span>
            </button>
        </div>
        <div class="blog-comments-section">
            <h3 class="blog-comments-title">Comments</h3>
            <div class="blog-comment-form">
                <textarea 
                    id="comment-input-${blog.id}" 
                    class="comment-input" 
                    placeholder="Share your thoughts..."
                ></textarea>
                <button class="btn-comment" onclick="addComment('${blog.id}')">Post Comment</button>
            </div>
            <div class="blog-comments-list" id="comments-list-${blog.id}">
                ${comments.length > 0 ? comments.map(comment => `
                    <div class="blog-comment">
                        <div class="blog-comment-author">Anonymous</div>
                        <div class="blog-comment-date">${new Date(comment.timestamp).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}</div>
                        <div class="blog-comment-text">${escapeHtml(comment.text)}</div>
                    </div>
                `).join('') : '<p style="color: var(--medium-gray);">No comments yet. Be the first to comment!</p>'}
            </div>
        </div>
    `;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
};

// Toggle like in modal
window.toggleLikeModal = function(blogId) {
    toggleLike(blogId);
    const likeCountEl = document.getElementById(`modal-like-count-${blogId}`);
    if (likeCountEl) {
        likeCountEl.textContent = blogLikes[blogId] || 0;
    }
    // Update the like button appearance
    openBlogModal(blogId);
};

// Add comment
window.addComment = function(blogId) {
    const input = document.getElementById(`comment-input-${blogId}`);
    const commentText = input.value.trim();
    
    if (!commentText) {
        alert('Please enter a comment');
        return;
    }
    
    if (!blogComments[blogId]) {
        blogComments[blogId] = [];
    }
    
    blogComments[blogId].push({
        text: commentText,
        timestamp: new Date().toISOString()
    });
    
    localStorage.setItem('blogComments', JSON.stringify(blogComments));
    
    // Refresh the modal
    openBlogModal(blogId);
    displayBlogs(); // Update comment count in cards
    
    showNotification('Comment posted successfully!');
};

// Close blog modal
function closeBlogModal() {
    const modal = document.getElementById('blogModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// Close modal on click outside or on close button
document.addEventListener('click', (e) => {
    const modal = document.getElementById('blogModal');
    const closeBtn = document.querySelector('.blog-modal-close');
    
    if (e.target === modal || e.target === closeBtn) {
        closeBlogModal();
    }
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeBlogModal();
    }
});

// Horizontal scroll buttons
document.addEventListener('DOMContentLoaded', () => {
    const wrapper = document.getElementById('blogCardsWrapper');
    const scrollLeft = document.querySelector('.scroll-left');
    const scrollRight = document.querySelector('.scroll-right');
    
    if (scrollLeft && scrollRight && wrapper) {
        scrollLeft.addEventListener('click', () => {
            wrapper.scrollBy({ left: -400, behavior: 'smooth' });
        });
        
        scrollRight.addEventListener('click', () => {
            wrapper.scrollBy({ left: 400, behavior: 'smooth' });
        });
    }
    
    // Fetch blogs when page loads
    fetchBlogs();
});

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

