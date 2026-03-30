import { createContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { authApi } from "../api/auth";
import {
  clearSession,
  configureHttpAuth,
  getRefreshToken,
  hasSessionMarker,
  setAccessToken,
  setRefreshToken,
} from "../api/http";

export const AuthContext = createContext({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

const USER_KEY = "topicflow_current_user";

export const AuthProvider = ({ children }) => {
  const didBootstrapRef = useRef(false);
  const refreshInFlightRef = useRef(null);

  const [user, setUser] = useState(() => {
    const raw = sessionStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(true);

  const storeUser = useCallback((nextUser) => {
    setUser(nextUser);
    if (nextUser) {
      sessionStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    } else {
      sessionStorage.removeItem(USER_KEY);
    }
  }, []);

  const login = useCallback(async (payload) => {
    const { data } = await authApi.login(payload);
    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);
    storeUser(data.user);
    return data.user;
  }, [storeUser]);

  const register = useCallback(async (payload) => {
    const { data } = await authApi.register(payload);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout({ refreshToken: getRefreshToken() });
    } finally {
      clearSession();
      storeUser(null);
    }
  }, [storeUser]);

  const refreshAuth = useCallback(async () => {
    if (refreshInFlightRef.current) {
      return refreshInFlightRef.current;
    }

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      throw new Error("Missing refresh token for current tab");
    }

    const refreshPromise = authApi
      .refresh({ refreshToken })
      .then(({ data }) => {
        setAccessToken(data.accessToken);
        setRefreshToken(data.refreshToken);
        storeUser(data.user);
        return data;
      })
      .finally(() => {
        refreshInFlightRef.current = null;
      });

    refreshInFlightRef.current = refreshPromise;
    return refreshPromise;
  }, [storeUser]);

  useEffect(() => {
    if (didBootstrapRef.current) {
      return;
    }
    didBootstrapRef.current = true;

    const bootstrap = async () => {
      try {
        // Keep session isolated per tab: only tabs with prior marker attempt silent refresh.
        if (!hasSessionMarker()) {
          setLoading(false);
          return;
        }

        await refreshAuth();
      } catch {
        clearSession();
        storeUser(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [storeUser, refreshAuth]);

  useEffect(() => {
    configureHttpAuth({
      onRefresh: refreshAuth,
      onAuthFailure: () => {
        clearSession();
        storeUser(null);
      },
    });
  }, [refreshAuth, storeUser]);

  const value = useMemo(() => ({ user, loading, login, register, logout }), [user, loading, login, register, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
