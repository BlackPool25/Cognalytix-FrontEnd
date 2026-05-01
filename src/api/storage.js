const ACCESS = "cognalytix_access_token";
const REFRESH = "cognalytix_refresh_token";
const USER = "cognalytix_user";

export function getStoredAccessToken() {
  return localStorage.getItem(ACCESS);
}

export function getStoredRefreshToken() {
  return localStorage.getItem(REFRESH);
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setSession({ accessToken, refreshToken, user }) {
  if (accessToken) localStorage.setItem(ACCESS, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH, refreshToken);
  if (user) localStorage.setItem(USER, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(ACCESS);
  localStorage.removeItem(REFRESH);
  localStorage.removeItem(USER);
}
