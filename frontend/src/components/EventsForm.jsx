import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function EventsForm() {
  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState([]);
  const [formData, setFormData] = useState({
    event_id: null,
    title: "",
    event_date: "",
    event_time: "",
    venue_id: "",
    description: "",
  });

  // Load events and venues when component mounts
  useEffect(() => {
    loadEvents();
    loadVenues();
  }, []);

  async function loadEvents() {
    try {
      const data = await api("/api/events");
      setEvents(data);
    } catch (err) {
      console.error("Failed to load events:", err);
    }
  }

  async function loadVenues() {
    try {
      const data = await api("/api/venues");
      setVenues(data);
    } catch (err) {
      console.error("Failed to load venues:", err);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!formData.title || !formData.event_date) {
      alert("Title and Date are required.");
      return;
    }

    try {
      if (formData.event_id) {
        // Update existing event
        await api(`/api/events/${formData.event_id}`, {
          method: "PUT",
          body: JSON.stringify(formData),
        });
        alert("Event updated successfully!");
      } else {
        // Create new event
        await api("/api/events", {
          method: "POST",
          body: JSON.stringify(formData),
        });
        alert("Event created successfully!");
      }

      resetForm();
      loadEvents();
    } catch (err) {
      console.error("Error submitting event:", err);
      alert("Failed to save event.");
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await api(`/api/events/${id}`, { method: "DELETE" });
      alert("Event deleted.");
      loadEvents();
    } catch (err) {
      console.error("Error deleting event:", err);
      alert("Failed to delete event.");
    }
  }

  function handleEdit(event) {
    setFormData({
      event_id: event.id,
      title: event.title,
      event_date: new Date(event.start).toISOString().slice(0, 10),
      event_time: new Date(event.start).toTimeString().slice(0, 5),
      venue_id: event.venue_id || "",
      description: event.description || "",
    });
  }

  function resetForm() {
    setFormData({
      event_id: null,
      title: "",
      event_date: "",
      event_time: "",
      venue_id: "",
      description: "",
    });
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Manage Events</h1>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded-2xl shadow-lg"
      >
        <div>
          <label className="block font-medium text-gray-700">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label className="block font-medium text-gray-700">Date</label>
          <input
            type="date"
            name="event_date"
            value={formData.event_date}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label className="block font-medium text-gray-700">Time</label>
          <input
            type="time"
            name="event_time"
            value={formData.event_time}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block font-medium text-gray-700">Venue</label>
          <select
            name="venue_id"
            value={formData.venue_id}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          >
            <option value="">Select a venue</option>
            {venues.map((v) => (
              <option key={v.venue_id} value={v.venue_id}>
                {v.name}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            rows={3}
          />
        </div>

        <div className="md:col-span-2 flex gap-3 mt-2">
          <button
            type="submit"
            className="bg-rose-600 text-white px-4 py-2 rounded-md hover:bg-rose-400"
          >
            {formData.event_id ? "Update Event" : "Add Event"}
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400"
          >
            Clear
          </button>
        </div>
      </form>

      {/* Events Table */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-3 text-gray-700">All Events</h2>
        <table className="min-w-full bg-white rounded-lg shadow-md overflow-hidden">
          <thead className="bg-gray-200 text-gray-700">
            <tr>
              <th className="p-2">Title</th>
              <th className="p-2">Date</th>
              <th className="p-2">Time</th>
              <th className="p-2">Venue</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((ev) => (
              <tr key={ev.id} className="border-b hover:bg-gray-50">
                <td className="p-2">{ev.title}</td>
                <td className="p-2">
                  {new Date(ev.start).toLocaleDateString()}
                </td>
                <td className="p-2">
                  {new Date(ev.start).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="p-2">{ev.venue_name || ev.venue_id || "—"}</td>
                <td className="p-2 flex gap-2">
                  <button
                    onClick={() => handleEdit(ev)}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(ev.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {events.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center text-gray-500 p-4">
                  No events found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
