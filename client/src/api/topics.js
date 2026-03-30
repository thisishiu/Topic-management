import { http } from "./http";

export const topicsApi = {
  list: () => http.get("/topics"),
  create: (payload) => http.post("/topics", payload),
  update: (topicId, payload) => http.patch(`/topics/${topicId}`, payload),
};

export const usersApi = {
  list: (role) => http.get("/users", { params: role ? { role } : undefined }),
};

export const progressApi = {
  list: (topicId) => http.get(`/progress/${topicId}/entries`),
  create: (topicId, payload) => http.post(`/progress/${topicId}/entries`, payload),
};
