import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../data/products';
import { toast } from 'sonner';

export interface CartItem {
  id: string; // unique cart item id (product.id + size)
  product: Product;
  size: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, size: string, quantity?: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('tuberose_cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('tuberose_cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Product, size: string, quantity: number = 1) => {
    setItems((prev) => {
      const cartItemId = `${product.id}-${size}`;
      const existingItem = prev.find((i) => i.id === cartItemId);
      if (existingItem) {
        toast.success(`Increased quantity of ${product.name}`);
        return prev.map((i) =>
          i.id === cartItemId ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      toast.success(`Added ${product.name} to cart!`);
      return [...prev, { id: cartItemId, product, size, quantity }];
    });
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) toast.success(`Removed ${item.product.name} from cart`);
      return prev.filter((i) => i.id !== id);
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(id);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
    toast.success('Cart cleared');
  };

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, subtotal }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
