import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../Cart/CartContext";
import { useAuth } from "../../lib/auth";

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, subtotal, tax, total, clearCart } = useCart();
  const { user, token } = useAuth();

  const API = import.meta.env.VITE_API_BASE;

  const hasOnlyTickets =
    cartItems.length === 1 &&
    cartItems[0].type?.toLowerCase() === "ticket";

  const shippingOptions = {
    standard: { label: "Standard (5–7 days)", price: 4.99 },
    expedited: { label: "Expedited (2–3 days)", price: 9.99 },
    overnight: { label: "Overnight (1 day)", price: 15.99 },
  };

  const [shippingMethod, setShippingMethod] = useState("standard");
  const shippingCost = hasOnlyTickets ? 0 : shippingOptions[shippingMethod].price;
  const finalTotal = subtotal + tax + shippingCost;

  const [address, setAddress] = useState({
    fullName: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
  });

  const [card, setCard] = useState({
    name: "",
    number: "",
    expMonth: "",
    expYear: "",
    cvv: "",
  });

  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);

  const updateAddress = (e) =>
    setAddress((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const updateCard = (e) =>
    setCard((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const validate = () => {
    const err = {};

    if (!hasOnlyTickets) {
      if (!address.fullName.trim()) err.fullName = "Required";
      if (!address.street.trim()) err.street = "Required";
      if (!address.city.trim()) err.city = "Required";
      if (!address.state.trim() || address.state.length < 2) err.state = "Required";
      if (!/^\d{5}$/.test(address.zip)) err.zip = "Invalid ZIP";
    }

    if (!card.name.trim()) err.cardName = "Required";
    if (!/^\d{13,19}$/.test(card.number.replace(/\s+/g, "")))
      err.cardNumber = "Invalid card number";
    if (
      !/^\d{2}$/.test(card.expMonth) ||
      Number(card.expMonth) < 1 ||
      Number(card.expMonth) > 12
    )
      err.expMonth = "Invalid month";
    if (!/^\d{2,4}$/.test(card.expYear)) err.expYear = "Invalid year";
    if (!/^\d{3,4}$/.test(card.cvv)) err.cvv = "Invalid CVV";

    return err;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length > 0) return;

    setProcessing(true);

    try {
      const visitorId = user?.visitor_id ?? user?.visitorId ?? null;

      // PROCESS MEMBERSHIP FIRST
      const membershipItem = cartItems.find((i) => i.type === "membership");

      if (membershipItem) {
        const res = await fetch(`${API}/api/memberships/purchase`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            plan_id: membershipItem.membership_plan_id,
          }),
        });

        const j = await res.json();
        if (!res.ok) throw new Error(j.message || "Membership purchase failed");
      }

      // PROCESS GIFT SHOP ITEMS
      const giftshopItems = cartItems.filter(
        (item) => item.type !== "ticket" && item.type !== "membership"
      );

      if (giftshopItems.length > 0) {
        const items = giftshopItems.map((i) => {
          const quantity = i.qty ?? 1;
          const productId = i.product_id ?? i.productId ?? i.id;

          return {
            product_id: productId,
            quantity,
            total_price: (i.price ?? 0) * quantity,
          };
        });

        if (items.some((it) => !it.product_id)) {
          alert("One or more cart items are missing product IDs.");
          setProcessing(false);
          return;
        }

        const res = await fetch(`${API}/api/giftshop/purchase`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            visitor_id: visitorId,
            items,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to record purchase");
      }

      // STORE ORDER SUMMARY
      sessionStorage.setItem(
        "lastOrder",
        JSON.stringify({
          shippingAddress: hasOnlyTickets
            ? "Digital Delivery (mobile ticket)"
            : address,
          shippingMethod: hasOnlyTickets
            ? { label: "Mobile Ticket", price: 0 }
            : shippingOptions[shippingMethod],
          shippingCost,
          total: finalTotal.toFixed(2),
        })
      );

      clearCart();
      navigate("/order-success");
    } catch (err) {
      console.error("Checkout error:", err);
      alert(err.message || "Checkout failed");
    } finally {
      setProcessing(false);
    }
  };

  if (cartItems.length === 0)
    return (
      <div className="min-h-screen bg-neutral-100 p-6 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-serif mb-4">Your cart is empty</h1>
      </div>
    );

  return (
    <div className="min-h-screen bg-neutral-100 p-6">
      <div className="max-w-3xl mx-auto space-y-10">

        {!hasOnlyTickets && (
          <>
            <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm space-y-4">
              <h2 className="text-xl font-serif mb-2">Shipping Address</h2>

              {[
                ["fullName", "Full Name"],
                ["street", "Street Address"],
                ["city", "City"],
                ["state", "State"],
                ["zip", "ZIP Code"],
                ["phone", "Phone (optional)"],
              ].map(([field, label]) => (
                <div key={field}>
                  <label className="block text-sm font-serif mb-1">{label}</label>
                  <input
                    name={field}
                    value={address[field]}
                    onChange={updateAddress}
                    className="w-full border border-neutral-300 rounded px-3 py-2"
                  />
                  {errors[field] && (
                    <p className="text-rose-500 text-sm">{errors[field]}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
              <h2 className="text-xl font-serif mb-4">Shipping Method</h2>
              <select
                value={shippingMethod}
                onChange={(e) => setShippingMethod(e.target.value)}
                className="w-full border border-neutral-300 rounded-lg px-4 py-2 text-lg"
              >
                {Object.entries(shippingOptions).map(([key, opt]) => (
                  <option key={key} value={key}>
                    {opt.label} — ${opt.price.toFixed(2)}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm space-y-4"
        >
          <h2 className="text-xl font-serif mb-2">Payment Info</h2>

          <div>
            <label className="block mb-1 text-sm font-serif">Full Name</label>
            <input
              name="name"
              value={card.name}
              onChange={updateCard}
              className="w-full border border-neutral-300 rounded px-3 py-2"
            />
            {errors.cardName && (
              <p className="text-rose-500 text-sm">{errors.cardName}</p>
            )}
          </div>

          <div>
            <label className="block mb-1 text-sm font-serif">Card Number</label>
            <input
              name="number"
              value={card.number}
              onChange={updateCard}
              className="w-full border border-neutral-300 rounded px-3 py-2"
            />
            {errors.cardNumber && (
              <p className="text-rose-500 text-sm">{errors.cardNumber}</p>
            )}
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block mb-1 text-sm font-serif">Exp. Month</label>
              <input
                name="expMonth"
                value={card.expMonth}
                onChange={updateCard}
                className="w-full border border-neutral-300 rounded px-3 py-2"
              />
              {errors.expMonth && (
                <p className="text-rose-500 text-sm">{errors.expMonth}</p>
              )}
            </div>
            <div className="flex-1">
              <label className="block mb-1 text-sm font-serif">Exp. Year</label>
              <input
                name="expYear"
                value={card.expYear}
                onChange={updateCard}
                className="w-full border border-neutral-300 rounded px-3 py-2"
              />
            </div>
            <div className="w-24">
              <label className="block mb-1 text-sm font-serif">CVV</label>
              <input
                name="cvv"
                value={card.cvv}
                onChange={updateCard}
                className="w-full border border-neutral-300 rounded px-3 py-2"
              />
              {errors.cvv && (
                <p className="text-rose-500 text-sm">{errors.cvv}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={processing}
            className={`w-full mt-2 py-3 rounded-lg text-lg font-semibold transition ${processing
              ? "bg-neutral-300 text-neutral-600"
              : "bg-black text-white hover:bg-neutral-800"
              }`}
          >
            {processing ? "Processing..." : "Complete Purchase"}
          </button>
        </form>

        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm text-lg space-y-2">
          <h2 className="text-xl font-serif mb-4">Order Summary</h2>

          <p>Subtotal: ${subtotal.toFixed(2)}</p>
          <p>Tax (8.25%): ${tax.toFixed(2)}</p>
          <p>
            Shipping:{" "}
            {shippingCost === 0 ? (
              <span className="text-neutral-600 font-semibold">
                Free (mobile ticket)
              </span>
            ) : (
              `$${shippingCost.toFixed(2)}`
            )}
          </p>

          <p className="font-bold text-2xl pt-2">
            Total: ${finalTotal.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}
