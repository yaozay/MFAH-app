import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const API_BASE = "http://localhost:4000";

export default function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(!!token);

  useEffect(() => {
    let ignore = false;
    async function loadMe() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const u = data?.user ?? data ?? null;
        if (!ignore && u) {
          setUser(u);
          localStorage.setItem("user", JSON.stringify(u));
        } else if (!ignore) {
          setToken(null);
          setUser(null);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      } catch {
        if (!ignore) {
          setToken(null);
          setUser(null);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    loadMe();
    return () => { ignore = true; };
  }, [token]);

  function login(accessToken, userObj) {
    setToken(accessToken);
    setUser(userObj);
    localStorage.setItem("token", accessToken);
    localStorage.setItem("user", JSON.stringify(userObj));
  }

  function logout() {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  return (
    <AuthContext.Provider value={{ token, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
