import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const email = formData.email.trim().toLowerCase();
    const password = formData.password.trim();

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      // Store JWT and user info
      localStorage.setItem("token", data.token);
      localStorage.setItem("userEmail", data.email);
      localStorage.setItem("userRole", data.role);
      localStorage.setItem("userId", data.id);

      setSuccess(`Welcome back, ${data.email}! Redirecting...`);
      setTimeout(() => navigate("/"), 1000);
    } catch (err) {
      console.error("Login error:", err);
      setError("Server error, please try again later.");
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
        {success && <p className="text-green-600 text-sm mb-4">{success}</p>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="email"
            name="email"
            placeholder="EMAIL"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gray-300 placeholder-gray-600 text-neutral-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 font-medium text-sm"
          />

          <input
            type="password"
            name="password"
            placeholder="PASSWORD"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gray-300 placeholder-gray-600 text-neutral-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 font-medium text-sm"
          />

          <div className="text-right">
            <button
              type="button"
              className="text-xs font-bold text-neutral-900 hover:underline"
            >
              FORGOT PASSWORD?
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-gray-300 hover:bg-gray-400 text-neutral-900 font-bold py-3 rounded-lg transition text-sm"
          >
            LOGIN
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-neutral-900 text-sm font-medium">
            Don't have an account?{" "}
            <Link to="/signup" className="underline hover:no-underline font-bold">
              CREATE ACCOUNT
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
