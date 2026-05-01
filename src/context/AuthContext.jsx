import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { setUnauthorizedHandler } from "../api/client.js";
import * as authApi from "../api/authApi.js";
import { clearSession, getStoredAccessToken, getStoredRefreshToken, getStoredUser, setSession } from "../api/storage.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const u = getStoredUser();
    const access = getStoredAccessToken();
    return u && access ? u : null;
  });

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
      navigate("/login", { replace: true });
    });
    return () => setUnauthorizedHandler(() => {});
  }, [navigate]);

  const login = useCallback(async (credentials) => {
    const data = await authApi.login(credentials);
    setUser(data.user);
    return data;
  }, []);

  const register = useCallback(async (payload) => {
    const data = await authApi.register(payload);
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(async () => {
    const rt = getStoredRefreshToken();
    try {
      if (rt) await authApi.logout(rt);
    } catch {
      clearSession();
    }
    setUser(null);
    navigate("/login", { replace: true });
  }, [navigate]);

  const skipLogoutRemote = useCallback(() => {
    clearSession();
    setUser(null);
    navigate("/login", { replace: true });
  }, [navigate]);

  /** After refresh in another tab / manual token update */
  const hydrateUserFromStorage = useCallback(() => {
    const u = getStoredUser();
    setUser(u && getStoredAccessToken() ? u : null);
  }, []);

  const applyTokenPayload = useCallback((data) => {
    if (data?.user && data?.tokens) {
      setSession({
        accessToken: data.tokens.accessToken,
        refreshToken: data.tokens.refreshToken,
        user: data.user,
      });
      setUser(data.user);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user && getStoredAccessToken()),
      login,
      register,
      logout,
      skipLogoutRemote,
      hydrateUserFromStorage,
      applyTokenPayload,
    }),
    [user, login, register, logout, skipLogoutRemote, hydrateUserFromStorage, applyTokenPayload]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
