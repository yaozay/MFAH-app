import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function Artworks() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    api("/artworks").then(setItems).catch(console.error);
  }, []);

  return (
    <section className="card overflow-x-auto">
      <div className="mb-3 flex items-end justify-between">
        <h2 className="h1">Artworks</h2>
        <span className="text-xs text-neutral-400">{items.length} total</span>
      </div>

      <table className="min-w-full text-left text-sm">
        <thead className="text-neutral-400">
          <tr className="border-b border-neutral-800/80">
            <th className="py-2 pr-4">Title</th>
            <th className="py-2 pr-4">Year</th>
            <th className="py-2 pr-4">Artist</th>
          </tr>
        </thead>
        <tbody>
          {items.map((a) => (
            <tr key={a.id} className="border-b border-neutral-900/40">
              <td className="py-3 pr-4 font-medium">{a.title}</td>
              <td className="py-3 pr-4">{a.year ?? "-"}</td>
              <td className="py-3 pr-4">{a.artistName ?? "-"}</td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td className="py-6 text-neutral-400" colSpan="3">
                No artworks yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
}
