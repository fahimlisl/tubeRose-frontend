import { request } from "./api.ts";

interface BannerPayload {
  message: string;
  priority?: number;
  bgColor?: string;
  startDate?: string;
  endDate?: string;
}

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

export const adminOrderApi = {
  getAll: () =>
    request("/order/admin/all", { authContext: "admin" }),
  getById: (orderId: string) => 
    request(`/order/admin/${orderId}`, { authContext: "admin" }),
};


export const adminBannerApi = {
  add: (payload: BannerPayload) =>
    request("/admin/banner/add", { method: "POST", body: payload, authContext: "admin" }),

  edit: (id: string, payload: Partial<BannerPayload>) =>
    request(`/admin/banner/edit/${id}`, { method: "PATCH", body: payload, authContext: "admin" }),

  toggle: (id: string) =>
    request(`/admin/banner/toggle/${id}`, { method: "PATCH", authContext: "admin" }),

  remove: (id: string) =>
    request(`/admin/banner/delete/${id}`, { method: "DELETE", authContext: "admin" }),

  getAll: () =>
    request("/admin/banner/fetch/all", { authContext: "admin" }),
};