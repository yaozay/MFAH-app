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
  const [phone, setPhone] = useState(""); // phone
  const [employee_role, setEmployeeRole] = useState("");
  const [department_id, setDepartmentId] = useState("");
  const [hire_date, setHireDate] = useState("");

  // extra employee details
  const [ssn, setSSN] = useState("");
  const [salary, setSalary] = useState("");
  const [date_of_birth, setDateOfBirth] = useState("");

  // address split into parts for UI
  const [addressStreet, setAddressStreet] = useState("");
  const [addressCity, setAddressCity] = useState("");
  const [addressState, setAddressState] = useState("");
  const [addressZip, setAddressZip] = useState("");


  // fields required only when ADDING (we also create the linked Users row)
  const [account_role, setAccountRole] = useState("employee"); // admin | employee
  const [account_password, setAccountPassword] = useState("");

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

        //expanded extra fields loading
        setSSN(row.SSN || row.ssn || "");
        setSalary(row.salary != null ? String(row.salary) : "");
        setDateOfBirth(row.date_of_birth ? String(row.date_of_birth).slice(0, 10) : "");
        const addr = row.address || "";
        const parts = addr.split(",").map((s) => s.trim());

        setAddressStreet(parts[0] || "");
        setAddressCity(parts[1] || "");
        setAddressState(parts[2] || "");
        setAddressZip(parts[3] || "");

      } catch (e) {
        setErr(String(e?.message || e));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // payload is computed differently for ADD vs EDIT
  const buildPayload = () => {
    const base = {
  first_name,
  last_name,
  email,
  phone,
  employee_role,
  department_id: department_id ? Number(department_id) : null,
  hire_date: hire_date || null,
  ssn: ssn || null,
  salary: salary ? Number(salary) : null,
  date_of_birth: date_of_birth || null,
  address: (() => {
    const parts = [addressStreet, addressCity, addressState, addressZip]
      .map((s) => (s || "").trim())
      .filter(Boolean); // drop empty pieces
    return parts.length ? parts.join(", ") : null;
  })(),
};
    if (!id) {
      // include account creation fields only when adding
      return { ...base, account_role, account_password };
    }
    return base;
  };

  const validate = () => {
    if (!first_name.trim()) return "First name is required";
    if (!last_name.trim()) return "Last name is required";
    if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return "Invalid email";
    if (phone && !/^\d{10}$/.test(phone)) return "Phone must be 10 digits";

    if (ssn && !/^\d{9}$/.test(ssn)) return "SSN must be 9 digits";
    if (salary && isNaN(Number(salary))) return "Salary must be a valid number";
    // (date_of_birth optional; browser handles format)

    // extra checks only on ADD (creating linked Users row)
    if (!id) {
      if (!email) return "Email is required for new employees";
      if (!account_role || !["admin", "employee"].includes(account_role)) {
        return "Account role must be admin or employee";
      }
      if (!account_password || account_password.length < 8) {
        return "Password must be at least 8 characters";
      }
    }
    return "";
  };

  const onSave = async () => {
    if (!window.confirm("Verify data is correct before saving?")) return;
    const v = validate();
    if (v) return alert(v);

    try {
      setSaving(true);
      const payload = buildPayload(); // use builder so we only include account fields on add
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

        <label className="block">
          <div className="mb-1 text-sm opacity-80">SSN (9 digits)</div>
          <input
            className="input"
            value={ssn}
            onChange={(e) => setSSN(e.target.value.replace(/\D/g, ""))}
            maxLength={9}
          />
        </label>

        <label className="block">
          <div className="mb-1 text-sm opacity-80">Salary</div>
          <input
            className="input"
            type="number"
            step="0.01"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
          />
        </label>

        <label className="block">
          <div className="mb-1 text-sm opacity-80">Date of Birth</div>
          <input
            className="input"
            type="date"
            value={date_of_birth}
            onChange={(e) => setDateOfBirth(e.target.value)}
          />
        </label>

        <label className="block">
        <div className="mb-1 text-sm opacity-80">Street Address</div>
        <input
           className="input"
           value={addressStreet}
           onChange={(e) => setAddressStreet(e.target.value)}
            placeholder="123 Museum St."
         />
        </label>

        <label className="block">
          <div className="mb-1 text-sm opacity-80">City</div>
          <input
            className="input"
            value={addressCity}
            onChange={(e) => setAddressCity(e.target.value)}
            placeholder="Houston"
          />
        </label>

        <label className="block">
          <div className="mb-1 text-sm opacity-80">State</div>
          <input
            className="input"
            value={addressState}
            onChange={(e) => setAddressState(e.target.value)}
            placeholder="TX"
          />
        </label>

        <label className="block">
          <div className="mb-1 text-sm opacity-80">ZIP Code</div>
          <input
            className="input"
            value={addressZip}
            onChange={(e) => setAddressZip(e.target.value)}
            placeholder="77004"
          />
        </label>


        {/* Only show account creation fields when adding a new employee */}
        {!id && (
          <>
            <label className="block">
              <div className="mb-1 text-sm opacity-80">Account Role (login)</div>
              <select
                className="input"
                value={account_role}
                onChange={(e) => setAccountRole(e.target.value)}
              >
                <option value="employee">employee</option>
                <option value="admin">admin</option>
              </select>
            </label>

            <label className="block">
              <div className="mb-1 text-sm opacity-80">Initial Password</div>
              <input
                className="input"
                type="password"
                value={account_password}
                onChange={(e) => setAccountPassword(e.target.value)}
                placeholder="At least 8 characters"
              />
            </label>
          </>
        )}
      </div>

      <div className="flex gap-2 pt-2">
        <button className="btn bg-rose-500 text-white" onClick={onSave} disabled={saving}>
          {id ? "Apply Changes" : "Add Employee"}
        </button>

        {id && (
          <button className="btn btn-ghost text-red-400" onClick={onDelete} disabled={saving}>
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
