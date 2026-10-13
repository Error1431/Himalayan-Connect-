import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const CartContext = createContext(null);

const STORAGE_KEY = 'himalayan_connect_cart';

const loadCart = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

// Cart item shape:
// { id, type: 'product' | 'room', name, price, unit, qty, image, sellerId, sellerName }
export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      // ignore quota errors
    }
  }, [items]);

  const addToCart = useCallback((item, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id && i.type === item.type);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id && i.type === item.type ? { ...i, qty: i.qty + qty } : i
        );
      }
      return [...prev, { ...item, qty }];
    });
  }, []);

  const removeFromCart = useCallback((id, type) => {
    setItems((prev) => prev.filter((i) => !(i.id === id && i.type === type)));
  }, []);

  const updateQty = useCallback((id, type, qty) => {
    setItems((prev) =>
      prev
        .map((i) => (i.id === id && i.type === type ? { ...i, qty: Math.max(1, qty) } : i))
        .filter((i) => i.qty > 0)
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const { totalItems, totalAmount } = useMemo(() => {
    return items.reduce(
      (acc, i) => ({
        totalItems: acc.totalItems + i.qty,
        totalAmount: acc.totalAmount + i.qty * (Number(i.price) || 0),
      }),
      { totalItems: 0, totalAmount: 0 }
    );
  }, [items]);

  const value = {
    items,
    addToCart,
    removeFromCart,
    updateQty,
    clearCart,
    totalItems,
    totalAmount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return ctx;
}
