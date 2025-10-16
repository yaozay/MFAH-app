import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function Artists() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [name, setName] = useState("");

  async function load() {
    const data = await api(`/artists${q ? `?q=${encodeURIComponent(q)}` : ""}`);
    setItems(data);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  async function create(e) {
    e.preventDefault();
    if (!name.trim()) return;
    await api("/artists", { method: "POST", body: JSON.stringify({ name }) });
    setName("");
    load();
  }

  return (
    <section className="grid gap-6 md:grid-cols-3">
      <div className="card md:col-span-2">
        <div className="flex items-center justify-between gap-3">
          <h2 className="h1">Artists</h2>
          <input
            className="input max-w-xs"
            placeholder="Search artists..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <ul className="mt-4 divide-y divide-neutral-800/80">
          {items.map((a) => (
            <li key={a.id} className="flex items-center justify-between py-3">
              <span className="text-sm">{a.name}</span>
              <span className="text-xs text-neutral-400">#{a.id}</span>
            </li>
          ))}
          {items.length === 0 && (
            <li className="py-6 text-sm text-neutral-400">No artists found.</li>
          )}
        </ul>
      </div>

      <form onSubmit={create} className="card space-y-3">
        <h3 className="font-semibold">Add Artist</h3>
        <input
          className="input"
          placeholder="Artist name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button className="btn btn-primary" type="submit">
          Add
        </button>
      </form>
    </section>
  );
}
