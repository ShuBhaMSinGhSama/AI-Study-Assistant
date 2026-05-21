// ============================================
// API Service Layer — AI Study Assistant
// ============================================

const BASE_URL = 'http://localhost:8000/api';

/**
 * Generic fetch wrapper with error handling
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;

  const config = {
    headers: {
      'Content-Type': 'application/json',
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

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      throw new Error('Unable to connect to the server. Is the backend running?');
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
  return apiRequest('/dashboard/stats/');
}

// ── Materials ──
export async function fetchMaterials(params = {}) {
  const query = new URLSearchParams(params).toString();
  const endpoint = query ? `/materials/?${query}` : '/materials/';
  return apiRequest(endpoint);
}

export async function fetchMaterial(id) {
  return apiRequest(`/materials/${id}/`);
}

export async function createMaterial(formData) {
  return apiRequest('/materials/', {
    method: 'POST',
    body: formData,
  });
}

export async function deleteMaterial(id) {
  return apiRequest(`/materials/${id}/`, {
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

// ── Sessions ──
export async function fetchSessions(params = {}) {
  const query = new URLSearchParams(params).toString();
  const endpoint = query ? `/sessions/?${query}` : '/sessions/';
  return apiRequest(endpoint);
}

export async function createSession(data) {
  return apiRequest('/sessions/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateSession(id, data) {
  return apiRequest(`/sessions/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// ── Chat ──
export async function fetchChatMessages(sessionId) {
  const endpoint = sessionId
    ? `/chat/messages/?session=${sessionId}`
    : '/chat/messages/';
  return apiRequest(endpoint);
}

export async function sendChatMessage(data) {
  return apiRequest('/chat/send/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function fetchChatSessions() {
  return apiRequest('/chat/sessions/');
}

export async function createChatSession(data) {
  return apiRequest('/chat/sessions/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
