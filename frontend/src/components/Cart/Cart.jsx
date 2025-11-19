import { useCart } from "./CartContext.jsx";
import { Link, useNavigate } from "react-router-dom";

export default function Cart() {
  const navigate = useNavigate();

  const {
    cartItems,
    updateQty,
    removeFromCart,
    clearCart,
    subtotal,
    tax,
    total,
  } = useCart();

  const safePrice = (p) => Number(p || 0);

  if (cartItems.length === 0)
    return (
      <div className="min-h-screen p-6 flex flex-col items-center justify-center text-neutral-600 bg-neutral-100">
        <h1 className="text-2xl font-serif mb-4">Your cart is empty.</h1>
        <Link
          to="/giftshop"
          className="text-rose-500 hover:text-rose-400 underline"
        >
          Browse Gift Shop
        </Link>
      </div>
    );

  return (
    <div className="min-h-screen bg-neutral-100 p-6">
      <h1 className="text-3xl font-serif mb-6">Your Cart</h1>

      <div className="space-y-4 mb-10">
        <div className="space-y-4 mb-10">
          {cartItems.map((item) => {
            const key =
              item.type === "membership"
                ? `membership-${item.membership_plan_id}`
                : `${item.type}-${item.id}`;

            const emoji =
              item.type === "membership"
                ? "💳"
                : item.type === "ticket"
                  ? "🎟️"
                  : "";

            const label =
              item.type === "membership"
                ? " (membership)"
                : item.type === "ticket"
                  ? "(ticket)"
                  : "";

            return (
              <div
                key={key}
                className="p-4 bg-white border border-neutral-200 rounded-xl flex items-center justify-between shadow-sm"
              >
                <div className="flex items-center gap-4">
                  {item.type === "giftshop" ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-md border border-neutral-200"
                    />
                  ) : (
                    <span className="text-3xl">{emoji}</span>
                  )}

                  <div>
                    <p className="font-serif text-neutral-800">
                      {item.name}
                      <span className="text-neutral-500 text-sm">{label}</span>
                    </p>
                    <p className="text-neutral-600">
                      ${safePrice(item.price).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {item.type === "membership" ? (
                    <span className="text-neutral-600 text-sm">(1 plan)</span>
                  ) : (
                    <>
                      <button
                        onClick={() =>
                          updateQty(item.id, item.type, Math.max(1, item.qty - 1))
                        }
                        className="px-2 py-1 border rounded"
                      >
                        -
                      </button>

                      <span>{item.qty}</span>

                      <button
                        onClick={() =>
                          updateQty(item.id, item.type, item.qty + 1)
                        }
                        className="px-2 py-1 border rounded"
                      >
                        +
                      </button>
                    </>
                  )}

                  <button
                    onClick={() =>
                      item.type === "membership"
                        ? removeFromCart(item.membership_plan_id, "membership")
                        : removeFromCart(item.id, item.type)
                    }
                    className="text-rose-500 hover:text-rose-400 text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      <div className="p-6 border border-neutral-200 rounded-md space-y-3 text-lg bg-white shadow-sm">
        <h2 className="text-xl font-serif">Order Summary</h2>

        <p>Subtotal: ${safePrice(subtotal).toFixed(2)}</p>
        <p>Tax (8.25%): ${safePrice(tax).toFixed(2)}</p>

        <p className="font-medium text-2xl">
          Total: ${safePrice(total).toFixed(2)}
        </p>

        <button
          onClick={() => navigate("/checkout")}
          className="w-full mt-4 bg-black text-white py-3 rounded-md text-lg font-medium hover:bg-neutral-800 transition"
        >
          Proceed to Payment
        </button>

        <button
          onClick={clearCart}
          className="w-full mt-2 text-sm text-neutral-500 hover:text-neutral-700"
        >
          Clear Cart
        </button>
      </div>
    </div>
  );
}
