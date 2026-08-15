const TOKEN_KEY = "wishmap_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

/**
 * Make a fetch call to the backend API.
 * Automatically attaches Authorization header when a token exists.
 * Falls back gracefully when the server is unreachable (demo mode).
 */
async function request(path, options = {}) {
  const url = `/api${path}`;
  const headers = { "Content-Type": "application/json", ...options.headers };

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${response.status}`);
  }

  return await response.json();
}

export const api = {
  get(path) {
    return request(path, { method: "GET" });
  },
  post(path, body) {
    return request(path, { method: "POST", body: JSON.stringify(body) });
  },
  put(path, body) {
    return request(path, { method: "PUT", body: JSON.stringify(body) });
  },
  delete(path) {
    return request(path, { method: "DELETE" }).then(() => true);
  },
};

// --- Auth API calls ---

export function registerUser(body) {
  return api.post("/auth/register", body);
}

export function loginUser(body) {
  return api.post("/auth/login", body);
}

export function getCurrentUser() {
  return api.get("/auth/me");
}
