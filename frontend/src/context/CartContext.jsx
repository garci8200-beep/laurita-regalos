import { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);

  const addItem = (item) => {
    setItems(prev => {
      const existing = prev.find(p => p.id === item.id);
      if (existing) return prev.map(p => p.id === item.id ? { ...p, quantity: p.quantity + 1 } : p);
      return [...prev, { ...item, quantity: 1 }];
    });
  };
  const removeItem = (id) => setItems(prev => prev.filter(p => p.id !== id));
  const updateQty = (id, qty) => setItems(prev => prev.map(p => p.id === id ? { ...p, quantity: Math.max(1, qty) } : p));
  const clearCart = () => setItems([]);
  const total = items.reduce((s, it) => s + it.price * it.quantity, 0);
  const count = items.reduce((s, it) => s + it.quantity, 0);

  return <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, total, count }}>{children}</CartContext.Provider>;
};

export const useCart = () => useContext(CartContext);
