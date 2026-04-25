import { request } from "./api";

export interface IShippingAddressPayload {
  fullName:      string;
  phone:         string;
  houseNo?:      string;
  addressLine1:  string;
  addressLine2?: string;
  city:          string;
  state:         string;
  pincode:       string;
}

export interface IOrderItem {
  product:   string;
  name:      string;
  sizeLabel: string;
  price:     number;
  quantity:  number;
  image:     string;
}

export interface ICreateOrderResponse {
  razorpayOrderId: string;
  amount:          number;
  baseAmount:      number;
  shippingCost:    number;
  currency:        string;
  orderItems:      IOrderItem[];
  shippingAddress: IShippingAddressPayload;
}

export interface IVerifyPaymentPayload {
  razorpayOrderId:   string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  shippingAddress:   IShippingAddressPayload;
  orderItems:        IOrderItem[];
  baseAmount:        number;
  shippingCost:      number;
  totalAmount:       number;
  discount?:         { code: string; amount: number };
}

export const orderApi = {
  // Step 1 — create razorpay order
  create: (shippingAddress: IShippingAddressPayload) =>
    request<ICreateOrderResponse>("/order/user/create", {
      method: "POST",
      body:   { shippingAddress } as any,
    }),

  // Step 2 — verify payment + save order
  verify: (payload: IVerifyPaymentPayload) =>
    request<{ orderId: string }>("/order/user/verify", {
      method: "POST",
      body:   payload as any,
    }),

  getAll: () =>
    request("/order/user/all"),

  getById: (orderId: string) =>
    request(`/order/user/${orderId}`),
};