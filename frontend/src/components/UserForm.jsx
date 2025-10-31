import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE;
const token = localStorage.getItem("token");

export default function UserForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    role: "visitor",
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_BASE}/api/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      alert("User created successfully!");
      navigate("/dashboard-admin");
    } else {
      const err = await res.json().catch(() => ({}));
      alert(`Error: ${err.error || res.statusText}`);
    }
  };

  return (
    <div className="p-6 space-y-4 max-w-md mx-auto">
      <h1 className="text-xl font-semibold">Add New User</h1>
      <form className="space-y-3" onSubmit={handleSubmit}>
        <input
          name="first_name"
          placeholder="First name"
          className="input"
          onChange={handleChange}
        />
        <input
          name="last_name"
          placeholder="Last name"
          className="input"
          onChange={handleChange}
        />
        <input
          name="email"
          placeholder="Email"
          type="email"
          className="input"
          onChange={handleChange}
        />
        <input
          name="password"
          placeholder="Password"
          type="password"
          className="input"
          onChange={handleChange}
        />
        <select
          name="role"
          className="input"
          onChange={handleChange}
          value={form.role}
        >
          <option value="admin">Admin</option>
          <option value="employee">Employee</option>
          <option value="visitor">Visitor</option>
        </select>
        <button
          type="submit"
          className="btn bg-indigo-600 text-white w-full"
        >
          Save
        </button>
      </form>
    </div>
  );
}
