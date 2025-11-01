import { useAuth } from "../../lib/auth";
import GiftshopForm from "./GiftshopForm";
import Giftshop from "./Giftshop";

export default function GiftshopPage() {
  const { user } = useAuth();

  const isStaff = user && (user.role === "employee" || user.role === "admin");

  return (
    <div className="min-h-screen">
      {isStaff ? <GiftshopForm /> : <Giftshop />}
    </div>
  );
}
