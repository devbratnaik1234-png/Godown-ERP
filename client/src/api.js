const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const TOKEN_KEY = "godown_erp_token";

function getToken() {
  return localStorage.getItem(TOKEN_KEY) || "";
}

function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const token = getToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 && path !== "/auth/login") {
      setToken("");
    }
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
}

export const api = {
  getToken,
  logout: () => setToken(""),
  login: async (email, password) => {
    const data = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setToken(data.token);
    return data.user;
  },
  me: () => request("/auth/me"),
  list: (resource) => request(`/${resource}`),
  get: (resource, id) => request(`/${resource}/${id}`),
  create: (resource, data) =>
    request(`/${resource}`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (resource, id, data) =>
    request(`/${resource}/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  remove: (resource, id) =>
    request(`/${resource}/${id}`, {
      method: "DELETE",
    }),
  dashboard: () => request("/dashboard"),
};
