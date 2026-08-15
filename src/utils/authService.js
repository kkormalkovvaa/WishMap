import { registerUser as apiRegister, loginUser as apiLogin } from "./api.js";

const USERS_KEY = "wishmap_users";
const LOCAL_SALT = "wishmap_local_v1";

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + LOCAL_SALT);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// --- Local storage helpers (offline fallback) ---

function getUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// --- Server-aware auth functions ---

export async function registerUser({ name, email, password }) {
  // Try server first
  try {
    const result = await apiRegister({ name, email, password });
    return {
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      token: result.token,
    };
  } catch {
    // Fallback to localStorage for offline mode
    const users = getUsers();
    const existing = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase(),
    );
    if (existing) {
      throw new Error("Пользователь с таким email уже существует");
    }

    const passwordHash = await hashPassword(password);
    const newUser = {
      id: Date.now(),
      name,
      email,
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveUsers(users);

    return { id: newUser.id, name: newUser.name, email: newUser.email };
  }
}

export async function loginUser({ email, password }) {
  // Try server first
  try {
    const result = await apiLogin({ email, password });
    return {
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      token: result.token,
    };
  } catch {
    // Fallback to localStorage for offline mode
    const users = getUsers();
    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase(),
    );

    if (!user) {
      throw new Error("Пользователь не найден");
    }

    const passwordHash = await hashPassword(password);
    if (user.passwordHash !== passwordHash) {
      throw new Error("Неверный пароль");
    }

    return { id: user.id, name: user.name, email: user.email };
  }
}

// --- Validation helpers ---

export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateRegistration({
  name,
  email,
  password,
  confirmPassword,
}) {
  const errors = {};

  if (!name || name.trim().length < 2) {
    errors.name = "Имя должно содержать минимум 2 символа";
  }

  if (!email) {
    errors.email = "Введите email";
  } else if (!validateEmail(email)) {
    errors.email = "Некорректный email";
  }

  if (!password) {
    errors.password = "Введите пароль";
  } else if (password.length < 6) {
    errors.password = "Пароль должен содержать минимум 6 символов";
  }

  if (password !== confirmPassword) {
    errors.confirmPassword = "Пароли не совпадают";
  }

  return errors;
}

export function validateLogin({ email, password }) {
  const errors = {};

  if (!email) {
    errors.email = "Введите email";
  } else if (!validateEmail(email)) {
    errors.email = "Некорректный email";
  }

  if (!password) {
    errors.password = "Введите пароль";
  }

  return errors;
}
