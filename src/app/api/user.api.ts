import { request } from "./api.ts";

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
    }),

  refreshAccessToken: () =>
    request("/user/refresh/access-token", {
      method: "POST",
      authContext: "user",
    }),
};

export const userProfileApi = {
  get: () =>
    request("/user/profile", { authContext: "user" }),

  update: (data: Record<string, any>) =>
    request("/user/profile/update", {
      method: "PATCH",
      body: data,
      authContext: "user",
    }),
};

export const userCartApi = {
  get: () =>
    request("/user/cart", { authContext: "user" }),

  add: (productId: string, quantity = 1) =>
    request("/user/cart/add", {
      method: "POST",
      body: { productId, quantity },
      authContext: "user",
    }),

  remove: (productId: string) =>
    request("/user/cart/remove", {
      method: "DELETE",
      body: { productId },
      authContext: "user",
    }),

  updateQuantity: (productId: string, quantity: number) =>
    request("/user/cart/update", {
      method: "PATCH",
      body: { productId, quantity },
      authContext: "user",
    }),

  merge: (anonymousCart: { productId: string; quantity: number }[]) =>
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