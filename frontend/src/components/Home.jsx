import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function Home() {
  const [health, setHealth] = useState(null);

  useEffect(() => {
    api("/health").then(setHealth).catch(console.error);
  }, []);

  return (
    <section className="grid gap-6 md:grid-cols-2">
      <div className="card">
        <h1 className="h1 mb-2">Welcome to MFAH</h1>
        <p className="text-sm text-neutral-300">
          Explore artists and artworks from our database.
        </p>
        <div className="mt-4 flex items-center gap-2 text-sm">
          <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          Backend health:
          <strong className="ml-1">{health?.ok ? "OK" : "..."}</strong>
        </div>
      </div>

      <div className="card">
        <p className="text-sm text-neutral-300">
          Use the navigation above to browse. This UI is built with React +
          Tailwind.
        </p>
      </div>
    </section>
  );
}
