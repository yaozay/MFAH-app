import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";

export default function Tickets() {
  const [selectedTickets, setSelectedTickets] = useState({});
  const { user } = useAuth();
  const navigate = useNavigate();

  const ticketTypes = [
    { id: 1, name: "General Admission", price: 15, description: "Access to all current exhibitions" },
    { id: 2, name: "Student/Senior", price: 10, description: "Valid ID required" },
    { id: 3, name: "Child (under 12)", price: 5, description: "Accompanied by an adult" },
    { id: 4, name: "Family Pass (4 people)", price: 40, description: "Best value for families" },
  ];

  const handleQuantityChange = (id, quantity) => {
    setSelectedTickets(prev => ({
      ...prev,
      [id]: Math.max(0, quantity),
    }));
  };

  const subtotal = Object.entries(selectedTickets).reduce((sum, [id, qty]) => {
    const ticket = ticketTypes.find(t => t.id === parseInt(id));
    return sum + (ticket ? ticket.price * qty : 0);
  }, 0);

  const TX_SALES_TAX = 0.0825;
  const salesTax = parseFloat((subtotal * TX_SALES_TAX).toFixed(2));
  const total = parseFloat((subtotal + salesTax).toFixed(2));

  const handleCheckout = () => {
    if (!user) {
      navigate("/login", { state: { from: "/tickets" } });
      return;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-serif text-neutral-800 mb-4 tracking-wide">
            Museum Tickets
          </h1>
          <div className="w-20 h-px bg-neutral-300 mx-auto mb-6"></div>
          <p className="text-lg text-neutral-600">
            Purchase tickets to visit Houston Museum of Fine Arts
          </p>
        </div>

        <div className="grid gap-6 mb-12">
          {ticketTypes.map(ticket => (
            <div
              key={ticket.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-4">
                <div className="flex-1">
                  <h2 className="text-xl font-serif text-neutral-800 mb-1">{ticket.name}</h2>
                  <p className="text-sm text-neutral-600">{ticket.description}</p>
                </div>
                <span className="text-3xl font-bold text-neutral-800">
                  ${ticket.price}
                </span>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-neutral-200">
                <label className="text-sm font-medium text-neutral-700">Quantity:</label>
                <div className="flex items-center gap-0 border-2 border-neutral-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() =>
                      handleQuantityChange(ticket.id, (selectedTickets[ticket.id] || 0) - 1)
                    }
                    className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 transition"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={selectedTickets[ticket.id] || 0}
                    onChange={e =>
                      handleQuantityChange(ticket.id, parseInt(e.target.value) || 0)
                    }
                    className="w-16 text-center border-l border-r border-neutral-200 py-2 text-neutral-900 focus:outline-none focus:bg-neutral-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button
                    onClick={() =>
                      handleQuantityChange(ticket.id, (selectedTickets[ticket.id] || 0) + 1)
                    }
                    className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 transition"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h3 className="text-2xl font-serif text-neutral-800 mb-6">
            Order Summary
          </h3>

          {Object.entries(selectedTickets).some(([_, qty]) => qty > 0) ? (
            <>
              <div className="space-y-3 mb-6 pb-6 border-b border-neutral-200">
                {Object.entries(selectedTickets).map(([id, qty]) => {
                  if (qty === 0) return null;
                  const ticket = ticketTypes.find(t => t.id === parseInt(id));
                  return (
                    <div key={id} className="flex justify-between text-neutral-700">
                      <span className="text-sm">
                        {qty}x {ticket.name}
                      </span>
                      <span className="text-sm font-medium">
                        ${(ticket.price * qty).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-2 mb-6 pb-6 border-b border-neutral-200">
                <div className="flex justify-between text-neutral-700">
                  <span className="text-sm">Subtotal:</span>
                  <span className="text-sm font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-neutral-700">
                  <span className="text-sm">Sales Tax (8.25%):</span>
                  <span className="text-sm font-medium">${salesTax.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-8">
                <span className="text-xl font-serif text-neutral-800">Total:</span>
                <span className="text-3xl font-bold text-neutral-800">
                  ${total.toFixed(2)}
                </span>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full bg-neutral-800 text-white py-3 font-medium rounded-lg hover:bg-neutral-900 transition"
              >
                {user ? "Proceed to Checkout" : "Login to Purchase"}
              </button>
            </>
          ) : (
            <p className="text-center text-neutral-500 py-8">
              No tickets selected. Please select tickets above to continue.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
