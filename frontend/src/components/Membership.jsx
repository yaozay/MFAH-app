import { useAuth } from "../lib/auth";
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE;

function isAdminUser(user) {
  if (!user) return false;
  if (user.role && String(user.role).toLowerCase() === "admin") return true;
  if (Array.isArray(user.roles)) {
    return user.roles.map(r => String(r).toLowerCase()).includes("admin");
  }
  return false;
}

export default function Memberships() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [plans, setPlans] = useState([]);
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // admin UI state
  const [manage, setManage] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // plan or null
  const [busy, setBusy] = useState(false);

  const headersAuth = useMemo(
    () => ({
      "Content-Type": "application/json",
      ...(token || localStorage.getItem("token")
        ? { Authorization: `Bearer ${token || localStorage.getItem("token")}` }
        : {}),
    }),
    [token]
  );

  const admin = isAdminUser(user);

  const priceFmt = (p) =>
    new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" })
      .format(Number(p || 0));

  async function loadPlans() {
    try {
      setLoading(true);
      const r = await fetch(`${API_BASE}/api/memberships/types`);
      const data = await r.json();
      if (Array.isArray(data)) setPlans(data);
      else {
        setPlans([]);
        setError(data?.message || "Failed to load memberships");
      }
    } catch {
      setPlans([]);
      setError("Failed to load memberships");
    } finally {
      setLoading(false);
    }
  }

  async function loadActive() {
    if (!user) return setActive(null);
    try {
      const r = await fetch(`${API_BASE}/api/memberships/active`, {
        headers: headersAuth,
      });
      const data = await r.json();
      setActive(data || null);
    } catch {
      setActive(null);
    }
  }

  useEffect(() => { loadPlans(); }, []);
  useEffect(() => { loadActive(); }, [user, headersAuth]);

  const handleChoosePlan = async (plan) => {
    if (!user) {
      navigate("/login", { state: { from: "/membership" } });
      return;
    }
    if (active) {
      alert(`You already have an active membership (${active.name}) until ${active.end_date}.`);
      return;
    }
    try {
      setBusy(true);
      const res = await fetch(`${API_BASE}/api/memberships/purchase`, {
        method: "POST",
        headers: headersAuth,
        body: JSON.stringify({ plan_id: plan.id }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(j?.message || "Purchase failed");
        return;
      }
      await loadActive();
      alert("Membership activated. Enjoy!");
    } finally {
      setBusy(false);
    }
  };

  // -------- ADMIN ACTIONS ----------
  const openCreate = () => {
    setEditing({
      id: null,
      name: "",
      price: "",
      discount_amt: 0,
      duration_months: 12,
      people_included: 1,
      description: "",
      is_active: 1,
      is_featured: 0,
      display_order: (plans[plans.length - 1]?.display_order || plans.length) + 1,
    });
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditing({ ...p });
    setModalOpen(true);
  };

  const savePlan = async () => {
    if (!editing) return;
    setBusy(true);
    try {
      const body = { ...editing };
      // API expects snake_case field names already
      if (!body.name || !body.price || !body.duration_months) {
        alert("Name, price, and duration_months are required");
        return;
      }
      if (body.id == null) {
        const r = await fetch(`${API_BASE}/api/memberships/types`, {
          method: "POST",
          headers: headersAuth,
          body: JSON.stringify(body),
        });
        const j = await r.json().catch(() => ({}));
        if (!r.ok) return alert(j?.message || "Create failed");
      } else {
        const r = await fetch(`${API_BASE}/api/memberships/types/${body.id}`, {
          method: "PUT",
          headers: headersAuth,
          body: JSON.stringify(body),
        });
        const j = await r.json().catch(() => ({}));
        if (!r.ok) return alert(j?.message || "Update failed");
      }
      await loadPlans();
      setModalOpen(false);
      setEditing(null);
    } finally {
      setBusy(false);
    }
  };

  const deletePlan = async (id) => {
    if (!confirm("Delete this plan?")) return;
    setBusy(true);
    try {
      const r = await fetch(`${API_BASE}/api/memberships/types/${id}`, {
        method: "DELETE",
        headers: headersAuth,
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        alert(j?.message || "Delete failed");
      } else {
        await loadPlans();
      }
    } finally {
      setBusy(false);
    }
  };
  // ---------------------------------

  return (
    <div className="min-h-screen bg-neutral-100 py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-serif text-neutral-800 mb-4 tracking-wide">
            Membership
          </h1>
          <div className="w-20 h-px bg-neutral-300 mx-auto mb-6"></div>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Join our community and enjoy exclusive benefits while supporting the arts
          </p>
          {user && active && (
            <div className="mt-6 inline-block bg-white border border-neutral-200 rounded-lg px-4 py-3 text-sm text-neutral-700">
              Active: <strong>{active.name}</strong> (ends {active.end_date})
            </div>
          )}
        </div>

        {/* Admin toolbar */}
        {admin && (
          <div className="mb-6 flex items-center justify-between gap-3">
            <div className="text-sm text-neutral-600">
              Admin mode {manage ? "(on)" : "(off)"}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setManage((v) => !v)}
                className="px-3 py-2 border border-neutral-800 rounded-lg text-neutral-800 bg-white hover:bg-neutral-800 hover:text-white"
              >
                {manage ? "Hide Manage" : "Manage Plans"}
              </button>
              {manage && (
                <button
                  onClick={openCreate}
                  className="px-3 py-2 rounded-lg bg-neutral-800 text-white hover:bg-neutral-900"
                >
                  + New Plan
                </button>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="text-center text-red-600 mb-4">{error}</div>
        )}

        {loading ? (
          <div className="text-center text-neutral-600">Loading…</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {(plans ?? []).map((plan) => {
              const finalPrice = (Number(plan.price || 0) - Number(plan.discount_amt || 0)).toFixed(2);
              return (
                <div
                  key={plan.id}
                  className={`bg-white rounded-lg shadow-md transition-all duration-300 ${
                    plan.is_featured ? "ring-2 ring-neutral-800 transform md:scale-105" : "hover:shadow-lg"
                  }`}
                >
                  {plan.is_featured && (
                    <div className="bg-neutral-800 text-white text-center py-2 rounded-t-lg">
                      <span className="text-sm font-medium">Most Popular</span>
                    </div>
                  )}

                  <div className="p-8">
                    <div className="flex items-start justify-between">
                      <h2 className="text-2xl font-serif text-neutral-800 mb-2">
                        {plan.name}
                      </h2>
                      {admin && manage && (
                        <div className="flex gap-2 -mt-1">
                          <button
                            onClick={() => openEdit(plan)}
                            className="px-2 py-1 text-xs border rounded"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deletePlan(plan.id)}
                            className="px-2 py-1 text-xs border rounded text-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="mb-6 pb-6 border-b border-neutral-200">
                      <span className="text-4xl font-bold text-neutral-900">
                        {priceFmt(finalPrice)}
                      </span>
                      <span className="text-neutral-600 ml-2">
                        per {plan.duration_months} month{plan.duration_months > 1 ? "s" : ""}
                      </span>
                    </div>

                    <ul className="space-y-3 mb-8">
                      <li className="text-neutral-700 text-sm leading-relaxed">
                        Includes up to {plan.people_included} {plan.people_included > 1 ? "people" : "person"}
                      </li>
                      {plan.description && plan.description.split("\n").slice(0,4).map((line, idx) => (
                        <li key={idx} className="text-neutral-700 text-sm leading-relaxed">• {line}</li>
                      ))}
                    </ul>

                    {!manage && (!user || (user.role !== "admin" && user.role !== "employee")) && (
  <button
    disabled={busy || (!!active)}
    onClick={() => handleChoosePlan(plan)}
    className={`w-full py-3 font-medium rounded-lg transition-all ${
      plan.is_featured
        ? "bg-neutral-800 text-white hover:bg-neutral-900"
        : "bg-white text-neutral-800 border-2 border-neutral-800 hover:bg-neutral-800 hover:text-white"
    } ${busy || active ? "opacity-60 cursor-not-allowed" : ""}`}
  >
    {active ? "Already Active" : user ? "Choose Plan" : "Login to Choose"}
  </button>
)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Admin modal */}
      {admin && modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {editing?.id == null ? "Create Membership Plan" : "Edit Membership Plan"}
              </h3>
              <button
                onClick={() => { setModalOpen(false); setEditing(null); }}
                className="text-neutral-600 hover:text-black"
              >
                ✕
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <LabeledInput label="Name" value={editing?.name ?? ""} onChange={(v)=>setEditing(s=>({...s, name:v}))}/>
              <LabeledInput label="Price (USD)" type="number" step="0.01" value={editing?.price ?? ""} onChange={(v)=>setEditing(s=>({...s, price:v}))}/>
              <LabeledInput label="Discount" type="number" step="0.01" value={editing?.discount_amt ?? 0} onChange={(v)=>setEditing(s=>({...s, discount_amt:v}))}/>
              <LabeledInput label="Duration (months)" type="number" value={editing?.duration_months ?? 12} onChange={(v)=>setEditing(s=>({...s, duration_months:v}))}/>
              <LabeledInput label="People Included" type="number" value={editing?.people_included ?? 1} onChange={(v)=>setEditing(s=>({...s, people_included:v}))}/>
              <LabeledInput label="Display Order" type="number" value={editing?.display_order ?? 1} onChange={(v)=>setEditing(s=>({...s, display_order:v}))}/>
              <LabeledSelect label="Active" value={Number(editing?.is_active ?? 1)} onChange={(v)=>setEditing(s=>({...s, is_active:Number(v)}))}/>
              <LabeledSelect label="Featured" value={Number(editing?.is_featured ?? 0)} onChange={(v)=>setEditing(s=>({...s, is_featured:Number(v)}))}/>
            </div>

            <div className="mt-3">
              <label className="text-sm text-neutral-700">Description</label>
              <textarea
                className="w-full mt-1 border rounded-lg p-2"
                rows={4}
                value={editing?.description ?? ""}
                onChange={(e)=>setEditing(s=>({...s, description:e.target.value}))}
                placeholder="Bulleted lines split by newlines…"
              />
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                className="px-3 py-2 border rounded-lg"
                onClick={() => { setModalOpen(false); setEditing(null); }}
              >
                Cancel
              </button>
              <button
                disabled={busy}
                className="px-3 py-2 rounded-lg bg-neutral-800 text-white hover:bg-neutral-900 disabled:opacity-60"
                onClick={savePlan}
              >
                {busy ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* small form helpers */
function LabeledInput({ label, type="text", step, value, onChange }) {
  return (
    <div>
      <label className="text-sm text-neutral-700">{label}</label>
      <input
        className="w-full mt-1 border rounded-lg p-2"
        type={type}
        step={step}
        value={value}
        onChange={(e)=>onChange(e.target.value)}
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
        onChange={(e)=>onChange(e.target.value)}
      >
        <option value={1}>Yes</option>
        <option value={0}>No</option>
      </select>
    </div>
  );
}
