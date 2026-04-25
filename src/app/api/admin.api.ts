import { request } from "./api";
import type { ApiResponse } from "./api";

export const adminAuth = {
  login: (credentials: { email: string; password: string }) =>
    request("/admin/login", { method: "POST", body: credentials }),

  logout: () =>
    request("/admin/logout", { method: "POST" }),

  refreshAccessToken: () =>
    request("/admin/refresh/access-token", { method: "POST" }),
};

export const adminProductApi = {
  add: (formData: FormData) =>
    request("/admin/product/add", { method: "POST", body: formData }),

  edit: (id: string, formData: FormData) =>
    request(`/admin/product/edit/${id}`, { method: "PATCH", body: formData }),

  remove: (id: string) =>
    request(`/admin/product/remove/${id}`, { method: "DELETE" }),

  getAll: () =>
    request("/admin/product/fetch/all"),

  getById: (id: string) =>
    request(`/admin/product/fetch/${id}`),
};