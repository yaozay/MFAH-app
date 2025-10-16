export default function Events() {
    const events = [
      {
        id: 1,
        title: "Contemporary Art Exhibition",
        date: "November 15, 2025",
        time: "10:00 AM - 6:00 PM",
        location: "Main Gallery",
        description: "Explore the latest works from emerging contemporary artists."
      },
      {
        id: 2,
        title: "Artist Talk & Q&A",
        date: "November 20, 2025",
        time: "2:00 PM - 4:00 PM",
        location: "Lecture Hall",
        description: "Join us for an intimate conversation with featured artists."
      },
      {
        id: 3,
        title: "Gallery Opening Reception",
        date: "November 25, 2025",
        time: "6:00 PM - 9:00 PM",
        location: "All Galleries",
        description: "Celebrate new exhibitions with wine, cheese, and networking."
      }
    ];
  
    return (
      <div className="min-h-screen bg-white py-16 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-neutral-900 mb-4">EVENTS</h1>
          <p className="text-lg text-neutral-600 mb-12">Discover upcoming events and exhibitions at Houston MFA</p>
  
          <div className="grid gap-8">
            {events.map((event) => (
              <div key={event.id} className="border-l-4 border-rose-300 pl-6 py-4 hover:bg-neutral-50 transition rounded-r-lg">
                <h2 className="text-2xl font-bold text-neutral-900 mb-2">{event.title}</h2>
                <div className="space-y-2 text-neutral-600 mb-4">
                  <p><strong>Date:</strong> {event.date}</p>
                  <p><strong>Time:</strong> {event.time}</p>
                  <p><strong>Location:</strong> {event.location}</p>
                </div>
                <p className="text-neutral-700">{event.description}</p>
                <button className="mt-4 px-6 py-2 bg-black text-white font-medium rounded hover:bg-neutral-800 transition">
                  Learn More
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }