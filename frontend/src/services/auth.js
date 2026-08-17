// ============================================
// Auth Service Layer — AI Study Assistant
// ============================================

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const TOKEN_KEY = 'ai_study_access_token';
const REFRESH_KEY = 'ai_study_refresh_token';
const USER_KEY = 'ai_study_user';

// ── Token Management ──
export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY);
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function storeAuth(tokens, user) {
  localStorage.setItem(TOKEN_KEY, tokens.access);
  localStorage.setItem(REFRESH_KEY, tokens.refresh);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}

// ── Auth API Calls ──

async function authRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errMsg = data.error || data.detail || data.username?.[0] || data.email?.[0] || data.password?.[0] || data.password_confirm?.[0] || `HTTP ${response.status}`;
    throw new Error(errMsg);
  }

  return data;
}

export async function registerUser({ username, email, password, password_confirm }) {
  const data = await authRequest('/auth/register/', {
    method: 'POST',
    body: JSON.stringify({ username, email, password, password_confirm }),
  });
  storeAuth(data.tokens, data.user);
  return data;
}

export async function loginUser({ username, password }) {
  const data = await authRequest('/auth/login/', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  storeAuth(data.tokens, data.user);
  return data;
}

export async function logoutUser() {
  try {
    const refreshToken = getRefreshToken();
    const accessToken = getAccessToken();
    if (refreshToken && accessToken) {
      await authRequest('/auth/logout/', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ refresh: refreshToken }),
      });
    }
  } catch {
    // Ignore errors on logout
  } finally {
    clearAuth();
  }
}

export async function fetchProfile() {
  const accessToken = getAccessToken();
  if (!accessToken) throw new Error('Not authenticated');
  return authRequest('/auth/profile/', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error('No refresh token');

  const data = await authRequest('/auth/token/refresh/', {
    method: 'POST',
    body: JSON.stringify({ refresh: refreshToken }),
  });

  localStorage.setItem(TOKEN_KEY, data.access);
  if (data.refresh) {
    localStorage.setItem(REFRESH_KEY, data.refresh);
  }
  return data.access;
}
