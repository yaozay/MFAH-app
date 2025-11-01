import { useEffect, useState } from "react";
import { useAuth } from "../../lib/auth";

export default function GiftshopForm() {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    sku: "",
    name: "",
    category: "",
    price: "",
    quantity: "",
    image_url: "",
  });

  const API = import.meta.env.VITE_API_BASE;

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch(`${API}/api/giftshop`);
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("Error loading products:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [API]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.price) return alert("Name and price required.");

    const method = editing ? "PUT" : "POST";
    const url = editing
      ? `${API}/api/giftshop/${editing.product_id}`
      : `${API}/api/giftshop`;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          quantity: Number(form.quantity || 0),
        }),
      });

      if (!res.ok) throw new Error("Failed to save product");

      setForm({
        sku: "",
        name: "",
        category: "",
        price: "",
        quantity: "",
        image_url: "",
      });
      setEditing(null);

      const updated = await fetch(`${API}/api/giftshop`);
      setProducts(await updated.json());
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this product?")) return;
    try {
      await fetch(`${API}/api/giftshop/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(products.filter((p) => p.product_id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  }

  function handleEdit(p) {
    setEditing(p);
    setForm({
      sku: p.sku || "",
      name: p.name || "",
      category: p.category || "",
      price: p.price || "",
      quantity: p.quantity || "",
      image_url: p.image_url || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCancelEdit() {
    setEditing(null);
    setForm({
      sku: "",
      name: "",
      category: "",
      price: "",
      quantity: "",
      image_url: "",
    });
  }

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading gift shop inventory...
      </div>
    );

  return (
    <div className="p-8 bg-neutral-50 min-h-screen">
      <h1 className="text-3xl font-serif mb-6">
        {editing ? "Edit Product" : "Manage Gift Shop"}
      </h1>

      {/* ✅ FORM SECTION */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border rounded-xl shadow-sm p-6 mb-12"
      >
        <h2 className="text-lg font-serif font-medium mb-4 text-neutral-800">
          {editing ? "Edit Product" : "Add New Product"}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

          {["sku", "name", "category", "price", "quantity"].map((key) => (
            <div key={key} className="flex flex-col">
              <label className="text-sm font-serif text-neutral-700 mb-1">
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </label>
              <input
                type={key === "price" || key === "quantity" ? "number" : "text"}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="border rounded-md p-2 text-sm"
              />
            </div>
          ))}

          <div className="flex flex-col sm:col-span-2">
            <label className="text-sm font-serif text-neutral-700 mb-1">
              Image URL
            </label>
            <input
              type="text"
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              className="border rounded-md p-2 text-sm"
            />
          </div>

          {form.image_url && (
            <div className="sm:col-span-2 flex justify-center">
              <div className="w-40 h-40 rounded-lg border overflow-hidden bg-neutral-100 flex items-center justify-center">
                <img
                  src={form.image_url}
                  alt="Preview"
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
          )}
        </div>

        {/* ✅ BUTTONS */}
        <div className="flex gap-3 mt-8">
          <button
            type="submit"
            className="flex-1 bg-rose-600 text-white py-2 rounded-md hover:bg-rose-700 transition"
          >
            {editing ? "Save Changes" : "Add Product"}
          </button>
          {editing && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-md hover:bg-gray-400 transition"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* ✅ PRODUCT LIST */}
      <h2 className="text-lg font-serif mb-4">Current Products</h2>
      <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 max-w-7xl mx-auto">
        {products.map((p) => (
          <div
            key={p.product_id}
            className="border border-neutral-200 rounded-2xl bg-white shadow-sm hover:shadow-md transition p-4 flex flex-col"
          >
            <div className="aspect-[1/1] bg-neutral-100 rounded-xl mb-4 overflow-hidden flex items-center justify-center">
              {p.image_url ? (
                <img
                  src={
                    p.image_url.startsWith("http")
                      ? p.image_url
                      : `${API}${p.image_url}`
                  }
                  alt={p.name}
                  className="object-cover w-full h-full"
                />
              ) : (
                <span className="text-gray-400 text-sm">No image</span>
              )}
            </div>
            <h3 className="font-serif text-lg text-neutral-800 mb-1">
              {p.name}
            </h3>
            <p className="text-sm text-neutral-500 mb-2">
              {p.category || "General"}
            </p>
            <p className="font-medium text-rose-600 mb-1">
              ${Number(p.price).toFixed(2)}
            </p>
            <p className="text-sm text-gray-600 mb-3">Qty: {p.quantity}</p>
            <div className="flex gap-3 mt-auto">
              <button
                onClick={() => handleEdit(p)}
                className="flex-1 bg-gray-500 text-white rounded-md py-1 hover:bg-gray-600 text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(p.product_id)}
                className="flex-1 bg-red-500 text-white rounded-md py-1 hover:bg-red-600 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
