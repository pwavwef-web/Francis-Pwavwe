// ===== BLOGS FUNCTIONALITY (Standalone) =====
// This script runs independently and doesn't require Firebase modules

// Demo blogs data
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
        timestamp: new Date(2026, 1, 15),
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
        timestamp: new Date(2026, 1, 10),
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
        timestamp: new Date(2026, 1, 5),
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
        timestamp: new Date(2026, 0, 28),
        likes: 31,
        comments: 6,
        shares: 9
    }
];

let blogsData = [...demoBlogsData];
let blogInteractions = {};

// Load blog interactions from localStorage
function loadBlogInteractions() {
    const stored = localStorage.getItem('blogInteractions');
    if (stored) {
        try {
            blogInteractions = JSON.parse(stored);
        } catch (e) {
            blogInteractions = {};
        }
    }
}

// Save blog interactions to localStorage
function saveBlogInteractions() {
    localStorage.setItem('blogInteractions', JSON.stringify(blogInteractions));
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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
        if (blog.timestamp) {
            const date = blog.timestamp instanceof Date ? blog.timestamp : new Date(blog.timestamp);
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

        // Get likes, comments, shares from blog data or local storage
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

// Toggle like on a blog
function toggleLike(blogId, event) {
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
    renderBlogs();
}

// Share blog
function shareBlog(blogId) {
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
    
    // Try native share API
    if (navigator.share) {
        navigator.share({
            title: blog.title,
            text: shareText,
            url: shareUrl
        }).then(() => {
            showNotification('Blog shared successfully!');
        }).catch((error) => {
            if (error.name !== 'AbortError') {
                fallbackShare(shareUrl, shareText);
            }
        });
    } else {
        fallbackShare(shareUrl, shareText);
    }
    
    renderBlogs();
}

// Fallback share method
function fallbackShare(url, text) {
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
        alert(`Share this link: ${url}`);
    }
    
    document.body.removeChild(textArea);
}

// Open blog modal
function openBlogModal(blogId) {
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
    if (blog.timestamp) {
        const date = blog.timestamp instanceof Date ? blog.timestamp : new Date(blog.timestamp);
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
    
    // Load comments from localStorage
    loadCommentsFromLocalStorage(blogId);
    
    // Close modal on outside click
    modal.onclick = function(event) {
        if (event.target === modal) {
            closeBlogModal();
        }
    };
}

// Close blog modal
function closeBlogModal() {
    const modal = document.getElementById('blogModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Post comment
function postComment(blogId) {
    const commentInput = document.getElementById(`commentInput-${blogId}`);
    if (!commentInput) return;
    
    const commentText = commentInput.value.trim();
    if (!commentText) {
        alert('Please write a comment first!');
        return;
    }
    
    // Create comment object
    const newComment = {
        id: Date.now().toString(),
        text: commentText,
        author: 'Anonymous',
        timestamp: new Date().toISOString()
    };
    
    // Save to localStorage
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

// Load comments from localStorage
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

// Notification system (if not defined elsewhere)
function showNotification(message) {
    if (typeof window.showNotification === 'function') {
        return window.showNotification(message);
    }
    
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
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            document.body.removeChild(notification);
        }
    }, 3000);
}

// Initialize blogs on page load
loadBlogInteractions();
renderBlogs();
