const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }
  return data;
}

export const api = {
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
