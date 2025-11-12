import { useEffect, useState } from "react";
import { useCart } from "../Cart/CartContext.jsx";

export default function Giftshop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("");
  const { addToCart } = useCart();

  const API = import.meta.env.VITE_API_BASE;

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch(`${API}/api/giftshop`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load products");
        setProducts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [API]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading gift shop...
      </div>
    );

  const categories = Array.from(new Set(products.map((p) => p.category))).filter(
    Boolean
  );
  const filtered =
    filter === "all"
      ? products
      : products.filter((item) => item.category === filter);

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "price-asc") return a.price - b.price;
    if (sort === "price-desc") return b.price - a.price;
    return 0;
  });

  return (
    <div className="min-h-screen bg-neutral-100 py-12 px-6">
      <h1 className="text-4xl font-serif text-center mb-2 text-neutral-800">
        Museum Gift Shop
      </h1>

      <div className="w-20 h-px bg-neutral-300 mx-auto mb-8"></div>

      <div className="flex flex-wrap gap-4 justify-end max-w-7xl mx-auto mb-10">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-neutral-300 rounded-md px-3 py-2 text-sm"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="border border-neutral-300 rounded-md px-3 py-2 text-sm"
        >
          <option value="">Sort by Price</option>
          <option value="price-asc">Low → High</option>
          <option value="price-desc">High → Low</option>
        </select>
      </div>

      <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 max-w-7xl mx-auto">
        {sorted.length > 0 ? (
          sorted.map((item) => (
            <div
              key={item.product_id}
              className="flex flex-col items-center text-center group relative"
            >
              {item.quantity === 0 ? (
                <span className="absolute top-2 left-2 bg-neutral-700 text-white text-xs px-2 py-1 rounded">
                  Out of Stock
                </span>
              ) : item.quantity > 0 && item.quantity <= 5 ? (
                <span className="absolute top-2 left-2 bg-rose-600 text-white text-xs px-2 py-1 rounded">
                  Only {item.quantity} left!
                </span>
              ) : null}

              <div className="w-full aspect-[1/1] lg:aspect-[3/4] bg-neutral-100 overflow-hidden rounded-lg mb-4 flex items-center justify-center shadow-sm group-hover:shadow-md transition">
                {item.image_url ? (
                  <img
                    src={
                      item.image_url.startsWith("http")
                        ? item.image_url
                        : `${API}${item.image_url}`
                    }
                    alt={item.name}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <span className="text-gray-400 text-sm">No image</span>
                )}
              </div>

              <h3 className="text-base font-serif text-neutral-800 mb-1">
                {item.name}
              </h3>
              <p className="text-sm text-neutral-600 mb-1">
                {item.category || ""}
              </p>
              <p className="text-rose-600 font-serif mb-3">
                ${Number(item.price || 0).toFixed(2)}
              </p>

              <button
                disabled={item.quantity === 0}
                onClick={() =>
                  addToCart(
                    {
                      id: item.product_id,
                      name: item.name,
                      price: Number(item.price),
                      image: item.image_url,
                      qty: 1,
                    },
                    "giftshop"
                  )
                }
                className={`text-sm font-medium rounded-full px-5 py-2 transition focus:outline-none focus:ring-2 ${item.quantity === 0
                    ? "bg-neutral-300 text-neutral-500 cursor-not-allowed"
                    : "bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-400"
                  }`}
              >
                {item.quantity === 0 ? "Out of Stock" : "Add to Cart"}
              </button>
            </div>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500">
            No items match your filters.
          </p>
        )}
      </div>
    </div>
  );
}
