import { useState } from "react";

const API = import.meta.env.VITE_API_BASE;

// Currency formatter
const fmtCurrency = (n) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format(Number(n) || 0);

export default function GiftshopReport() {
  const [filters, setFilters] = useState({
    start: "",
    end: "",
    product_id: "",
  });

  const [report, setReport] = useState(null);
  const [error, setError] = useState("");

  async function fetchReport() {
    setError("");

    if (!filters.start || !filters.end) {
      setError("Please choose a start and end date.");
      return;
    }

    const query = new URLSearchParams(filters).toString();
    const res = await fetch(`${API}/api/giftshop/report?${query}`);

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to load report");
      return;
    }

    setReport(data);
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-semibold mb-4">Giftshop Sales Report</h1>

      {/* Filters */}
      <div className="rounded-xl border border-neutral-300 bg-white p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div>
            <label className="text-sm text-neutral-600">Start Date</label>
            <input
              type="date"
              className="border rounded-lg px-3 py-2 w-full"
              value={filters.start}
              onChange={(e) =>
                setFilters({ ...filters, start: e.target.value })
              }
            />
          </div>

          <div>
            <label className="text-sm text-neutral-600">End Date</label>
            <input
              type="date"
              className="border rounded-lg px-3 py-2 w-full"
              value={filters.end}
              onChange={(e) =>
                setFilters({ ...filters, end: e.target.value })
              }
            />
          </div>

          <div>
            <label className="text-sm text-neutral-600">Product ID</label>
            <input
              type="number"
              className="border rounded-lg px-3 py-2 w-full"
              placeholder="Optional"
              onChange={(e) =>
                setFilters({ ...filters, product_id: e.target.value })
              }
            />
          </div>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          onClick={fetchReport}
          className="bg-rose-500 hover:bg-rose-400 text-white px-4 py-2 rounded-lg"
        >
          Generate Report
        </button>
      </div>

      {/* Summary */}
      {report && (
        <div className="rounded-xl border bg-white p-5 shadow-sm space-y-4">
          <h2 className="text-xl font-semibold">Summary</h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
            <div>Total Revenue: <strong>{fmtCurrency(report.summary.totalRevenue)}</strong></div>
            <div>Total Transactions: <strong>{report.summary.totalTransactions}</strong></div>
            <div>Products Sold: <strong>{report.summary.productsSold}</strong></div>
            <div>Best Grossing Item: <strong>{report.summary.bestGrossingItem?.[0] || "—"}</strong></div>
            <div>Worst Grossing Item: <strong>{report.summary.worstGrossingItem?.[0] || "—"}</strong></div>
            <div>Most Sold Item: <strong>{report.summary.mostSoldItem?.[0] || "—"}</strong></div>
            <div>Least Sold Item: <strong>{report.summary.leastSoldItem?.[0] || "—"}</strong></div>
          </div>

          {/* Detailed Table */}
          <h2 className="text-xl font-semibold mt-6">Detailed Transactions</h2>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border">
              <thead className="bg-neutral-100 border-b">
                <tr>
                  <th className="px-3 py-2 border">Transaction ID</th>
                  <th className="px-3 py-2 border">Date</th>
                  <th className="px-3 py-2 border">Product</th>
                  <th className="px-3 py-2 border">Supplier</th>
                  <th className="px-3 py-2 border">Qty</th>
                  <th className="px-3 py-2 border">Unit Price</th>
                  <th className="px-3 py-2 border">Total Price</th>
                </tr>
              </thead>

              <tbody>
                {report.results.map((r, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="px-3 py-2">{r.transaction_id}</td>
                    <td className="px-3 py-2">
                      {new Date(r.sale_date).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-2">{r.product_name}</td>
                    <td className="px-3 py-2">{r.supplier_name}</td>
                    <td className="px-3 py-2">{r.quantity}</td>
                    <td className="px-3 py-2">{fmtCurrency(r.unit_price)}</td>
                    <td className="px-3 py-2">{fmtCurrency(r.total_price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
