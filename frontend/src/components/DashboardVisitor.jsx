import { useEffect, useState } from "react";
import { useAuth } from "../lib/auth.jsx";

const API = import.meta.env.VITE_API_BASE;

export default function ProfileVisitor() {
  const { user, loading, token } = useAuth();
  const [me, setMe] = useState(null);

  const [form, setForm] = useState({ first_name: "", last_name: "" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const [pwd, setPwd] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdMsg, setPwdMsg] = useState("");

  const authHeaders = () =>
    token
      ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
      : { "Content-Type": "application/json" };

  useEffect(() => {
    let ignore = false;
    const loadMe = async () => {
      try {
        const res = await fetch(`${API}/api/users/me`, {
          method: "GET",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          credentials: token ? "omit" : "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to load profile");
        if (!ignore) {
          setMe(data);
          setForm({
            first_name: data.first_name || "",
            last_name: data.last_name || "",
          });
        }
      } catch (e) {
        if (!ignore) setMsg(e.message);
      }
    };
    if (!loading) loadMe();
    return () => {
      ignore = true;
    };
  }, [loading, token]);

  const fullName =
    (me && `${me.first_name || ""} ${me.last_name || ""}`.trim()) ||
    (user && `${user.first_name || ""} ${user.last_name || ""}`.trim()) ||
    "Visitor";

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch(`${API}/api/users/me`, {
        method: "PATCH",
        headers: authHeaders(),
        credentials: token ? "omit" : "include",
        body: JSON.stringify({
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to update profile");
      setMe(data);
      setMsg("Profile updated.");
    } catch (e) {
      setMsg(e.message);
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setPwdMsg("");

    if (!pwd.current_password || !pwd.new_password || !pwd.confirm_password) {
      setPwdMsg("Please fill all password fields.");
      return;
    }
    if (pwd.new_password.length < 8) {
      setPwdMsg("New password must be at least 8 characters.");
      return;
    }
    if (pwd.new_password !== pwd.confirm_password) {
      setPwdMsg("New password and confirmation do not match.");
      return;
    }

    setPwdSaving(true);
    try {
      const res = await fetch(`${API}/api/users/me/password`, {
        method: "POST",
        headers: authHeaders(),
        credentials: token ? "omit" : "include",
        body: JSON.stringify({
          current_password: pwd.current_password,
          new_password: pwd.new_password,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to change password");
      setPwd({ current_password: "", new_password: "", confirm_password: "" });
      setPwdMsg("Password changed.");
    } catch (e) {
      setPwdMsg(e.message);
    } finally {
      setPwdSaving(false);
    }
  };

  if (loading || (!me && !msg)) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center px-6">
        <div className="text-neutral-700">Loading your profile…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 py-16 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif text-neutral-800 mb-4 tracking-wide">
            Your Profile
          </h1>
          <div className="w-20 h-px bg-neutral-300 mx-auto mb-4"></div>
          <p className="text-neutral-600">
            Welcome {fullName || "Visitor"}
          </p>
        </div>

        {/* Alerts */}
        {msg && (
          <div className="mb-8 bg-white rounded-lg shadow-md p-4 border-l-4 border-neutral-800">
            <p className="text-sm text-neutral-800">{msg}</p>
          </div>
        )}

        {/* Account (read-only) */}
        <section className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-serif text-neutral-800 mb-6">
            Account
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <Field label="Email">
              <input
                readOnly
                value={me?.email || ""}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 rounded text-neutral-900 focus:outline-none"
              />
            </Field>
            <Field label="Role">
              <input
                readOnly
                value={me?.role || "visitor"}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 rounded text-neutral-900 focus:outline-none"
              />
            </Field>
          </div>
        </section>

        {/* Editable details */}
        <section className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-serif text-neutral-800 mb-6">
            Profile Details
          </h2>
          <form onSubmit={saveProfile} className="grid sm:grid-cols-2 gap-6">
            <Field label="First name">
              <input
                name="first_name"
                value={form.first_name}
                onChange={onChange}
                placeholder="First name"
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 rounded text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-500 focus:border-neutral-500 transition"
              />
            </Field>
            <Field label="Last name">
              <input
                name="last_name"
                value={form.last_name}
                onChange={onChange}
                placeholder="Last name"
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 rounded text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-500 focus:border-neutral-500 transition"
              />
            </Field>
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto bg-neutral-800 text-white px-6 py-3 rounded-lg font-medium hover:bg-neutral-900 disabled:opacity-50 transition"
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </form>
        </section>

        {/* Change password */}
        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-serif text-neutral-800 mb-6">
            Change Password
          </h2>

          {pwdMsg && (
            <div className="mb-6 p-3 bg-neutral-50 border-l-4 border-neutral-400 rounded">
              <p className="text-sm text-neutral-800">{pwdMsg}</p>
            </div>
          )}

          <form onSubmit={changePassword} className="grid sm:grid-cols-2 gap-6">
            <Field label="Current password" full>
              <input
                type="password"
                value={pwd.current_password}
                onChange={(e) =>
                  setPwd((p) => ({ ...p, current_password: e.target.value }))
                }
                placeholder="Enter current password"
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 rounded text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-500 focus:border-neutral-500 transition"
              />
            </Field>
            <Field label="New password">
              <input
                type="password"
                value={pwd.new_password}
                onChange={(e) =>
                  setPwd((p) => ({ ...p, new_password: e.target.value }))
                }
                placeholder="At least 8 characters"
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 rounded text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-500 focus:border-neutral-500 transition"
              />
            </Field>
            <Field label="Confirm new password">
              <input
                type="password"
                value={pwd.confirm_password}
                onChange={(e) =>
                  setPwd((p) => ({ ...p, confirm_password: e.target.value }))
                }
                placeholder="Re-enter new password"
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 rounded text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-500 focus:border-neutral-500 transition"
              />
            </Field>

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={pwdSaving}
                className="w-full sm:w-auto bg-white text-neutral-800 border-2 border-neutral-800 px-6 py-3 rounded-lg font-medium hover:bg-neutral-800 hover:text-white disabled:opacity-50 transition"
              >
                {pwdSaving ? "Updating…" : "Update password"}
              </button>
            </div>
          </form>
        </section>
      </div>
      <div className="text-center mt-12">
        <a
          href="/purchase-history"
          className="text-neutral-700 underline hover:text-neutral-900 text-lg font-serif"
        >
          View Purchase History →
        </a>
      </div>

    </div>
  );
}

function Field({ label, children, full = false }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className="block text-sm font-medium text-neutral-700 mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}
