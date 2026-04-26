import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from './useAuth';
import { userCartApi } from '../api/user.api.ts';

export interface CartProduct {
  _id: string;
  title: string;
  category: string;
  image: { url: string; public_id: string; isThumbnail: boolean; _id: string }[];
  sizes: {
    _id: string;
    label: string;
    unit: string;
    basePrice?: number;
    finalPrice: number;
    stock: number;
  }[];
}

export interface CartItem {
  id: string;
  product: CartProduct;
  sizeLabel: string;
  finalPrice: number;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  isCartLoading: boolean;
  addToCart: (product: CartProduct, sizeLabel: string, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string, sizeLabel: string) => Promise<void>;
  updateQuantity: (productId: string, sizeLabel: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const ANON_CART_KEY = 'tuberose_cart';

const buildCartItem = (dbItem: any): CartItem | null => {
  const product = dbItem.product;
  if (!product?._id) return null;

  const sizeLabel = dbItem.sizeLabel;
  if (!sizeLabel) return null;

  const sizeVariant = product.sizes?.find((s: any) => s.label === sizeLabel);
  if (!sizeVariant) return null;

  return {
    id: `${product._id}-${sizeLabel}`,
    product,
    sizeLabel,
    finalPrice: sizeVariant.finalPrice,
    quantity: dbItem.quantity,
  };
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();

  const [items, setItems]                 = useState<CartItem[]>([]);
  const [isCartLoading, setIsCartLoading] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (user) {
      loadDbCart();
    } else {
      loadLocalCart();
    }
  }, [user, authLoading]);

  const loadLocalCart = () => {
    try {
      const saved = localStorage.getItem(ANON_CART_KEY);
      setItems(saved ? JSON.parse(saved) : []);
    } catch {
      setItems([]);
    }
  };

  const loadDbCart = async () => {
    setIsCartLoading(true);
    try {
      const res = await userCartApi.get();
      const mapped = (res.data ?? [])
        .map(buildCartItem)
        .filter(Boolean) as CartItem[];
      setItems(mapped);
    } catch {
      setItems([]);
    } finally {
      setIsCartLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      localStorage.setItem(ANON_CART_KEY, JSON.stringify(items));
    }
  }, [items, user, authLoading]);

  const addToCart = async (
    product: CartProduct,
    sizeLabel: string,
    quantity = 1
  ) => {
    const sizeVariant = product.sizes.find((s) => s.label === sizeLabel);
    if (!sizeVariant) { toast.error("Size not found."); return; }
    if (sizeVariant.stock === 0) { toast.error("Out of stock."); return; }

    if (user) {
      try {
        console.log(sizeLabel)
        await userCartApi.add(product._id, quantity,sizeLabel);
        await loadDbCart();
        toast.success(`${product.title} added to cart!`);
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to add to cart.");
      }
    } else {
      const cartItemId = `${product._id}-${sizeLabel}`;
      setItems((prev) => {
        const existing = prev.find((i) => i.id === cartItemId);

        if (existing) {
          if (existing.quantity + quantity > sizeVariant.stock) {
            toast.error(`Only ${sizeVariant.stock} units available.`);
            return prev;
          }
          toast.success(`Increased quantity of ${product.title}`);
          return prev.map((i) =>
            i.id === cartItemId
              ? { ...i, quantity: i.quantity + quantity }
              : i
          );
        }

        toast.success(`${product.title} added to cart!`);
        return [
          ...prev,
          {
            id: cartItemId,
            product,
            sizeLabel,
            finalPrice: sizeVariant.finalPrice,
            quantity,
          },
        ];
      });
    }
  };

  const removeFromCart = async (productId: string, sizeLabel: string) => {
    if (user) {
      try {
        await userCartApi.remove(productId, sizeLabel);
        setItems((prev) =>
          prev.filter((i) => !(i.product._id === productId && i.sizeLabel === sizeLabel))
        );
        toast.success("Item removed from cart.");
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to remove item.");
      }
    } else {
      setItems((prev) => {
        const item = prev.find(
          (i) => i.product._id === productId && i.sizeLabel === sizeLabel
        );
        if (item) toast.success(`Removed ${item.product.title} from cart.`);
        return prev.filter(
          (i) => !(i.product._id === productId && i.sizeLabel === sizeLabel)
        );
      });
    }
  };

  const updateQuantity = async (
    productId: string,
    sizeLabel: string,
    quantity: number
  ) => {
    if (quantity < 1) {
      await removeFromCart(productId, sizeLabel);
      return;
    }

    if (user) {
      try {
        await userCartApi.updateQuantity(productId, quantity, sizeLabel);
        setItems((prev) =>
          prev.map((i) =>
            i.product._id === productId && i.sizeLabel === sizeLabel
              ? { ...i, quantity }
              : i
          )
        );
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to update quantity.");
      }
    } else {
      setItems((prev) => {
        const item = prev.find(
          (i) => i.product._id === productId && i.sizeLabel === sizeLabel
        );
        const sizeVariant = item?.product.sizes.find((s) => s.label === sizeLabel);
        if (sizeVariant && quantity > sizeVariant.stock) {
          toast.error(`Only ${sizeVariant.stock} units available.`);
          return prev;
        }
        return prev.map((i) =>
          i.product._id === productId && i.sizeLabel === sizeLabel
            ? { ...i, quantity }
            : i
        );
      });
    }
  };

  const clearCart = async () => {
    if (user) {
      try {
        await userCartApi.clear();
      } catch {
      }
    }
    setItems([]);
    localStorage.removeItem(ANON_CART_KEY);
    toast.success("Cart cleared.");
  };

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal   = items.reduce(
    (acc, item) => acc + item.finalPrice * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        isCartLoading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}