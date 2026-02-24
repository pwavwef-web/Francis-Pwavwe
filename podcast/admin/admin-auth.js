// The AZ Podcast — Admin Auth Guard
// Checks if the current session has admin access.
//
// ⚠️  SECURITY NOTICE: This is a front-end-only demo guard.
// The password below is visible in source code and is NOT secure for production.
// Before going live, replace this entirely with Firebase Authentication
// (Firebase Auth with email/password + custom claims for the admin role).
// See: https://firebase.google.com/docs/auth

const ADMIN_SESSION_KEY = 'az_admin_auth';
// TODO: Replace with Firebase Auth — do NOT rely on this in production.
const ADMIN_PASSWORD = 'azadmin2026';

function isAdminLoggedIn() {
  return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';
}

function requireAdmin() {
  if (!isAdminLoggedIn()) {
    window.location.href = 'login.html';
  }
}

function adminLogin(password) {
  if (password === ADMIN_PASSWORD) {
    sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
    return true;
  }
  return false;
}

function adminLogout() {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
  window.location.href = 'login.html';
}
