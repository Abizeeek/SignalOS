const API_BASE = 'http://localhost:8080/api';

export const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const userId = localStorage.getItem('signalos_userId') || 'default';
  
  const headers = new Headers(options.headers);
  headers.set('X-User-Id', userId);
  
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // Handle paths that already start with http (for simplicity if components hardcode it)
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  return fetch(url, {
    ...options,
    headers,
  });
};
