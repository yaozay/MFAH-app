import { useAuth } from "./auth";

// Hook version if you need inside components
export function useApi() {
  const { token } = useAuth();
  return (path, options = {}) =>
    fetch(`http://localhost:4000${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }).then(async (r) => {
      const data = await r.json().catch(() => null);
      if (!r.ok) throw data || { error: "Request failed" };
      return data;
    });
}

// Plain helper if you import directly (and manually pass token)
export async function api(path, options = {}, token) {
  const res = await fetch(`http://localhost:4000${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw data || { error: "Request failed" };
  return data;
}
