import { getSession } from "./authAPI";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const notifyCart = (cart) => {
  window.dispatchEvent(new CustomEvent("cart-updated", { detail: cart }));
  return cart;
};

async function request(path, options = {}) {
  const token = getSession()?.token;
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token || ""}`, ...options.headers },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Cart request failed.");
  if (data.cart) notifyCart(data.cart);
  return data;
}

export const getCart = () => request("/cart");
export const addToCart = (productId) => request("/cart/items", { method: "POST", body: JSON.stringify({ productId }) });
export const updateCartQuantity = (productId, quantity) => request(`/cart/items/${productId}`, { method: "PATCH", body: JSON.stringify({ quantity }) });
export const removeFromCart = (productId) => request(`/cart/items/${productId}`, { method: "DELETE" });
