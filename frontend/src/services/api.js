// ============================================
// API Service Layer — AI Study Assistant
// ============================================

import { getAccessToken } from './auth';
import { showToast } from '../components/Toast';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

/**
 * Generic fetch wrapper with error handling and JWT auth
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;

  // Auto-inject auth token
  const token = getAccessToken();
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...options.headers,
    },
    ...options,
  };

  // Don't set Content-Type for FormData
  if (options.body instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  try {
    const response = await fetch(url, config);

    // DELETE returns 204 No Content
    if (response.status === 204) {
      return null;
    }

    // Handle 401 — token expired
    if (response.status === 401) {
      const errorData = await response.json().catch(() => ({}));
      const err = new Error(errorData.detail || 'Session expired. Please log in again.');
      err.status = 401;
      if (!options.silent) showToast(err.message, 'error');
      throw err;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      // If it's a validation error (e.g. dict of field errors), format it
      let errorMsg = errorData.detail || errorData.error || errorData.message;
      if (!errorMsg && typeof errorData === 'object') {
        const firstKey = Object.keys(errorData)[0];
        if (firstKey) errorMsg = Array.isArray(errorData[firstKey]) ? errorData[firstKey][0] : errorData[firstKey];
      }
      errorMsg = errorMsg || `HTTP ${response.status}: ${response.statusText}`;
      
      const err = new Error(errorMsg);
      if (!options.silent) showToast(errorMsg, 'error');
      throw err;
    }

    return await response.json();
  } catch (error) {
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      const msg = 'Unable to connect to the server. Is the backend running?';
      if (!options.silent) showToast(msg, 'error');
      throw new Error(msg);
    }
    // If we haven't shown it yet and it's not silent
    if (!options.silent && !error.status) {
      showToast(error.message, 'error');
    }
    throw error;
  }
}

// ── Status ──
export async function fetchStatus() {
  return apiRequest('/status/');
}


// ── Dashboard ──
export async function fetchDashboardStats() {
  return apiRequest('/dashboard/');
}

export async function fetchActivityFeed() {
  return apiRequest('/activity-feed/');
}

// ── Study Materials ──
export async function fetchMaterials(params = {}) {
  const query = new URLSearchParams(params).toString();
  const endpoint = query ? `/study-materials/?${query}` : '/study-materials/';
  return apiRequest(endpoint);
}

export async function fetchMaterial(id) {
  return apiRequest(`/study-materials/${id}/`);
}

export async function createMaterial(data) {
  // Support both FormData (file upload) and JSON
  if (data instanceof FormData) {
    return apiRequest('/study-materials/', {
      method: 'POST',
      body: data,
    });
  }
  return apiRequest('/study-materials/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateMaterial(id, data) {
  return apiRequest(`/study-materials/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteMaterial(id) {
  return apiRequest(`/study-materials/${id}/`, {
    method: 'DELETE',
  });
}

// ── Flashcards ──
export async function fetchFlashcards(params = {}) {
  const query = new URLSearchParams(params).toString();
  const endpoint = query ? `/flashcards/?${query}` : '/flashcards/';
  return apiRequest(endpoint);
}

export async function fetchFlashcard(id) {
  return apiRequest(`/flashcards/${id}/`);
}

export async function createFlashcard(data) {
  return apiRequest('/flashcards/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateFlashcard(id, data) {
  return apiRequest(`/flashcards/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteFlashcard(id) {
  return apiRequest(`/flashcards/${id}/`, {
    method: 'DELETE',
  });
}

export async function generateFlashcards(studyMaterialId, numCards = 10) {
  return apiRequest('/generate-flashcards/', {
    method: 'POST',
    body: JSON.stringify({
      study_material_id: studyMaterialId,
      num_cards: numCards,
    }),
  });
}

// ── Study Sessions ──
export async function fetchSessions() {
  return apiRequest('/study-sessions/');
}

export async function fetchSession(id) {
  return apiRequest(`/study-sessions/${id}/`);
}

export async function createSession(data) {
  return apiRequest('/study-sessions/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateSession(id, data) {
  return apiRequest(`/study-sessions/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteSession(id) {
  return apiRequest(`/study-sessions/${id}/`, {
    method: 'DELETE',
  });
}

// ── Chat ──
export async function sendChatMessage(data) {
  return apiRequest('/chat/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function fetchChatMessages(sessionId) {
  const endpoint = sessionId
    ? `/chat-messages/?session_id=${sessionId}`
    : '/chat-messages/';
  return apiRequest(endpoint);
}

// ── Spaced Repetition ──
export async function reviewFlashcard(flashcardId, quality) {
  return apiRequest('/review-flashcard/', {
    method: 'POST',
    body: JSON.stringify({
      flashcard_id: flashcardId,
      quality: quality,
    }),
  });
}

export async function fetchDueFlashcards() {
  return apiRequest('/due-flashcards/');
}
