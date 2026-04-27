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
      authContext: "user",
    }),

  refreshAccessToken: () =>
    request("/user/refresh/access-token", {
      method: "POST",
      authContext: "user",
    }),
};

export const userProfileApi = {
  get: () =>
    request("/user/get/profile", {      
      authContext: "user",
    }),

  update: (data: Record<string, any>) =>
    request("/user/profile/update", {
      method: "PATCH",
      body: data,
      authContext: "user",
    }),

  addAddress: (address: Record<string, any>) =>
    request("/user/address/add", {    
      method: "POST",
      body: address,
      authContext: "user",
    }),
};

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

export const userOrderTrackingApi = {
  trackByAwb: (awb: string) =>
    request(`/user/order/track/${awb}`),
};

export interface TrackingActivity {
  date: string;
  activity: string;
  location: string;
  status: string;
}
 
export interface TrackingResult {
  awb: string;
  currentStatus: string;
  currentLocation: string;
  etd: string | null;
  activities: TrackingActivity[];
}

export const userCouponApi = {
  apply: (data: { code: string; cartAmount: number; cartCategories: string[] }) =>
    request<CouponResult>("/user/coupon/apply", {
      method: "POST",
      body: data,
      authContext: "user",
    }),
};
export interface CouponResult {
  code: string;
  discountAmount: number;
  finalAmount: number;
  typeOfCoupon: "flat" | "percentage";
  message: string;
}