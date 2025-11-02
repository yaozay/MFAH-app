import { useAuth } from "../lib/auth";
import { useNavigate } from "react-router-dom";

export default function Membership() {
  const { user } = useAuth();
  const navigate = useNavigate();

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
        "Monthly newsletter",
      ],
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
        "Exclusive member previews",
      ],
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
        "Private tour options",
      ],
    },
  ];

  const handleChoosePlan = (plan) => {
    if (!user) {
      navigate("/login", { state: { from: "/membership" } });
      return;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-serif text-neutral-800 mb-4 tracking-wide">
            Membership
          </h1>
          <div className="w-20 h-px bg-neutral-300 mx-auto mb-6"></div>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Join our community and enjoy exclusive benefits while supporting the arts
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-lg shadow-md transition-all duration-300 ${plan.featured
                ? "ring-2 ring-neutral-800 transform md:scale-105"
                : "hover:shadow-lg"
                }`}
            >
              {plan.featured && (
                <div className="bg-neutral-800 text-white text-center py-2 rounded-t-lg">
                  <span className="text-sm font-medium">Most Popular</span>
                </div>
              )}

              <div className="p-8">
                <h2 className="text-2xl font-serif text-neutral-800 mb-2">
                  {plan.name}
                </h2>

                <div className="mb-6 pb-6 border-b border-neutral-200">
                  <span className="text-4xl font-bold text-neutral-900">
                    {plan.price}
                  </span>
                  <span className="text-neutral-600 ml-2">{plan.period}</span>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-neutral-700 mt-0.5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-neutral-700 text-sm leading-relaxed">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleChoosePlan(plan)}
                  className={`w-full py-3 font-medium rounded-lg transition-all ${plan.featured
                    ? "bg-neutral-800 text-white hover:bg-neutral-900"
                    : "bg-white text-neutral-800 border-2 border-neutral-800 hover:bg-neutral-800 hover:text-white"
                    }`}
                >
                  {user ? "Choose Plan" : "Choose Plan"}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-neutral-600 text-sm">
            All memberships are tax-deductible to the extent allowed by law.
          </p>
        </div>
      </div>
    </div>
  );
}
