import { useAuth } from "../lib/auth";
import EventsCalendar from "./Events";
import EventsForm from "./EventsForm";

export default function EventsPage() {
  const { user } = useAuth();

  // If user exists and is employee or admin, show form; otherwise show calendar
  const isStaff = user && (user.role === "employee" || user.role === "admin");


  return (
    <div className="min-h-screen">
      {isStaff ? <EventsForm /> : <EventsCalendar />}
    </div>
  );
}
