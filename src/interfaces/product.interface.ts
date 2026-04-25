export interface ISizeVariant {
  _id: string;
  label: "15ml" | "30ml" | "50ml" | "100ml" | "200ml" | "15g" | "30g" | "50g" | "100g" | "200g";
  unit: "ml" | "g";
  basePrice?: number;
  finalPrice: number;
  stock: number;
}

export interface IProductDetail {
  _id?: string;
  title: string;
}

export interface IProductImage {
  _id?: string;
  url: string;
  public_id: string;
  isThumbnail: boolean;
}

export interface IProduct {
  _id: string;
  title: string;
  category: string;
  description: string;
  image: IProductImage[];
  skinType: ("oily" | "dry" | "combination" | "sensitive" | "normal")[];
  sizes: ISizeVariant[];
  productDetails: IProductDetail[];
  createdAt: string;
  updatedAt: string;
}


export function getThumbnail(images: IProductImage[]): string {
  if (!images?.length) return "";
  return (images.find((img) => img.isThumbnail) ?? images[0]).url;
}

export function getBasePrice(sizes: ISizeVariant[]): number {
  if (!sizes?.length) return 0;
  return Math.min(...sizes.map((s) => s.finalPrice));
}