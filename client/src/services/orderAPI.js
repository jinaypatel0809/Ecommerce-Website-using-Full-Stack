import { clearSession, getSession } from "./authAPI";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  const token = getSession()?.token;
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token || ""}`,
      ...options.headers,
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = response.status === 401
      ? "Your login session is missing or expired. Please sign in again, then retry."
      : data.message || "Order request failed.";
    const error = new Error(message);
    error.status = response.status;
    if (response.status === 401) clearSession();
    throw error;
  }
  return data;
}

export const createCheckoutOrder = (address) => request("/orders/checkout", {
  method: "POST",
  body: JSON.stringify({ address }),
});

export const getMyOrders = () => request("/orders");

export const cancelMyOrder = (orderId) => request(`/orders/${orderId}/cancel`, {
  method: "POST",
});

export const verifyCheckoutPayment = (orderId, payment) => request(`/orders/${orderId}/verify`, {
  method: "POST",
  body: JSON.stringify(payment),
});

export const getAdminOrders = () => request("/orders/admin");

export const updateOrderStatus = (orderId, status) => request(`/orders/admin/${orderId}/status`, {
  method: "PATCH",
  body: JSON.stringify({ status }),
});
