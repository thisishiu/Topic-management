import { http } from "./http";

export const approvalsApi = {
  pendingLecturer: () => http.get("/approvals/lecturer/pending"),
  pendingDepartment: () => http.get("/approvals/department/pending"),
  byTopic: (topicId) => http.get(`/approvals/topic/${topicId}`),
  decideLecturer: (topicId, payload) => http.post(`/approvals/lecturer/${topicId}`, payload),
  decideDepartment: (topicId, payload) => http.post(`/approvals/department/${topicId}`, payload),
};

export const formsApi = {
  list: (topicId) => http.get(`/forms/${topicId}/scores`),
  create: (topicId, payload) => http.post(`/forms/${topicId}/scores`, payload),
};

export const uploadsApi = {
  list: (topicId) => http.get(`/uploads/${topicId}/revision`),
  create: async (topicId, file, note) => {
    const form = new FormData();
    form.append("file", file);
    form.append("note", note || "");
    return http.post(`/uploads/${topicId}/revision`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export const committeesApi = {
  list: (topicId) => http.get(`/committees/${topicId}`),
  set: (topicId, payload) => http.post(`/committees/${topicId}`, payload),
};
