import { useAuth } from "../../lib/auth";
import ExhibitionsForm from "./ExhibitionsForm";
import Exhibitions from "./Exhibitions";

export default function ExhibitionsPage() {
  const { user } = useAuth();

  const isStaff = user && (user.role === "employee" || user.role === "admin");

  return (
    <div className="min-h-screen">
      {isStaff ? <ExhibitionsForm /> : <Exhibitions />}
    </div>
  );
}
