const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8787/api";
const TOKEN_KEY = "baytak.authToken.v2";

function authToken() {
  try {
    return window.localStorage.getItem(TOKEN_KEY) || "";
  } catch {
    return "";
  }
}

export function setPlatformAuthToken(token) {
  try {
    if (token) {
      window.localStorage.setItem(TOKEN_KEY, token);
    } else {
      window.localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // Local storage may be unavailable in restricted browsers.
  }
}

async function request(path, options = {}) {
  const token = authToken();
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    const text = await response.text();
    try {
      const parsed = JSON.parse(text);
      throw new Error(parsed.error || `API ${response.status}`);
    } catch (error) {
      if (error.message && error.message !== text) throw error;
      throw new Error(`API ${response.status}: ${text}`);
    }
  }

  return response.json();
}

export const platformApi = {
  bootstrap: () => request("/bootstrap"),
  login: (payload) => request("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  register: (payload) => request("/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  resendOtp: (payload) => request("/auth/resend-otp", { method: "POST", body: JSON.stringify(payload) }),
  verifyOtp: (payload) => request("/auth/verify-otp", { method: "POST", body: JSON.stringify(payload) }),
  createRequest: (payload) => request("/requests", { method: "POST", body: JSON.stringify(payload) }),
  acceptOffer: (offerId) => request(`/offers/${encodeURIComponent(offerId)}/accept`, { method: "POST" }),
  capturePayment: (paymentId) => request(`/payments/${encodeURIComponent(paymentId)}/capture`, { method: "POST" }),
  completeRequest: (requestId) => request(`/requests/${encodeURIComponent(requestId)}/complete`, { method: "POST" }),
  createReview: (payload) => request("/reviews", { method: "POST", body: JSON.stringify(payload) }),
  recordProviderDecision: (payload) => request("/provider-decisions", { method: "POST", body: JSON.stringify(payload) }),
  createProvider: (payload) => request("/providers", { method: "POST", body: JSON.stringify(payload) }),
  approveProvider: (providerId) => request(`/providers/${encodeURIComponent(providerId)}/approve`, { method: "POST" }),
  createCategory: (category) => request("/categories", { method: "POST", body: JSON.stringify({ category }) }),
  deleteAccount: (userId) => request(`/users/${encodeURIComponent(userId)}`, { method: "DELETE" })
};
