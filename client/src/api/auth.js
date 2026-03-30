import { http } from "./http";

export const authApi = {
  register: (payload) => http.post("/auth/register", payload),
  login: (payload) => http.post("/auth/login", payload),
  refresh: (payload) => http.post("/auth/refresh", payload),
  logout: (payload) => http.post("/auth/logout", payload),
};
