import { useEffect, useState } from "react";
import { useAuth } from "../../lib/auth";

export default function EventsForm() {
  const { user } = useAuth();
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

  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const API = import.meta.env.VITE_API_BASE;

  useEffect(() => {
    loadEvents();
    loadVenues();
  }, [showDeleted]);

  async function loadEvents() {
    setError("");
    setSuccess("");
    try {
      const token = localStorage.getItem("token");
      const endpoint = showDeleted
        ? `${API}/api/events/deleted`
        : `${API}/api/events`;
      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load events");
      setEvents(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function loadVenues() {
    try {
      const res = await fetch(`${API}/api/venues`);
      const data = await res.json();
      setVenues(data);
    } catch {
      setVenues([]);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.title || !formData.event_date) {
      setError("Title and Date are required.");
      return;
    }

    const token = localStorage.getItem("token");
    const method = editingId ? "PUT" : "POST";
    const url = editingId
      ? `${API}/api/events/${editingId}`
      : `${API}/api/events`;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save event");

      setSuccess(editingId ? "Event updated successfully!" : "Event added!");
      resetForm();
      loadEvents();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    setError("");
    setSuccess("");

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API}/api/events/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete event");
      setSuccess("Event deleted successfully!");
      loadEvents();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRestore(id) {
    setError("");
    setSuccess("");
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API}/api/events/${id}/restore`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to restore event");
      setSuccess("Event restored successfully!");
      loadEvents();
    } catch (err) {
      setError(err.message);
    }
  }

  function handleEdit(ev) {
    setEditingId(ev.event_id || ev.id);
    setEditingTitle(ev.title);
    setFormData({
      event_id: ev.event_id || ev.id,
      title: ev.title || "",
      event_date: ev.event_date
        ? ev.event_date.slice(0, 10)
        : "",
      event_time: ev.event_time || "",
      venue_id: ev.venue_id || "",
      description: ev.description || "",
    });
  }

  function resetForm() {
    setEditingId(null);
    setEditingTitle("");
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
    <div className="min-h-screen bg-neutral-100 py-12 px-6 lg:px-12">
      <h1 className="text-3xl font-serif mb-6 text-neutral-800">
        Manage Events
      </h1>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          <strong>Error:</strong> {error}
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-md mb-6">
          <strong>Success:</strong> {success}
        </div>
      )}

      {/* Admin toggle */}
      {user?.role === "admin" && (
        <div className="mb-6">
          <button
            onClick={() => setShowDeleted((prev) => !prev)}
            className="bg-rose-600 text-white px-4 py-2 rounded-md hover:bg-rose-500 transition"
          >
            {showDeleted ? "Show Active Events" : "Show Deleted Events"}
          </button>
        </div>
      )}

      {/* Form (hidden when viewing deleted) */}
      {!showDeleted && (
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 mb-10">
          <h2 className="text-xl font-serif text-neutral-800 mb-4">
            {editingId
              ? `Editing Event: ${editingTitle}`
              : "Create New Event"}
          </h2>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div className="md:col-span-2">
              <label className="block text-sm font-serif text-neutral-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full p-2 border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-600"
              />
            </div>

            <div>
              <label className="block text-sm font-serif text-neutral-700 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="event_date"
                value={formData.event_date}
                onChange={handleChange}
                className="w-full p-2 border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-600"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-serif text-neutral-700 mb-1">
                Time
              </label>
              <input
                type="time"
                name="event_time"
                value={formData.event_time}
                onChange={handleChange}
                className="w-full p-2 border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-600"
              />
            </div>

            <div>
              <label className="block text-sm font-serif text-neutral-700 mb-1">
                Venue
              </label>
              <select
                name="venue_id"
                value={formData.venue_id}
                onChange={handleChange}
                className="w-full p-2 border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-600"
              >
                <option value="">Select Venue</option>
                {venues.map((v) => (
                  <option key={v.venue_id} value={v.venue_id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-serif text-neutral-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full p-2 border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-600"
                rows={3}
              />
            </div>

            <div className="md:col-span-2 flex gap-3 mt-2">
              <button
                type="submit"
                className="bg-rose-600 text-white px-4 py-2 rounded-md hover:bg-rose-500 transition"
              >
                {editingId ? "Save Changes" : "Add Event"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition"
              >
                {editingId ? "Cancel Edit" : "Clear"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
        <h2 className="text-xl font-serif text-neutral-800 mb-4">
          {showDeleted ? "Deleted Events" : `All Events (${events.length})`}
        </h2>

        <table className="min-w-full bg-white border border-neutral-200 rounded-lg overflow-hidden">
          <thead className="bg-rose-600 text-white border-b border-neutral-200">
            <tr>
              <th className="p-3 text-left text-sm font-medium">Title</th>
              <th className="p-3 text-left text-sm font-medium">Date</th>
              <th className="p-3 text-left text-sm font-medium">Time</th>
              <th className="p-3 text-left text-sm font-medium">Venue</th>
              <th className="p-3 text-left text-sm font-medium">Approved</th>

              <th className="p-3 text-left text-sm font-medium">Actions</th>
            </tr>
          </thead>

          <tbody>
            {events.map((ev, i) => (
              <tr
                key={ev.event_id || ev.id}
                className={`border-b border-neutral-200 ${i % 2 === 0 ? "bg-white" : "bg-neutral-50"
                  } hover:bg-neutral-100 transition-colors`}
              >
                <td className="p-3 text-sm">{ev.title}</td>

                <td className="p-3 text-sm">
                  {ev.event_date
                    ? (() => {
                      const [year, month, day] = ev.event_date.slice(0, 10).split("-");
                      return `${month}/${day}/${year}`;
                    })()
                    : "—"}
                </td>

                <td className="p-3 text-sm">
                  {ev.event_time || "—"}
                </td>

                <td className="p-3 text-sm">{ev.venue_name || "—"}</td>

                <td className="p-3 text-sm">
                  {ev.approved === 1 ? (
                    <span className="text-emerald-700 font-medium">Approved</span>
                  ) : ev.approved === -1 ? (
                    <span className="text-red-700 font-medium">Rejected</span>
                  ) : (
                    <span className="text-amber-600 font-medium">Pending</span>
                  )}
                </td>

                <td className="p-3 flex gap-3 text-sm">
                  {!showDeleted ? (
                    <>
                      <button
                        onClick={() => handleEdit(ev)}
                        className="text-neutral-700 hover:text-black transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(ev.event_id || ev.id)}
                        className="text-red-600 hover:text-red-800 transition"
                      >
                        Delete
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleRestore(ev.event_id || ev.id)}
                      className="text-rose-700 hover:text-rose-500 transition"
                    >
                      Restore
                    </button>
                  )}
                </td>
              </tr>
            ))}

            {events.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center text-neutral-500 p-4">
                  {showDeleted ? "No deleted events." : "No events found."}
                </td>
              </tr>
            )}
          </tbody>

        </table>
      </div>
    </div>
  );
}
