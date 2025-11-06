import { Link } from "react-router-dom";

export default function OrderSuccess() {
  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col items-center justify-center text-center p-6">
      <h1 className="text-3xl font-serif mb-4">Order Complete!</h1>
      <p className="text-neutral-600 mb-6">
        Thank you for your purchase. Your order has been placed.
      </p>

      <Link
        to="/"
        className="bg-black text-white px-6 py-3 rounded-lg text-lg hover:bg-neutral-800 transition"
      >
        Return Home
      </Link>
    </div>
  );
}
