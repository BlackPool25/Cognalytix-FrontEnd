import { clearSession, getStoredAccessToken, getStoredRefreshToken, setSession } from "./storage.js";

const API_BASE = import.meta.env.VITE_API_BASE ?? "";

let onUnauthorized = () => {};

export function setUnauthorizedHandler(fn) {
  onUnauthorized = typeof fn === "function" ? fn : () => {};
}

async function parseJson(res) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

let refreshPromise = null;

async function refreshTokens() {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) return false;

  if (!refreshPromise) {
    refreshPromise = (async () => {
      const res = await fetch(`${API_BASE}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      const data = await parseJson(res);
      if (!res.ok || !data?.tokens?.accessToken) {
        clearSession();
        onUnauthorized();
        return false;
      }
      setSession({
        accessToken: data.tokens.accessToken,
        refreshToken: data.tokens.refreshToken,
        user: data.user ?? undefined,
      });
      return true;
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

/**
 * Authenticated JSON API call. Retries once after refresh on 401.
 * For public routes use `publicJson` instead.
 */
export async function apiFetch(path, options = {}, retried = false) {
  const access = getStoredAccessToken();
  const headers = {
    Accept: "application/json",
    ...options.headers,
  };
  if (options.body !== undefined && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  if (access) {
    headers.Authorization = `Bearer ${access}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401 && !retried) {
    const ok = await refreshTokens();
    if (ok) return apiFetch(path, options, true);
    if (!getStoredRefreshToken()) {
      clearSession();
      onUnauthorized();
    }
    const errBody = await parseJson(res);
    const err = new Error(errBody?.message || "Unauthorized");
    err.status = 401;
    err.body = errBody;
    throw err;
  }

  return res;
}

export async function apiJson(path, options = {}) {
  const res = await apiFetch(path, options);
  if (res.status === 204) return null;
  const data = await parseJson(res);
  if (!res.ok) {
    const err = new Error(data?.message || res.statusText || "Request failed");
    err.status = res.status;
    err.body = data;
    throw err;
  }
  return data;
}

/** Unauthenticated JSON (register, login, refresh handled separately). */
export async function publicJson(path, options = {}) {
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...options.headers,
  };
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await parseJson(res);
  if (!res.ok) {
    const err = new Error(data?.message || res.statusText || "Request failed");
    err.status = res.status;
    err.body = data;
    throw err;
  }
  return data;
}
