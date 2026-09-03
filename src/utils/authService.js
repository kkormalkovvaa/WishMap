import { registerUser as apiRegister, loginUser as apiLogin } from "./api.js";

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
  } catch (err) {
    // Rethrow server errors so the UI can display them
    // (localStorage fallback removed — on production the server should always be reachable)
    throw err;
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
  } catch (err) {
    // Rethrow server errors so the UI can display them
    throw err;
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
