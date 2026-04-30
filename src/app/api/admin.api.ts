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
 
interface CouponPayload {
  code: string;
  typeOfCoupon: "flat" | "percentage";
  value: number;
  minCartAmount?: number;
  maxDiscount?: number;
  expiryDate?: string;
  isActive?: boolean;
  category: string;
  isForFirstTimeUser?: boolean;
  usageLimit?: number;
  perUserLimit?: number;
}

export const adminCouponApi = {
  add: (payload: CouponPayload) =>
    request("/admin/coupon/add", {
      method: "POST",
      body: payload,
      authContext: "admin",
    }),

  edit: (id: string, payload: Partial<CouponPayload>) =>
    request(`/admin/coupon/edit/${id}`, {
      method: "PATCH",
      body: payload,
      authContext: "admin",
    }),

  toggle: (id: string) =>
    request(`/admin/coupon/toggle/${id}`, {
      method: "PATCH",
      authContext: "admin",
    }),

  remove: (id: string) =>
    request(`/admin/coupon/delete/${id}`, {
      method: "DELETE",
      authContext: "admin",
    }),

  getAll: () =>
    request("/admin/coupon/all", {
      authContext: "admin",
    }),

  getById: (id: string) =>
    request(`/admin/coupon/${id}`, {
      authContext: "admin",
    }),
};

interface WalletSettingsPayload {
  walletCashbackEnabled?: boolean;
  walletCashbackPercent?: number;
  walletSpendingEnabled?: boolean;
  walletSpendingMaxPercent?: number;
  walletSpendingMaxFixedCap?: number;
  referralBonusEnabled?: boolean;
  referralBonusAmount?: number;
}
 
export const adminWalletSettingsApi = {
  get: () =>
    request("/admin/settings", { authContext: "admin" }),
  update: (payload: WalletSettingsPayload) =>
    request("/admin/settings", { method: "PUT", body: payload, authContext: "admin" }),
};
 
export const adminShippingApi = {
  getSettings: () =>
    request("/admin/shipping/settings", { authContext: "admin" }),
 
  updateSettings: (payload: {
    freeShippingEnabled?:   boolean;
    freeShippingThreshold?: number;
    defaultShippingCost?:   number;
  }) =>
    request("/admin/shipping/settings", {
      method:      "PATCH",
      body:        payload,
      authContext: "admin",
    }),
};

interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export const adminAuthSettings = {
  changePassword: (payload: ChangePasswordPayload) =>
    request("/admin/change/password", {
      method: "POST",
      body: payload,
      authContext: "admin",
    }),
};