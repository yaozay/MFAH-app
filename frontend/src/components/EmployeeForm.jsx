import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const token = localStorage.getItem("token");
const API_BASE = import.meta.env.VITE_API_BASE;

export default function EmployeeForm() {
  const [params] = useSearchParams();
  const id = params.get("id"); // present => edit mode
  const navigate = useNavigate();

  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  // form fields
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");           // phone
  const [employee_role, setEmployeeRole] = useState("");
  const [department_id, setDepartmentId] = useState("");
  const [hire_date, setHireDate] = useState("");

  const goBack = (msgType) => {
    // If opened as a popup, notify parent & close
    if (window.opener && !window.opener.closed) {
      if (msgType) window.opener.postMessage({ type: msgType }, "*");
      window.close();
      return;
    }
    // Otherwise, go back to Admin dashboard route
    navigate("/admin", { replace: true });

  };

  // load on edit
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/employees/${id}`, {
          credentials: "include",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!res.ok) throw new Error(`Failed to load employee (${res.status})`);
        const row = await res.json();
        setFirstName(row.first_name || "");
        setLastName(row.last_name || "");
        setEmail(row.email || "");
        setPhone(row.phone || "");
        setEmployeeRole(row.employee_role || "");
        setDepartmentId(row.department_id ? String(row.department_id) : "");
        setHireDate(row.hire_date ? String(row.hire_date).slice(0, 10) : "");
      } catch (e) {
        setErr(String(e?.message || e));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const payload = {
    first_name,
    last_name,
    email,
    phone,
    employee_role,
    department_id: department_id ? Number(department_id) : null,
    hire_date: hire_date || null,
  };

  const validate = () => {
    if (!first_name.trim()) return "First name is required";
    if (!last_name.trim()) return "Last name is required";
    if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return "Invalid email";
    if (phone && !/^\d{10}$/.test(phone)) return "Phone must be 10 digits";
    return "";
  };

  const onSave = async () => {
    if (!window.confirm("Verify data is correct before saving?")) return;
    const v = validate();
    if (v) return alert(v);

    try {
      setSaving(true);
      const res = await fetch(
        id ? `${API_BASE}/api/employees/${id}` : `${API_BASE}/api/employees`,
        {
          method: id ? "PUT" : "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) throw new Error(`Save failed (${res.status})`);
      goBack("EMPLOYEE_SAVED");
    } catch (e) {
      alert(String(e?.message || e));
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to delete this employee?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/employees/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,

      });
      if (!res.ok) throw new Error(`Delete failed (${res.status})`);
      goBack("EMPLOYEE_DELETED");
    } catch (e) {
      alert(String(e?.message || e));
    } finally {
      setSaving(false);
    }

  };

  return (
    <div className="p-6 space-y-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold">{id ? "Edit Employee" : "Add Employee"}</h1>
      {loading ? <div>Loading…</div> : null}
      {err ? <div className="text-red-400">{err}</div> : null}

      <div className="space-y-3">
        <label className="block">
          <div className="mb-1 text-sm opacity-80">First Name</div>
          <input className="input" value={first_name} onChange={(e) => setFirstName(e.target.value)} />
        </label>

        <label className="block">
          <div className="mb-1 text-sm opacity-80">Last Name</div>
          <input className="input" value={last_name} onChange={(e) => setLastName(e.target.value)} />
        </label>

        <label className="block">
          <div className="mb-1 text-sm opacity-80">Email</div>
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>

        <label className="block">
          <div className="mb-1 text-sm opacity-80">Phone (10 digits)</div>
          <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </label>

        <label className="block">
          <div className="mb-1 text-sm opacity-80">Role</div>
          <select className="input" value={employee_role} onChange={(e) => setEmployeeRole(e.target.value)}>
            <option value="">Select a role</option>
            <option value="curator">curator</option>
            <option value="manager">manager</option>
            <option value="security">security</option>
            <option value="guide">guide</option>
          </select>
        </label>

        <label className="block">
          <div className="mb-1 text-sm opacity-80">Department</div>
          <select className="input" value={department_id} onChange={(e) => setDepartmentId(e.target.value)}>
            <option value="">Select a department</option>
            <option value="1">Administration / IT</option>
            <option value="2">Curatorial</option>
            <option value="3">Exhibitions & Events</option>
            <option value="4">Visitor Services / Ticketing</option>
            <option value="5">Retail / Museum Shop</option>
            <option value="6">Development / Fundraising</option>
          </select>
        </label>

        <label className="block">
          <div className="mb-1 text-sm opacity-80">Hire Date</div>
          <input className="input" type="date" value={hire_date} onChange={(e) => setHireDate(e.target.value)} />
        </label>
      </div>

      <div className="flex gap-2 pt-2">
        <button className="btn bg-rose-500 text-white" onClick={onSave} disabled={saving}>
          {id ? "Apply Changes" : "Add Employee"}
        </button>

        {id && (
          <button className="btn btn-ghost text-red-400" onClick={onDelete} disabled={saving} >
            Delete
          </button>
        )}

        <button className="btn btn-ghost" onClick={() => goBack()}>
          Cancel
        </button>
      </div>
    </div>
  );
}
