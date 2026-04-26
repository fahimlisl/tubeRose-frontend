import { request } from "./api.ts";

// ── User Auth ─────────────────────────────────────────────────────────────────
// prefix: /api/v1/user
export const userAuthApi = {
  login: (data: { identifier: string; password: string }) => {
    const isPhone = /^\d{10}$/.test(data.identifier.trim());
    return request("/user/auth/login", {
      method: "POST",
      body: isPhone
        ? { phoneNumber: data.identifier, password: data.password }
        : { email: data.identifier, password: data.password },
    });
  },

  logout: () =>
    request("/user/auth/logout", {
      method: "POST",
      authContext: "user",
    }),

  refreshAccessToken: () =>
    request("/user/refresh/access-token", {
      method: "POST",
      authContext: "user",
    }),
};

// ── User Profile ──────────────────────────────────────────────────────────────
export const userProfileApi = {
  get: () =>
    request("/user/get/profile", {        // ← was /user/profile
      authContext: "user",
    }),

  update: (data: Record<string, any>) =>
    request("/user/profile/update", {
      method: "PATCH",
      body: data,
      authContext: "user",
    }),

  addAddress: (address: Record<string, any>) =>
    request("/user/address/add", {        // add this route on backend
      method: "POST",
      body: address,
      authContext: "user",
    }),
};

// ── User Cart ─────────────────────────────────────────────────────────────────
export const userCartApi = {
  get: () =>
    request("/user/cart", {
      authContext: "user",
    }),

  add: (productId: string, quantity = 1, sizeLabel: string) =>
    request("/user/cart/add", {
      method: "POST",
      body: { productId, quantity, sizeLabel },
      authContext: "user",
    }),

  remove: (productId: string, sizeLabel: string) =>
    request("/user/cart/remove", {
      method: "DELETE",
      body: { productId, sizeLabel },
      authContext: "user",
    }),

  updateQuantity: (productId: string, quantity: number, sizeLabel: string) =>
    request("/user/cart/update", {
      method: "PATCH",
      body: { productId, quantity, sizeLabel },
      authContext: "user",
    }),

  merge: (anonymousCart: { productId: string; quantity: number; sizeLabel: string }[]) =>
    request("/user/cart/merge", {
      method: "POST",
      body: { anonymousCart },
      authContext: "user",
    }),

  clear: () =>
    request("/user/cart/clear", {
      method: "DELETE",
      authContext: "user",
    }),
};

// ── User Orders ───────────────────────────────────────────────────────────────
// prefix: /api/v1/order
export const userOrderApi = {
  getAll: () =>
    request("/order/user/all", {
      authContext: "user",
    }),

  getById: (orderId: string) =>
    request(`/order/user/${orderId}`, {
      authContext: "user",
    }),
};