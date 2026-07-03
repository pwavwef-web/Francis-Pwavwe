// Podcast Admin Auth Guard.
// Firebase Auth does the real authentication; sessionStorage only preserves the
// existing redirect flow between admin pages.

const ADMIN_SESSION_KEY = 'az_admin_auth';

function isAdminLoggedIn() {
  return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';
}

function currentAdminPage() {
  return `${window.location.pathname.split('/').pop() || 'index.html'}${window.location.search || ''}`;
}

function requireAdmin() {
  if (!isAdminLoggedIn()) {
    window.location.href = `login.html?next=${encodeURIComponent(currentAdminPage())}`;
  }
}

async function adminLogin(password) {
  if (!window.PodcastData) {
    throw new Error('Podcast data layer is not loaded.');
  }
  await window.PodcastData.signInAdmin(password);
  sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
  return true;
}

async function requireFirebaseAdmin() {
  if (!window.PodcastData) {
    throw new Error('Podcast data layer is not loaded.');
  }
  try {
    return await window.PodcastData.requireAdminUser();
  } catch (error) {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    window.location.href = `login.html?next=${encodeURIComponent(currentAdminPage())}`;
    throw error;
  }
}

async function adminLogout() {
  if (window.PodcastData) {
    try {
      await window.PodcastData.signOutAdmin();
    } catch (error) {
      console.warn('Firebase sign out failed:', error);
    }
  }
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
  window.location.href = 'login.html';
}
