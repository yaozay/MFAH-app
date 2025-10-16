import { useState } from "react";

export default function Tickets() {
  const [selectedTickets, setSelectedTickets] = useState({});

  const ticketTypes = [
    {
      id: 1,
      name: "General Admission",
      price: 15,
      description: "Access to all current exhibitions"
    },
    {
      id: 2,
      name: "Student/Senior",
      price: 10,
      description: "Valid ID required"
    },
    {
      id: 3,
      name: "Child (under 12)",
      price: 5,
      description: "Accompanied by an adult"
    },
    {
      id: 4,
      name: "Family Pass (4 people)",
      price: 40,
      description: "Best value for families"
    }
  ];

  const handleQuantityChange = (id, quantity) => {
    setSelectedTickets(prev => ({
      ...prev,
      [id]: Math.max(0, quantity)
    }));
  };

  const total = Object.entries(selectedTickets).reduce((sum, [id, qty]) => {
    const ticket = ticketTypes.find(t => t.id === parseInt(id));
    return sum + (ticket ? ticket.price * qty : 0);
  }, 0);

  return (
    <div className="min-h-screen bg-white py-16 px-6 lg:px-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold text-neutral-900 mb-4">TICKETS</h1>
        <p className="text-lg text-neutral-600 mb-12">Purchase tickets to visit Houston MFA</p>

        <div className="grid gap-6 mb-12">
          {ticketTypes.map((ticket) => (
            <div key={ticket.id} className="border-2 border-neutral-200 rounded-lg p-6 hover:border-rose-300 transition">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900">{ticket.name}</h2>
                  <p className="text-neutral-600">{ticket.description}</p>
                </div>
                <span className="text-3xl font-bold text-rose-300">${ticket.price}</span>
              </div>

              <div className="flex items-center gap-4 mt-4">
                <label className="text-neutral-700 font-medium">Quantity:</label>
                <div className="flex items-center gap-2 border border-neutral-300 rounded">
                  <button 
                    onClick={() => handleQuantityChange(ticket.id, (selectedTickets[ticket.id] || 0) - 1)}
                    className="px-4 py-2 text-neutral-600 hover:bg-neutral-100"
                  >
                    −
                  </button>
                  <input 
                    type="number" 
                    value={selectedTickets[ticket.id] || 0}
                    onChange={(e) => handleQuantityChange(ticket.id, parseInt(e.target.value) || 0)}
                    className="w-12 text-center border-l border-r border-neutral-300 py-2"
                  />
                  <button 
                    onClick={() => handleQuantityChange(ticket.id, (selectedTickets[ticket.id] || 0) + 1)}
                    className="px-4 py-2 text-neutral-600 hover:bg-neutral-100"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Checkout Summary */}
        <div className="bg-neutral-50 rounded-lg p-8 border-2 border-neutral-200">
          <h3 className="text-2xl font-bold text-neutral-900 mb-6">Order Summary</h3>
          
          <div className="space-y-3 mb-6 pb-6 border-b border-neutral-300">
            {Object.entries(selectedTickets).map(([id, qty]) => {
              if (qty === 0) return null;
              const ticket = ticketTypes.find(t => t.id === parseInt(id));
              return (
                <div key={id} className="flex justify-between text-neutral-700">
                  <span>{qty}x {ticket.name}</span>
                  <span>${ticket.price * qty}</span>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center mb-8">
            <span className="text-2xl font-bold text-neutral-900">Total:</span>
            <span className="text-4xl font-bold text-rose-300">${total}</span>
          </div>

          <button className="w-full bg-black text-white py-3 font-bold text-lg rounded hover:bg-neutral-800 transition">
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}