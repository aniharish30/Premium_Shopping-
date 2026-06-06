import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../utils/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart]     = useState({ items: [] });
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) { setCart({ items: [] }); return; }
    try {
      const { data } = await api.get("/cart");
      setCart(data.cart || { items: [] });
    } catch {
      setCart({ items: [] });
    }
  }, [isAuthenticated]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    setLoading(true);
    try {
      const { data } = await api.post("/cart/add", { productId, quantity });
      setCart(data.cart);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || "Failed to add to cart" };
    } finally { setLoading(false); }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      const { data } = await api.put(`/cart/update/${itemId}`, { quantity });
      setCart(data.cart);
    } catch (err) { console.error(err); }
  };

  const removeFromCart = async (itemId) => {
    try {
      const { data } = await api.delete(`/cart/remove/${itemId}`);
      setCart(data.cart);
    } catch (err) { console.error(err); }
  };

  const clearCart = async () => {
    try {
      await api.delete("/cart/clear");
      setCart({ items: [] });
    } catch {}
  };

  const cartCount = cart.items?.reduce((s, i) => s + i.quantity, 0) || 0;
  const cartTotal = cart.items?.reduce((s, i) => s + i.price * i.quantity, 0) || 0;

  return (
    <CartContext.Provider value={{ cart, cartCount, cartTotal, loading, addToCart, updateQuantity, removeFromCart, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be inside CartProvider");
  return ctx;
};
