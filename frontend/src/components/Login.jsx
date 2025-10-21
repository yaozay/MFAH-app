import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth.jsx"; 

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth(); // from AuthContext

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const email = formData.email.trim().toLowerCase();
    const password = formData.password.trim();

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("http://localhost:4000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      // ✅ backend returns { accessToken, user }
      const { accessToken, user } = data;

      if (!accessToken || !user) {
        setError("Invalid response from server");
        return;
      }

      // ✅ save to context/localStorage
      login(accessToken, user);

      // ✅ redirect by role
      if (user.role === "admin") navigate("/admin");
      else if (user.role === "employee") navigate("/employee");
      else navigate("/visitor");

    } catch (err) {
      console.error("Login error:", err);
      setError("Server error, please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-12">
      <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-12">
        Houston Museum of Fine Arts
      </h1>

      <div className="w-full max-w-md bg-rose-200 rounded-3xl p-8 md:p-12 shadow-lg">
        <h2 className="text-4xl font-black text-center text-neutral-900 mb-10">
          LOGIN
        </h2>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="email"
            name="email"
            placeholder="EMAIL"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gray-300 placeholder-gray-600 text-neutral-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 font-medium text-sm"
            autoComplete="email"
          />

          <input
            type="password"
            name="password"
            placeholder="PASSWORD"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gray-300 placeholder-gray-600 text-neutral-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 font-medium text-sm"
            autoComplete="current-password"
          />

          <div className="text-right">
            <button
              type="button"
              className="text-xs font-bold text-neutral-900 hover:underline"
              onClick={() => alert("TODO: implement password reset")}
            >
              FORGOT PASSWORD?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-300 hover:bg-gray-400 disabled:opacity-60 text-neutral-900 font-bold py-3 rounded-lg transition text-sm"
          >
            {loading ? "Logging in..." : "LOGIN"}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-neutral-900 text-sm font-medium">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="underline hover:no-underline font-bold"
            >
              CREATE ACCOUNT
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
