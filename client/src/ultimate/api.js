const base = import.meta.env.VITE_API_URL || "/api";
export async function request(path, { method = "GET", body, key } = {}) {
  let response;
  try {
    response = await fetch(`${base}${path}`, {
      method,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(key ? { "Idempotency-Key": key } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    throw Object.assign(new Error("NETWORK_ERROR"), { code: "NETWORK_ERROR" });
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && path !== "/auth/login")
      window.dispatchEvent(new Event("paddysync:logout"));
    throw Object.assign(new Error(data.code || "INTERNAL_ERROR"), {
      code: data.code || "INTERNAL_ERROR",
    });
  }
  return data;
}
export const v2 = (path, options) => request(`/v2${path}`, options);
