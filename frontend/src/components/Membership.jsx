export default function Membership() {
    const plans = [
      {
        id: 1,
        name: "Student",
        price: "$25",
        period: "per year",
        features: [
          "Free admission to all exhibitions",
          "10% discount on gift shop items",
          "Priority access to events",
          "Monthly newsletter"
        ]
      },
      {
        id: 2,
        name: "Individual",
        price: "$75",
        period: "per year",
        featured: true,
        features: [
          "Unlimited free admission",
          "20% discount on gift shop",
          "VIP event invitations",
          "Free parking passes",
          "Exclusive member previews"
        ]
      },
      {
        id: 3,
        name: "Family",
        price: "$150",
        period: "per year",
        features: [
          "Up to 4 family members",
          "Unlimited free admission for all",
          "25% discount on gift shop",
          "Family event passes",
          "Private tour options"
        ]
      }
    ];
  
    return (
      <div className="min-h-screen bg-white py-16 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl font-bold text-neutral-900 mb-4">MEMBERSHIP</h1>
          <p className="text-lg text-neutral-600 mb-12">Join our community and enjoy exclusive benefits</p>
  
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div key={plan.id} className={`rounded-lg p-8 transition ${
                plan.featured 
                  ? "bg-black text-white border-2 border-rose-300 scale-105" 
                  : "bg-neutral-50 border-2 border-neutral-200 hover:border-rose-300"
              }`}>
                <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className={plan.featured ? "text-rose-300" : "text-neutral-600"}> {plan.period}</span>
                </div>
  
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className={`text-lg ${plan.featured ? "text-rose-300" : "text-rose-300"}`}>✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
  
                <button className={`w-full py-3 font-medium rounded transition ${
                  plan.featured 
                    ? "bg-rose-300 text-black hover:bg-rose-400" 
                    : "bg-black text-white hover:bg-neutral-800"
                }`}>
                  Choose Plan
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }