import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth.jsx";

const API = import.meta.env.VITE_API_BASE;

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

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

      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      const { accessToken, user } = data;

      if (!accessToken || !user) {
        setError("Invalid response from server");
        return;
      }

      login(accessToken, user);

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
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-serif text-neutral-800 mb-3 tracking-wide">
            Houston Museum of Fine Arts
          </h1>
          <div className="w-16 h-px bg-neutral-300 mx-auto"></div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-10">
          <h2 className="text-2xl font-serif text-neutral-800 mb-8 text-center">
            Login
          </h2>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border-l-4 border-red-400 rounded">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 text-neutral-900 rounded focus:outline-none focus:ring-1 focus:ring-neutral-500 focus:border-neutral-500 transition"
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 text-neutral-900 rounded focus:outline-none focus:ring-1 focus:ring-neutral-500 focus:border-neutral-500 transition"
                autoComplete="current-password"
              />
            </div>

            <div className="text-right">
              <button
                type="button"
                className="text-sm text-neutral-600 hover:text-neutral-900 transition"
                onClick={() => alert("TODO: implement password reset")}
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-neutral-800 hover:bg-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded transition"
            >
              {loading ? "Logging in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-neutral-200 text-center">
            <p className="text-sm text-neutral-600">
              New to the museum?{" "}
              <Link
                to="/signup"
                className="text-neutral-800 font-medium hover:underline"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}