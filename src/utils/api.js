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

const API_BASE = import.meta.env.VITE_API_URL || "";

/**
 * Build a full URL for an uploaded image path.
 */
export function getImageUrl(path) {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("data:")) return path;
  return `${API_BASE}${path}`;
}

/**
 * Make a fetch call to the backend API.
 * Automatically attaches Authorization header when a token exists.
 * Falls back gracefully when the server is unreachable (demo mode).
 */
async function request(path, options = {}) {
  const url = `${API_BASE}/api${path}`;
  const headers = { ...options.headers };

  // Only set Content-Type to JSON if body is present and not FormData
  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (err) {
    // Network error (CORS, offline, DNS, etc.)
    throw new Error("Не удалось подключиться к серверу. Проверьте соединение.");
  }

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

export async function uploadPost(path, formData) {
  const token = getToken();
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}/api${path}`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${response.status}`);
  }
  return await response.json();
}

export async function uploadPut(path, formData) {
  const token = getToken();
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}/api${path}`, {
    method: "PUT",
    headers,
    body: formData,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${response.status}`);
  }
  return await response.json();
}

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
