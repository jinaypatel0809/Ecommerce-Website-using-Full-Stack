import { getSession } from "./authAPI";

const API_URL = import.meta.env.VITE_API_URL || "https://ecommerce-website-using-full-stack.onrender.com/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || "Product request failed.");
    error.status = response.status;
    throw error;
  }
  return data;
}

const authHeaders = () => ({ Authorization: `Bearer ${getSession()?.token || ""}` });

export const getProducts = (category = "") => request(`/products${category ? `?category=${encodeURIComponent(category)}` : ""}`);
export const getProduct = (id) => request(`/products/${id}`);

export const createProduct = (formData) => request("/products", {
  method: "POST",
  headers: authHeaders(),
  body: formData,
});

export const updateProduct = (id, formData) => request(`/products/${id}`, {
  method: "PUT",
  headers: authHeaders(),
  body: formData,
});

export const deleteProduct = (id) => request(`/products/${id}`, {
  method: "DELETE",
  headers: authHeaders(),
});

export const setProductDeal = (id, isDeal, dealExpiresAt = null) => request(`/products/${id}/deal`, {
  method: "PATCH",
  headers: { ...authHeaders(), "Content-Type": "application/json" },
  body: JSON.stringify({ isDeal, dealExpiresAt }),
});

export const setProductBestSeller = (id, isBestSeller) => request(`/products/${id}/best-seller`, {
  method: "PATCH",
  headers: { ...authHeaders(), "Content-Type": "application/json" },
  body: JSON.stringify({ isBestSeller }),
});

export const setProductPopular = (id, isPopular) => request(`/products/${id}/popular`, {
  method: "PATCH",
  headers: { ...authHeaders(), "Content-Type": "application/json" },
  body: JSON.stringify({ isPopular }),
});

export const setProductNewLaunch = (id, isNewLaunch) => request(`/products/${id}/new-launch`, {
  method: "PATCH",
  headers: { ...authHeaders(), "Content-Type": "application/json" },
  body: JSON.stringify({ isNewLaunch }),
});

export const setProductUpcoming = (id, isUpcoming) => request(`/products/${id}/upcoming`, {
  method: "PATCH",
  headers: { ...authHeaders(), "Content-Type": "application/json" },
  body: JSON.stringify({ isUpcoming }),
});
