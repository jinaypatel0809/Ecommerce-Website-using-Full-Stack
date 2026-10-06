const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function parseResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Something went wrong. Please try again.");
  return data;
}

export async function registerAccount(formData) {
  const response = await fetch(`${API_URL}/auth/register`, { method: "POST", body: formData });
  return parseResponse(response);
}

export async function loginAccount(credentials) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  return parseResponse(response);
}

export async function updateProfile(formData) {
  const token = getSession()?.token;
  const response = await fetch(`${API_URL}/auth/profile`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token || ""}` },
    body: formData,
  });
  return parseResponse(response);
}

export function saveSession(data) {
  sessionStorage.setItem("authToken", data.token);
  sessionStorage.setItem("authUser", JSON.stringify(data.user));
}

export function updateSessionUser(user) {
  const token = sessionStorage.getItem("authToken");
  if (!token) throw new Error("Your session has expired. Please sign in again.");
  sessionStorage.setItem("authUser", JSON.stringify(user));
  window.dispatchEvent(new CustomEvent("auth-session-updated", { detail: { token, user } }));
}

export function getSession() {
  try {
    let token = sessionStorage.getItem("authToken");
    let storedUser = sessionStorage.getItem("authUser");

    if (!token || !storedUser) {
      const legacyToken = localStorage.getItem("authToken");
      const legacyUser = localStorage.getItem("authUser");
      if (legacyToken && legacyUser) {
        sessionStorage.setItem("authToken", legacyToken);
        sessionStorage.setItem("authUser", legacyUser);
        token = legacyToken;
        storedUser = legacyUser;
      }
      localStorage.removeItem("authToken");
      localStorage.removeItem("authUser");
    }

    const user = JSON.parse(storedUser);
    return token && user ? { token, user } : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  sessionStorage.removeItem("authToken");
  sessionStorage.removeItem("authUser");
  localStorage.removeItem("authToken");
  localStorage.removeItem("authUser");
}

export function getAssetUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//.test(path)) return path;
  return `${API_URL.replace(/\/api\/?$/, "")}${path}`;
}
