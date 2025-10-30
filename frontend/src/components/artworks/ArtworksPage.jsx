import { useAuth } from "../../lib/auth";
import ArtworksForm from "./ArtworksForm";
import Art from "./Art";

export default function ArtworksPage() {
  const { user } = useAuth();

  const isStaff = user && (user.role === "employee" || user.role === "admin");

  return (
    <div className="min-h-screen">
      {isStaff ? <ArtworksForm /> : <Art />}
    </div>
  );
}