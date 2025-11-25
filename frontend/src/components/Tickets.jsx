import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { useCart } from "./Cart/CartContext.jsx";

const API_BASE = import.meta.env.VITE_API_BASE;

export default function Tickets() {
  const [selectedTickets, setSelectedTickets] = useState({});
  const { user, token } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [ticketTypes, setTicketTypes] = useState([]);
  const [manage, setManage] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // ticket or null

  const headersAuth = useMemo(
    () => ({
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }),
    [token]
  );

  useEffect(() => {
    fetch(`${API_BASE}/api/tickets/types`)
      .then((res) => res.json())
      .then((data) => {
        setTicketTypes(data);
      })
      .catch((err) => console.error("Error loading tickets:", err));
  }, []);

  const handleQuantityChange = (id, quantity) => {
    setSelectedTickets((prev) => ({
      ...prev,
      [id]: Math.max(0, quantity),
    }));
  };

  const subtotal = Object.entries(selectedTickets).reduce(
    (sum, [id, qty]) => {
      const ticket = ticketTypes.find((t) => t.id === parseInt(id));
      return sum + (ticket ? ticket.total_price * qty : 0);
    },
    0
  );

  const TX_SALES_TAX = 0.0825;
  const salesTax = parseFloat((subtotal * TX_SALES_TAX).toFixed(2));
  const total = parseFloat((subtotal + salesTax).toFixed(2));

  const handleCheckout = () => {
    if (!user) {
      navigate("/login", { state: { from: "/tickets" } });
      return;
    }
    Object.entries(selectedTickets).forEach(([id, qty]) => {
      if (qty > 0) {
        const t = ticketTypes.find((ticket) => ticket.id === parseInt(id));
        addToCart(
          {
            id: t.id,
            name: t.name,
            price: t.total_price,
            qty,
          },
          "ticket"
        );
      }
    });

    navigate("/cart");
  };

  // Admin actions
  const openCreate = () => {
    setEditing({
      id: null,
      name: "",
      description: "",
      total_price: "",
      is_active: 1,
      is_featured: 0,
    });
    setModalOpen(true);
  };

  const openEdit = (ticket) => {
    setEditing(ticket);
    setModalOpen(true);
  };

  const saveTicket = async () => {
    if (!editing) return;
    const body = { ...editing };
    setModalOpen(false);
    setEditing(null);

    try {
      if (body.id == null) {
        const res = await fetch(`${API_BASE}/api/tickets/types`, {
          method: "POST",
          headers: headersAuth,
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) return alert(data.message || "Ticket creation failed");
      } else {
        const res = await fetch(`${API_BASE}/api/tickets/types/${body.id}`, {
          method: "PUT",
          headers: headersAuth,
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) return alert(data.message || "Ticket update failed");
      }

      setTicketTypes((prev) =>
        prev.map((t) => (t.id === body.id ? body : t))
      );
    } catch (err) {
      console.error(err);
      alert("An error occurred while saving ticket");
    }
  };

  const deleteTicket = async (ticketId) => {
    if (!confirm("Are you sure you want to delete this ticket?")) return;

    try {
      const res = await fetch(`${API_BASE}/api/tickets/types/${ticketId}`, {
        method: "DELETE",
        headers: headersAuth,
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.message || "Ticket deletion failed");
      } else {
        setTicketTypes((prev) => prev.filter((t) => t.id !== ticketId));
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while deleting ticket");
    }
  };

  const handleAddToCart = () => {
    if (!user) {
      navigate("/login", { state: { from: "/tickets" } });
      return;
    }

    let addedSomething = false;

    Object.entries(selectedTickets).forEach(([id, qty]) => {
      if (qty > 0) {
        const t = ticketTypes.find((ticket) => ticket.id === parseInt(id));
        addToCart(
          {
            id: t.id,
            name: t.name,
            price: t.total_price,
            qty,
          },
          "ticket"
        );
        addedSomething = true;
      }
    });
  };

  return (
    <div className="min-h-screen bg-neutral-100 py-16 px-6">
      {/* Admin Mode Toggle */}
      {user?.role === "admin" && (
      <div className="mb-8 flex justify-center">
        <div className="w-full sm:w-3/4 lg:w-1/2 flex items-center justify-between">
          <div>
            <p className="text-sm font-serif text-neutral-900">
              {manage ? "You’re managing tickets" : "Ticket options"}
            </p>
            <p className="text-xs text-neutral-500 mt-0.5">
              {manage
                ? "Edit or delete ticket types below."
                : "Switch to manage mode to update tickets."}
            </p>
          </div>
          {/* buttons stay the same */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setManage((prev) => !prev)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition
                ${
                  manage
                    ? "bg-neutral-900 text-white border-neutral-900 shadow-sm"
                    : "bg-white text-neutral-800 border-neutral-300 hover:border-neutral-500 hover:bg-neutral-50"
                }`}
            >
              <span>{manage ? "Exit manage mode" : "Manage tickets"}</span>
            </button>

            {manage && (
              <button
                onClick={openCreate}
                className="inline-flex items-center gap-2 rounded-full bg-rose-600 text-white text-sm font-medium px-4 py-2 shadow-sm hover:bg-rose-700 transition"
              >
                <span className="text-base leading-none">＋</span>
                <span>New ticket</span>
              </button>
            )}
          </div>
        </div>
      </div>
    )}


      {/* Tickets List */}
      <div className="flex flex-col items-center gap-6">
        {ticketTypes.map((ticket) => (
          <div
            key={ticket.id}
            className="ticket-item w-full sm:w-3/4 lg:w-1/2 bg-white rounded-lg shadow-md p-6 border border-black hover:shadow-lg transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-4">
              <div className="flex-1">
                <h2 className="text-xl font-semibold font-sans text-neutral-800 mb-1">
                  {ticket.name}
                </h2>
                <p className="text-sm text-neutral-600">
                  {ticket.description}
                </p>
              </div>
              <span className="text-3xl font-bold text-neutral-800">
                ${ticket.total_price}
              </span>
            </div>

            <div className="flex justify-end items-center gap-0 pt-4 border-t border-neutral-200">
              <label className="text-sm font-medium text-neutral-700 mr-2">
                Quantity:
              </label>
              <div className="flex items-center gap-0 border-2 border-neutral-200 rounded-lg overflow-hidden">
                <button
                  onClick={() =>
                    handleQuantityChange(
                      ticket.id,
                      (selectedTickets[ticket.id] || 0) - 1
                    )
                  }
                  className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 transition"
                >
                  −
                </button>
                <input
                  type="number"
                  value={selectedTickets[ticket.id] || 0}
                  onChange={(e) =>
                    handleQuantityChange(
                      ticket.id,
                      parseInt(e.target.value) || 0
                    )
                  }
                  className="w-16 text-center border-l border-r border-neutral-200 py-2 text-neutral-900 focus:outline-none focus:bg-neutral-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                  onClick={() =>
                    handleQuantityChange(
                      ticket.id,
                      (selectedTickets[ticket.id] || 0) + 1
                    )
                  }
                  className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 transition"
                >
                  +
                </button>
              </div>
            </div>

            {manage && (
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => openEdit(ticket)}
                  className="px-3 py-2 text-sm border rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteTicket(ticket.id)}
                  className="px-3 py-2 text-sm border rounded text-red-700"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Checkout (only for visitors or non-staff) */}
      {(!user || (user.role !== "admin" && user.role !== "employee")) && (
        <div className="mt-12 flex justify-center">
          <button
            onClick={handleAddToCart}
            className="px-6 py-3 bg-neutral-800 text-white font-medium rounded-lg hover:bg-neutral-900 transition"
          >
            {user ? "Add to cart" : "Login to Purchase"}
          </button>
        </div>
      )}

      {/* Modal for Create/Edit */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {editing?.id == null ? "Create Ticket" : "Edit Ticket"}
              </h3>
              <button
                onClick={() => {
                  setModalOpen(false);
                  setEditing(null);
                }}
                className="text-neutral-600 hover:text-black"
              >
                ✕
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <LabeledInput
                label="Name"
                value={editing?.name || ""}
                onChange={(v) => setEditing({ ...editing, name: v })}
              />
              <LabeledInput
                label="Price"
                value={editing?.total_price || ""}
                onChange={(v) =>
                  setEditing({ ...editing, total_price: v })
                }
              />
              <LabeledInput
                label="Description"
                value={editing?.description || ""}
                onChange={(v) =>
                  setEditing({ ...editing, description: v })
                }
              />
              <LabeledSelect
                label="Active"
                value={editing?.is_active}
                onChange={(v) =>
                  setEditing({ ...editing, is_active: v })
                }
              />
              <LabeledSelect
                label="Featured"
                value={editing?.is_featured}
                onChange={(v) =>
                  setEditing({ ...editing, is_featured: v })
                }
              />
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                className="px-3 py-2 border rounded"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-3 py-2 rounded-lg bg-neutral-800 text-white hover:bg-neutral-900"
                onClick={saveTicket}
              >
                {editing?.id ? "Save Changes" : "Create Ticket"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LabeledInput({ label, value, onChange }) {
  return (
    <div>
      <label className="text-sm text-neutral-700">{label}</label>
      <input
        type="text"
        className="w-full mt-1 border rounded-lg p-2"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function LabeledSelect({ label, value, onChange }) {
  return (
    <div>
      <label className="text-sm text-neutral-700">{label}</label>
      <select
        className="w-full mt-1 border rounded-lg p-2"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value={1}>Yes</option>
        <option value={0}>No</option>
      </select>
    </div>
  );
}
