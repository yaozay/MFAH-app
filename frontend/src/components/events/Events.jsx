import React, { useState, useEffect } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = { "en-US": enUS };
const API = import.meta.env.VITE_API_BASE;

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

export default function Events() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {

    fetch(`${API}/api/events/public`)
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((e) => {
          const dateOnly = e.event_date.split("T")[0]; // "2025-11-09"
          const [year, month, day] = dateOnly.split("-").map(Number);

          const date = new Date(year, month - 1, day);
          const [hh, mm, ss] =
            (e.event_time || "00:00:00").split(":").map(Number);

          const start = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            hh,
            mm,
            ss
          );


          const end = new Date(start.getTime() + 180 * 180 * 1000);

          return {
            id: e.id || e.event_id,
            title: e.title,
            start,
            end,
            description: e.description || "",
            venue_name: e.venue_name || "",
          };
        });

        setEvents(formatted);
      })
      .catch((err) => console.error("Error fetching events:", err));
  }, []);

  return (
    <div className="min-h-screen bg-neutral-100 py-12 px-6 lg:px-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-serif text-center mb-2 text-neutral-800">
          Events
        </h1>
        <div className="w-20 h-px bg-neutral-300 mx-auto mb-8"></div>
        <p className="text-lg text-neutral-600 text-center mb-8">
          Discover upcoming events and exhibitions at Houston MFA
        </p>

        {/* Calendar */}
        <div className="bg-white shadow-md rounded-lg p-4">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 500 }}
            views={["month", "week", "day"]}
            popup
            onSelectEvent={(event) => setSelectedEvent(event)}
          />
        </div>

        {selectedEvent && (
          <div className="mt-8 p-6 border-l-4 border-rose-300 bg-neutral-50 rounded-r-lg">
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">
              {selectedEvent.title}
            </h2>

            <p className="text-neutral-700 mb-2">
              <strong>Date:</strong>{" "}
              {selectedEvent.start.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>

            <p className="text-neutral-700 mb-2">
              <strong>Time:</strong>{" "}
              {selectedEvent.start.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>

            <p className="text-neutral-700 mb-2">
              <strong>Venue:</strong> {selectedEvent.venue_name || "—"}
            </p>

            <p className="text-neutral-700">{selectedEvent.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}
