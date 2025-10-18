import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Signup() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const { firstName, lastName, email, password, confirmPassword } = formData;

    // Frontend validation
    if (!email || !password || !confirmPassword) {
      setError("Email and password are required");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role: "visitor" }), // role hardcoded for now
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Registration failed");
        return;
      }

      setSuccess("Account created successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);

    } catch (err) {
      console.error(err);
      setError("Server error, try again later.");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-12">
      <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-12">
        Houston Museum of Fine Arts
      </h1>

      <div className="w-full max-w-md bg-rose-200 rounded-3xl p-8 md:p-12 shadow-lg">
        <h2 className="text-4xl font-black text-center text-neutral-900 mb-10">
          SIGN UP
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            name="firstName"
            placeholder="FIRST NAME"
            value={formData.firstName}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gray-300 placeholder-gray-600 text-neutral-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 font-medium text-sm"
          />

          <input
            type="text"
            name="lastName"
            placeholder="LAST NAME"
            value={formData.lastName}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gray-300 placeholder-gray-600 text-neutral-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 font-medium text-sm"
          />

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

          <input
            type="password"
            name="confirmPassword"
            placeholder="CONFIRM PASSWORD"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gray-300 placeholder-gray-600 text-neutral-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 font-medium text-sm"
          />

          {error && <p className="text-red-600 text-sm">{error}</p>}
          {success && <p className="text-green-600 text-sm">{success}</p>}

          <button
            type="submit"
            className="w-full bg-gray-300 hover:bg-gray-400 text-neutral-900 font-bold py-3 rounded-lg transition text-sm"
          >
            CREATE ACCOUNT
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-neutral-900 text-sm font-medium">
            Already have an account?{" "}
            <Link to="/login" className="underline hover:no-underline font-bold">
              LOGIN
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
