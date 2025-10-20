const KEY = "token";

export function setToken(t) { localStorage.setItem(KEY, t); }
export function getToken() { return localStorage.getItem(KEY); }
export function clearToken() { localStorage.removeItem(KEY); }

export async function api(path, opts={}) {
  const token = getToken();
  const res = await fetch(`http://localhost:4000/api${path}`, {
    ...opts,
    headers: {
      "Content-Type":"application/json",
      ...(opts.headers||{}),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
  if (!res.ok) throw new Error((await res.json()).error || "Request failed");
  return res.json();
}
