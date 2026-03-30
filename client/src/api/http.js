import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const ACCESS_TOKEN_KEY = "topicflow_access_token";
const REFRESH_TOKEN_KEY = "topicflow_refresh_token";
const SESSION_MARKER_KEY = "topicflow_active_session";

export const getAccessToken = () => sessionStorage.getItem(ACCESS_TOKEN_KEY);

export const setAccessToken = (token) => {
  if (!token) {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    return;
  }

  sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
  sessionStorage.setItem(SESSION_MARKER_KEY, "true");
};

export const getRefreshToken = () => sessionStorage.getItem(REFRESH_TOKEN_KEY);

export const setRefreshToken = (token) => {
  if (!token) {
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    return;
  }

  sessionStorage.setItem(REFRESH_TOKEN_KEY, token);
  sessionStorage.setItem(SESSION_MARKER_KEY, "true");
};

export const hasSessionMarker = () => sessionStorage.getItem(SESSION_MARKER_KEY) === "true";

export const clearSession = () => {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  sessionStorage.removeItem(SESSION_MARKER_KEY);
};

let refreshHandler = null;
let authFailureHandler = null;

export const configureHttpAuth = ({ onRefresh, onAuthFailure }) => {
  refreshHandler = onRefresh;
  authFailureHandler = onAuthFailure;
};

export const http = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export const fileServerBaseUrl = API_BASE_URL.endsWith("/api") ? API_BASE_URL.slice(0, -4) : API_BASE_URL;

http.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error?.response?.status;

    if (!originalRequest || status !== 401) {
      return Promise.reject(error);
    }

    if (originalRequest._retry || originalRequest.url?.includes("/auth/refresh") || !hasSessionMarker() || !refreshHandler) {
      authFailureHandler?.();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const refreshResult = await refreshHandler();
      setAccessToken(refreshResult.accessToken);
      originalRequest.headers.Authorization = `Bearer ${refreshResult.accessToken}`;
      return http(originalRequest);
    } catch (refreshError) {
      authFailureHandler?.();
      return Promise.reject(refreshError);
    }
  }
);
