// ==========================================================================
// SPA Application Controller
// ==========================================================================

const API_BASE = window.location.origin;

// State management
let state = {
    currentView: 'feed',
    token: localStorage.getItem('token') || null,
    username: localStorage.getItem('username') || null,
    posts: [],
    currentPost: null
};

// Initial Setup on DOM Load
document.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();
    loadPosts();
    
    // Check if initial hash is set
    const hash = window.location.hash.substring(1);
    if (hash) {
        handleHashRouting(hash);
    }
});

// Hash routing support for back/forward browser buttons
window.addEventListener('hashchange', () => {
    const hash = window.location.hash.substring(1);
    handleHashRouting(hash);
});

function handleHashRouting(hash) {
    if (hash.startsWith('post-')) {
        const id = hash.split('-')[1];
        loadPostDetail(id);
    } else if (hash === 'create') {
        navigateTo('create');
    } else {
        navigateTo('feed');
    }
}

// Navigates between views
function navigateTo(viewName) {
    state.currentView = viewName;
    
    // Hide all views, display targeted view
    document.querySelectorAll('.content-view').forEach(view => {
        view.classList.remove('active');
    });
    
    const targetView = document.getElementById(`view-${viewName}`);
    if (targetView) {
        targetView.classList.add('active');
    }

    // Update active nav link
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    if (viewName === 'feed') {
        document.getElementById('nav-home').classList.add('active');
        window.location.hash = '';
        loadPosts(); // Refresh feed
    } else if (viewName === 'create') {
        document.getElementById('nav-create').classList.add('active');
        window.location.hash = 'create';
        resetEditorForm();
    }
}

// ==========================================================================
// Authentication Logic
// ==========================================================================

function openAuthModal(tab = 'login') {
    document.getElementById('auth-modal').classList.add('active');
    switchAuthTab(tab);
}

function closeAuthModal() {
    document.getElementById('auth-modal').classList.remove('active');
    // Clear forms
    document.getElementById('login-form').reset();
    document.getElementById('register-form').reset();
    document.getElementById('login-error').innerText = '';
    document.getElementById('register-error').innerText = '';
}

function switchAuthTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
    
    document.getElementById(`tab-${tab}`).classList.add('active');
    document.getElementById(`${tab}-form`).classList.add('active');
}

// Registers user
async function handleRegisterSubmit(event) {
    event.preventDefault();
    const username = document.getElementById('reg-username').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const errorEl = document.getElementById('register-error');
    errorEl.innerText = '';

    try {
        const response = await fetch(`${API_BASE}/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.detail || 'Registration failed');
        }
        
        showToast('Registration successful! Please sign in.', 'success');
        switchAuthTab('login');
    } catch (err) {
        errorEl.innerText = err.message;
    }
}

// Log in user
async function handleLoginSubmit(event) {
    event.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');
    errorEl.innerText = '';

    try {
        const params = new URLSearchParams();
        params.append('username', username);
        params.append('password', password);

        const response = await fetch(`${API_BASE}/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params
        });
        
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.detail || 'Login failed');
        }
        
        // Save auth details
        state.token = data.access_token;
        state.username = username;
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('username', username);
        
        showToast(`Welcome back, ${username}!`, 'success');
        closeAuthModal();
        updateAuthUI();
        
        // Refresh feed & comment states
        if (state.currentView === 'feed') {
            loadPosts();
        } else if (state.currentPost) {
            loadPostDetail(state.currentPost.id);
        }
    } catch (err) {
        errorEl.innerText = err.message;
    }
}

function handleLogout() {
    state.token = null;
    state.username = null;
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    
    showToast('Logged out successfully', 'success');
    updateAuthUI();
    
    if (state.currentView === 'feed') {
        loadPosts();
    } else if (state.currentPost) {
        loadPostDetail(state.currentPost.id);
    }
}

// Update header and submission rights
function updateAuthUI() {
    const authArea = document.getElementById('header-auth');
    if (state.token && state.username) {
        authArea.innerHTML = `
            <div class="user-profile-badge">
                <div class="avatar-mini">${state.username[0]}</div>
                <span class="username-txt">${state.username}</span>
                <i class="fa-solid fa-right-from-bracket logout-icon" onclick="handleLogout()" title="Sign Out"></i>
            </div>
        `;
    } else {
        authArea.innerHTML = `
            <button class="btn btn-primary" onclick="openAuthModal('login')">Sign In</button>
        `;
    }
}

// ==========================================================================
// Posts Feed Operations
// ==========================================================================

async function loadPosts() {
    const container = document.getElementById('posts-container');
    
    try {
        const response = await fetch(`${API_BASE}/posts/`);
        const posts = await response.json();
        state.posts = posts;
        
        if (posts.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-folder-open"></i>
                    <h4>No Columns Published Yet</h4>
                    <p>Be the first one to create a column in the universe.</p>
                </div>
            `;
            return;
        }

        // Random list of categories to simulate colorful tabs
        const categories = ["Technology", "Software", "Architecture", "Design", "DevOps", "Cybersecurity"];

        container.innerHTML = posts.map((post, idx) => {
            const date = new Date(post.created_at).toLocaleDateString(undefined, { 
                month: 'short', day: 'numeric', year: 'numeric' 
            });
            const cat = categories[idx % categories.length];
            return `
                <div class="post-card" onclick="window.location.hash='post-${post.id}'">
                    <span class="card-category">${cat}</span>
                    <h4>${escapeHtml(post.title)}</h4>
                    <p>${escapeHtml(post.content)}</p>
                    <div class="card-footer">
                        <div class="author-badge">
                            <div class="avatar-small">${post.owner.username[0]}</div>
                            <span class="author-name">${post.owner.username}</span>
                        </div>
                        <span class="card-date">${date}</span>
                    </div>
                </div>
            `;
        }).join('');
    } catch (err) {
        container.innerHTML = `<div class="empty-state"><i class="fa-solid fa-circle-exclamation" style="color:var(--danger)"></i><h4>Failed to load columns</h4><p>${err.message}</p></div>`;
    }
}

function handleSearch(val) {
    const query = val.toLowerCase().trim();
    const cards = document.querySelectorAll('.post-card');
    
    cards.forEach(card => {
        const title = card.querySelector('h4').innerText.toLowerCase();
        const content = card.querySelector('p').innerText.toLowerCase();
        if (title.includes(query) || content.includes(query)) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}

// ==========================================================================
// Post Detail View Operations
// ==========================================================================

async function loadPostDetail(postId) {
    state.currentView = 'detail';
    
    // Display targeted view
    document.querySelectorAll('.content-view').forEach(view => view.classList.remove('active'));
    document.getElementById('view-post-detail').classList.add('active');
    
    const detailContent = document.getElementById('post-detail-content');
    detailContent.innerHTML = `<div class="loading-spinner"><i class="fa-solid fa-circle-notch fa-spin"></i> Loading details...</div>`;
    
    try {
        // Fetch post info
        const postRes = await fetch(`${API_BASE}/posts/${postId}`);
        if (!postRes.ok) throw new Error("Column not found");
        const post = await postRes.json();
        state.currentPost = post;
        
        const date = new Date(post.created_at).toLocaleDateString(undefined, { 
            month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' 
        });

        // Determine if current user owns the post
        const isOwner = state.username && state.username === post.owner.username;
        const ownerActions = isOwner ? `
            <div class="detail-actions">
                <button class="btn-icon btn-icon-edit" onclick="editPost(${post.id})" title="Edit Column"><i class="fa-solid fa-pen"></i></button>
                <button class="btn-icon btn-icon-delete" onclick="deletePost(${post.id})" title="Delete Column"><i class="fa-solid fa-trash-can"></i></button>
            </div>
        ` : '';

        detailContent.innerHTML = `
            <div class="detail-header">
                <div class="detail-meta">
                    <div class="detail-author-area">
                        <div class="avatar-medium">${post.owner.username[0]}</div>
                        <div class="detail-author-info">
                            <h5>${post.owner.username}</h5>
                            <span>Published on ${date}</span>
                        </div>
                    </div>
                    ${ownerActions}
                </div>
                <h2>${escapeHtml(post.title)}</h2>
            </div>
            <div class="post-body-content">${escapeHtml(post.content)}</div>
        `;
        
        // Load comments
        loadComments(postId);
        renderCommentInput(postId);
    } catch (err) {
        detailContent.innerHTML = `<div class="empty-state"><i class="fa-solid fa-circle-exclamation" style="color:var(--danger)"></i><h4>Failed to load column</h4><p>${err.message}</p></div>`;
    }
}

// Delete Post
async function deletePost(postId) {
    if (!confirm("Are you sure you want to delete this column? This action is irreversible.")) return;
    
    try {
        const response = await fetch(`${API_BASE}/posts/${postId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${state.token}` }
        });
        
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.detail || 'Failed to delete column');
        }
        
        showToast('Column deleted successfully', 'success');
        navigateTo('feed');
    } catch (err) {
        showToast(err.message, 'error');
    }
}

// Edit Post (Pre-populates form)
function editPost(postId) {
    if (!state.currentPost || state.currentPost.id !== postId) return;
    
    navigateTo('create');
    document.getElementById('editor-title').innerText = "Edit Column";
    document.getElementById('btn-save-post').innerText = "Update Details";
    document.getElementById('edit-post-id').value = postId;
    document.getElementById('post-title').value = state.currentPost.title;
    document.getElementById('post-content').value = state.currentPost.content;
}

// ==========================================================================
// Comments Operations
// ==========================================================================

async function loadComments(postId) {
    const container = document.getElementById('comments-container');
    container.innerHTML = `<div style="text-align:center;color:var(--text-muted)"><i class="fa-solid fa-circle-notch fa-spin"></i> Retrieving discussion...</div>`;
    
    try {
        const response = await fetch(`${API_BASE}/posts/${postId}/comments/`);
        const comments = await response.json();
        
        if (comments.length === 0) {
            container.innerHTML = `<div style="text-align:center;color:var(--text-muted);padding:2rem 0">No discussions posted yet. Be the first one to say something!</div>`;
            return;
        }
        
        container.innerHTML = comments.map(comment => {
            const date = new Date(comment.created_at).toLocaleDateString(undefined, {
                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
            });
            
            // Delete visibility: comment author OR post author
            const canDelete = state.username && (state.username === comment.owner.username || state.username === state.currentPost.owner.username);
            const deleteAction = canDelete ? `
                <i class="fa-solid fa-trash-can logout-icon" onclick="deleteComment(${comment.id}, ${postId})" title="Delete Comment"></i>
            ` : '';
            
            return `
                <div class="comment-item">
                    <div class="comment-header">
                        <div class="commenter-info">
                            <div class="avatar-small">${comment.owner.username[0]}</div>
                            <span class="username">${comment.owner.username}</span>
                            <span class="date">${date}</span>
                        </div>
                        ${deleteAction}
                    </div>
                    <div class="comment-content">${escapeHtml(comment.content)}</div>
                </div>
            `;
        }).join('');
    } catch (err) {
        container.innerHTML = `<div style="color:var(--danger)">Failed to load comments: ${err.message}</div>`;
    }
}

function renderCommentInput(postId) {
    const container = document.getElementById('new-comment-container');
    
    if (state.token && state.username) {
        container.innerHTML = `
            <form onsubmit="handleCommentSubmit(event, ${postId})">
                <div class="comment-input-card">
                    <textarea id="comment-box" rows="3" placeholder="Join the discussion, write your thoughts..." required></textarea>
                    <div class="comment-input-actions">
                        <button type="submit" class="btn btn-primary btn-block" style="width:auto">Post Comment</button>
                    </div>
                </div>
            </form>
        `;
    } else {
        container.innerHTML = `
            <div class="comment-login-promo">
                <p>You must be signed in to join the discussion.</p>
                <button class="btn btn-secondary" onclick="openAuthModal('login')">Sign In to Comment</button>
            </div>
        `;
    }
}

async function handleCommentSubmit(event, postId) {
    event.preventDefault();
    const content = document.getElementById('comment-box').value;
    
    try {
        const response = await fetch(`${API_BASE}/posts/${postId}/comments/`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.token}`
            },
            body: JSON.stringify({ content })
        });
        
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.detail || 'Failed to submit comment');
        }
        
        showToast('Comment posted', 'success');
        loadComments(postId);
        document.getElementById('comment-box').value = '';
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function deleteComment(commentId, postId) {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    
    try {
        const response = await fetch(`${API_BASE}/comments/${commentId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${state.token}` }
        });
        
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.detail || 'Failed to delete comment');
        }
        
        showToast('Comment deleted', 'success');
        loadComments(postId);
    } catch (err) {
        showToast(err.message, 'error');
    }
}

// ==========================================================================
// Form Submission: Create / Edit Post
// ==========================================================================

async function handlePostSubmit(event) {
    event.preventDefault();
    
    if (!state.token) {
        showToast("You must be logged in to publish columns", "error");
        openAuthModal('login');
        return;
    }
    
    const title = document.getElementById('post-title').value;
    const content = document.getElementById('post-content').value;
    const editId = document.getElementById('edit-post-id').value;
    
    const isEdit = editId !== "";
    const url = isEdit ? `${API_BASE}/posts/${editId}` : `${API_BASE}/posts/`;
    const method = isEdit ? 'PUT' : 'POST';
    
    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.token}`
            },
            body: JSON.stringify({ title, content })
        });
        
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.detail || 'Failed to save column');
        }
        
        showToast(isEdit ? 'Column updated successfully!' : 'Column published successfully!', 'success');
        navigateTo('feed');
    } catch (err) {
        showToast(err.message, 'error');
    }
}

function resetEditorForm() {
    document.getElementById('post-form').reset();
    document.getElementById('edit-post-id').value = "";
    document.getElementById('editor-title').innerText = "Draft a New Column";
    document.getElementById('btn-save-post').innerText = "Publish Column";
}

// ==========================================================================
// Toast & Utility Helpers
// ==========================================================================

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icon = type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation';
    
    toast.innerHTML = `
        <i class="fa-solid ${icon}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    // Trigger transition
    setTimeout(() => {
        toast.classList.add('show');
    }, 50);
    
    // Remove after 3.5 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3500);
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}
