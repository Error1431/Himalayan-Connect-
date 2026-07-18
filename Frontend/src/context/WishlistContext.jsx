import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const WishlistContext = createContext(null);

const STORAGE_KEY = 'himalayan_connect_wishlist';

const loadWishlist = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

// Wishlist item shape:
// { id, type: 'product' | 'room', name, price, unit, image, sellerId, sellerName }
export function WishlistProvider({ children }) {
  const [items, setItems] = useState(loadWishlist);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      // ignore quota errors
    }
  }, [items]);

  const isWishlisted = useCallback(
    (id, type) => items.some((i) => i.id === id && i.type === type),
    [items]
  );

  const addToWishlist = useCallback((item) => {
    setItems((prev) => {
      if (prev.some((i) => i.id === item.id && i.type === item.type)) return prev;
      return [...prev, item];
    });
  }, []);

  const removeFromWishlist = useCallback((id, type) => {
    setItems((prev) => prev.filter((i) => !(i.id === id && i.type === type)));
  }, []);

  const toggleWishlist = useCallback((item) => {
    setItems((prev) => {
      const exists = prev.some((i) => i.id === item.id && i.type === item.type);
      if (exists) {
        return prev.filter((i) => !(i.id === item.id && i.type === item.type));
      }
      return [...prev, item];
    });
  }, []);

  const clearWishlist = useCallback(() => setItems([]), []);

  const totalItems = useMemo(() => items.length, [items]);

  const value = {
    items,
    isWishlisted,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    clearWishlist,
    totalItems,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return ctx;
}
