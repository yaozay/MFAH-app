import React, { useState, useEffect } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = { "en-US": enUS };

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
    fetch("http://localhost:4000/api/events")
      .then((res) => res.json())
      .then((data) => {
        // Parse into real Date objects
        const formatted = data.map((e) => ({
          ...e,
          start: new Date(e.start),
          end: new Date(e.end),
        }));
        setEvents(formatted);
      })
      .catch((err) => console.error("Error fetching events:", err));
  }, []);

  return (
    <div className="min-h-screen bg-white py-16 px-6 lg:px-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-5xl font-bold text-neutral-900 mb-4">EVENTS</h1>
        <p className="text-lg text-neutral-600 mb-8">
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
            <p className="text-neutral-700">{selectedEvent.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}
