import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();
const TAX_RATE = 0.0825;

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    const stored = localStorage.getItem("cart");
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item, overrideType = null) => {
    const finalType = overrideType || item.type;

    setCartItems((prev) => {
      const existing = prev.find((i) => {
        if (finalType === "membership") {
          return (
            i.type === "membership" &&
            i.membership_plan_id === item.membership_plan_id
          );
        }
        return i.type === finalType && i.id === item.id;
      });

      if (existing) {
        if (finalType === "membership") {
          return prev;
        }

        return prev.map((i) =>
          i === existing ? { ...i, qty: i.qty + (item.qty || 1) } : i
        );
      }

      return [
        ...prev,
        {
          ...item,
          type: finalType,
          qty: item.qty || 1,
        },
      ];
    });
  };

  const updateQty = (id, type, qty) => {
    setCartItems((prev) =>
      prev.map((i) => {
        if (type === "membership") return i;
        return i.id === id && i.type === type ? { ...i, qty } : i;
      })
    );
  };

  const removeFromCart = (key, type) => {
    setCartItems((prev) =>
      prev.filter((i) => {
        if (type === "membership") {
          return !(i.type === "membership" && i.membership_plan_id === key);
        }
        return !(i.type === type && i.id === key);
      })
    );
  };

  const clearCart = () => setCartItems([]);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  const cartCount = cartItems.reduce((sum, item) => sum + item.qty, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQty,
        removeFromCart,
        clearCart,
        subtotal,
        tax,
        total,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
