import { apiJson, publicJson } from "./client.js";
import { clearSession, setSession } from "./storage.js";

export async function login({ email, password }) {
  const data = await publicJson("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (data.tokens && data.user) {
    setSession({
      accessToken: data.tokens.accessToken,
      refreshToken: data.tokens.refreshToken,
      user: data.user,
    });
  }
  return data;
}

export async function register({ name, email, password }) {
  const data = await publicJson("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
  if (data.tokens && data.user) {
    setSession({
      accessToken: data.tokens.accessToken,
      refreshToken: data.tokens.refreshToken,
      user: data.user,
    });
  }
  return data;
}

export async function logout(refreshToken) {
  try {
    await apiJson("/api/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
  } finally {
    clearSession();
  }
}
