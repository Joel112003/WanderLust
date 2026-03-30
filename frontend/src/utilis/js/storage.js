export const safeGetItem = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item !== null ? item : defaultValue;
  } catch (error) {
    console.warn(`Failed to get localStorage item "${key}":`, error.message);
    return defaultValue;
  }
};

export const safeSetItem = (key, value) => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.warn(`Failed to set localStorage item "${key}":`, error.message);
    return false;
  }
};

export const safeRemoveItem = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn(`Failed to remove localStorage item "${key}":`, error.message);
    return false;
  }
};

export const parseJWT = (token) => {
  try {
    if (!token || typeof token !== 'string') return null;

    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = JSON.parse(atob(parts[1]));
    if (!payload) return null;

    return payload;
  } catch (error) {
    console.warn('Failed to parse JWT token:', error.message);
    return null;
  }
};

export const getCurrentUserId = () => {
  try {
    const token = safeGetItem('authToken');
    if (!token) return null;

    const payload = parseJWT(token);
    if (!payload) return null;

    if (payload.exp && payload.exp * 1000 < Date.now()) {
      safeRemoveItem('authToken');
      safeRemoveItem('user');
      return null;
    }

    return payload.id || payload._id || payload.userId || null;
  } catch (error) {
    console.warn('Failed to get current user ID:', error.message);
    return null;
  }
};

export const isAuthenticated = () => {
  const token = safeGetItem('authToken');
  if (!token) return false;

  const payload = parseJWT(token);
  if (!payload) return false;

  if (payload.exp && payload.exp * 1000 < Date.now()) {
    safeRemoveItem('authToken');
    safeRemoveItem('user');
    return false;
  }

  return true;
};

export const clearAuthData = () => {
  safeRemoveItem('authToken');
  safeRemoveItem('user');
};
