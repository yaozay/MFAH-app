import { useEffect, useState } from "react";
const API = import.meta.env.VITE_API_BASE;

export default function TicketTypesPane() {
  const token = localStorage.getItem("token");
  const [types, setTypes] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    total_price: "",
    is_active: 1,
  });

  const fetchTypes = async () => {
    const res = await fetch(`${API}/api/tickets/all`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setTypes(await res.json());
  };

  useEffect(() => { fetchTypes(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `${API}/api/tickets/${editingId}` : `${API}/api/tickets`;

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    });

    setEditingId(null);
    setForm({ name: "", description: "", total_price: "", is_active: 1 });
    fetchTypes();
  };

  const edit = (t) => {
    setEditingId(t.ticket_type_id);
    setForm(t);
  };

  const remove = async (id) => {
    if (!confirm("Delete ticket type?")) return;
    await fetch(`${API}/api/tickets/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchTypes();
  };

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold">Ticket Types</h2>

      <form onSubmit={save} className="space-y-2">
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} className="border px-2 py-1" />
        <input name="description" placeholder="Description" value={form.description} onChange={handleChange} className="border px-2 py-1" />
        <input name="total_price" placeholder="Price" value={form.total_price} onChange={handleChange} className="border px-2 py-1" />
        <select name="is_active" value={form.is_active} onChange={handleChange} className="border px-2 py-1">
          <option value={1}>Active</option>
          <option value={0}>Inactive</option>
        </select>

        <button className="bg-rose-500 text-white px-4 py-2 rounded">
          {editingId ? "Update" : "Create"}
        </button>
      </form>

      <table className="min-w-full border text-sm">
        <thead className="bg-neutral-100">
          <tr>
            <th className="px-2 py-1">Name</th>
            <th className="px-2 py-1">Price</th>
            <th className="px-2 py-1">Active</th>
            <th className="px-2 py-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          {types.map((t) => (
            <tr key={t.ticket_type_id} className="border-t">
              <td className="px-2 py-1">{t.name}</td>
              <td className="px-2 py-1">${t.total_price}</td>
              <td className="px-2 py-1">{t.is_active ? "Yes" : "No"}</td>
              <td className="px-2 py-1 space-x-2">
                <button onClick={() => edit(t)} className="text-blue-600 text-xs">Edit</button>
                <button onClick={() => remove(t.ticket_type_id)} className="text-red-600 text-xs">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}