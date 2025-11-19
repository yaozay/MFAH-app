import { useEffect, useState } from "react";
import { useAuth } from "../lib/auth";

export default function PurchaseHistory() {
  const { token } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const API = import.meta.env.VITE_API_BASE;

  const fmt = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
      : "";

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API}/api/purchase-history`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setItems(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  if (loading) {
    return <div className="p-8 text-center">Loading history…</div>;
  }

  if (items.length === 0) {
    return (
      <div className="p-8 text-center text-neutral-600">
        You have no purchase history yet.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 py-16 px-6">
      <h1 className="text-3xl font-serif mb-6">Purchase History</h1>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={`${item.type}-${item.id}`}
            className="p-4 bg-white rounded-xl border border-neutral-200 shadow-sm"
          >
            <div className="flex justify-between items-center">

              <div className="flex items-center gap-4">

                {/* Gift shop: show product image */}
                {item.type === "giftshop" ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg border border-neutral-200"
                  />
                ) : (
                  <span className="text-3xl">
                    {item.type === "membership" ? "💳" : "🎟️"}
                  </span>
                )}

                <div>
                  <div className="text-xl font-serif">
                    {item.name}{" "}
                    <span className="text-neutral-500 text-sm">
                      {item.type === "membership"
                        ? "(Membership)"
                        : item.type === "ticket"
                          ? "(Ticket)"
                          : ""}
                    </span>
                  </div>

                  <div className="text-neutral-600 mt-1">
                    Price: ${Number(item.price).toFixed(2)}
                  </div>

                  {item.quantity && (
                    <div className="text-neutral-600">
                      Qty: {item.quantity}
                    </div>
                  )}

                  {item.type === "membership" && (
                    <div className="mt-1 text-neutral-500 text-sm">
                      {fmt(item.start_date)} → {fmt(item.end_date)} ({item.status})
                    </div>
                  )}
                </div>
              </div>

              <div className="text-neutral-500 text-sm">
                {fmt(item.created_at)}
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
