import { useEffect, useState } from "react";

export default function Giftshop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen bg-white py-12 px-6">
      <h1 className="text-3xl font-serif text-center mb-12 text-neutral-800">
        Museum Gift Shop
      </h1>

      <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 max-w-7xl mx-auto">
        {products.length > 0 ? (
          products.map((item) => (
            <div
              key={item.product_id}
              className="flex flex-col items-center text-center group"
            >
              {/* Image */}
              <div className="w-full aspect-[1/1] bg-neutral-100 overflow-hidden rounded-lg mb-4 flex items-center justify-center shadow-sm group-hover:shadow-md transition">
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

              {/* Product Info */}
              <h3 className="text-base font-serif text-neutral-800 mb-1">
                {item.name}
              </h3>
              <p className="text-sm text-neutral-600 mb-1">
                {item.category || ""}
              </p>
              <p className="text-rose-600 font-serif mb-3">
                ${Number(item.price || 0).toFixed(2)}
              </p>

              {/* Add to Cart */}
              <button
                onClick={() => alert(`Added ${item.name} to cart!`)}
                className="bg-rose-600 text-white text-sm font-medium rounded-full px-5 py-2 hover:bg-rose-700 transition focus:outline-none focus:ring-2 focus:ring-rose-400"
              >
                Add to Cart
              </button>
            </div>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500">
            No items available right now.
          </p>
        )}
      </div>
    </div>
  );
}
