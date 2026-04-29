import { request } from "./api.ts";

export const publicProductApi = {
  getAll: () => request("/public/fetch/product/all"),
  getById: (id: string) => request(`/public/fetch/product/${id}`),
};

export const publicAuthApi = {
  checkPhoneNumber: (phoneNumber: string) =>
    request("/public/auth/check/phone-number", {
      method: "POST",
      body: { phoneNumber },
    }),

  sendOtp: () =>
    request("/public/auth/otp/send", {
      method: "POST",
    }),

  verifyOtp: (otp: string) =>
    request("/public/auth/otp/verify", {
      method: "POST",
      body: { otp },
    }),

  register: (data: { name: string; email: string; password: string }) =>
    request("/public/auth/user/signup", {
      method: "POST",
      body: data,
    }),

  applyReferralCode: (referralCode: string) =>
    request("/public/apply/coupon/referral", {
      method: "POST",
      body: { referralCode },
    }),
};

export const publicShippingApi = {
  checkServiceability: (pincode: string) =>
    request(`/public/check/serviceability?pincode=${pincode}`),
};

export const publicBannerApi = {
  getActive: () => request("/public/banner/fetch/active"),
};

export const publicForgotPasswordApi = {
  sendOtp: (data: { email?: string; phoneNumber?: string }) =>
    request("/public/user/forgot-password/send-otp", { method: "POST", body: data }),
  // need to write route and controller for resending 
  resetPassword: (data: { otp: string; newPassword: string; confirmNewPassword: string }) =>
    request("/public/user/forgot-password/verify-otp", { method: "POST", body: data }),
   verifyOtp: (data: { otp: string; newPassword: string; confirmNewPassword: string }) =>
    request("/public/user/forgot-password/verify-otp", { method: "POST", body: data }),
};