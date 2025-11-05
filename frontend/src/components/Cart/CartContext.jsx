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

  // Add to cart (supports both tickets + giftshop items)
  const addToCart = (item, type) => {
    setCartItems((prev) => {
      const existing = prev.find(
        (i) => i.id === item.id && i.type === type
      );

      if (existing) {
        return prev.map((i) =>
          i.id === item.id && i.type === type
            ? { ...i, qty: i.qty + (item.qty || 1) }
            : i
        );
      }

      return [...prev, { ...item, type, qty: item.qty || 1 }];
    });
  };

  const updateQty = (id, type, qty) => {
    setCartItems((prev) =>
      prev.map((i) =>
        i.id === id && i.type === type ? { ...i, qty } : i
      )
    );
  };

  const removeFromCart = (id, type) => {
    setCartItems((prev) =>
      prev.filter((i) => !(i.id === id && i.type === type))
    );
  };

  const clearCart = () => setCartItems([]);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
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
