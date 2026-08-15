const STORAGE_KEY = 'wishmap_state';

const PERSISTED_SLICES = ['wishes', 'categories', 'auth'];

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);
    const result = {};
    for (const key of PERSISTED_SLICES) {
      if (key in parsed) {
        result[key] = parsed[key];
      }
    }
    return Object.keys(result).length > 0 ? result : undefined;
  } catch {
    return undefined;
  }
}

let saveTimeout = null;

export function saveState(state) {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    try {
      const toSave = {};
      for (const key of PERSISTED_SLICES) {
        if (key in state) {
          toSave[key] = state[key];
        }
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch {
      // quota exceeded или другая ошибка — игнорируем
    }
  }, 300);
}

export const localStorageMiddleware = (storeApi) => (next) => (action) => {
  const result = next(action);
  saveState(storeApi.getState());
  return result;
};
