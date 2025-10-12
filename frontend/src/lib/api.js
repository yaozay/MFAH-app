const BASE = 'http://localhost:4000/api';

export async function api(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    let msg = 'Request failed';
    try {
        msg = (await res.json()).error || msg;
      } catch (e) {
        // intentionally ignored
      }
      
    throw new Error(msg);
  }
  return res.json();
}
