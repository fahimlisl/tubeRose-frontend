import { request } from "./api.ts";

export const adminProductApi = {
  add: (formData: FormData) =>
    request("/admin/product/add", { method: "POST", body: formData, authContext: "admin" }),

  edit: (id: string, formData: FormData) =>
    request(`/admin/product/edit/${id}`, { method: "PATCH", body: formData, authContext: "admin" }),

  remove: (id: string) =>
    request(`/admin/product/delete/${id}`, { method: "DELETE", authContext: "admin" }),

  getAll: () =>
    request("/admin/product/fetch/all", { authContext: "admin" }),

  getById: (id: string) =>
    request(`/admin/product/fetch/${id}`, { authContext: "admin" }),
};

export const adminAuth = {
  login: (credentials: { email: string; password: string }) =>
    request("/admin/login", { method: "POST", body: credentials, authContext: "admin" }),

  logout: () =>
    request("/admin/logout", { method: "POST", authContext: "admin" }),

  refreshAccessToken: () =>
    request("/admin/refresh/access-token", { method: "POST", authContext: "admin" }),
};