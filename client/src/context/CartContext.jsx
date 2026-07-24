import { createContext, useContext, useMemo, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [restaurantId, setRestaurantId] = useState(null);
  const [restaurantName, setRestaurantName] = useState(null);
  const [items, setItems] = useState([]); // { menuItemId, name, price, quantity }

  function addItem(restaurant, menuItem) {
    if (restaurantId && restaurantId !== restaurant._id) {
      const confirmSwitch = window.confirm(
        'Your cart has items from another restaurant. Clear cart and add this item instead?'
      );
      if (!confirmSwitch) return;
      setItems([]);
    }
    setRestaurantId(restaurant._id);
    setRestaurantName(restaurant.name);
    setItems((prev) => {
      const existing = prev.find((i) => i.menuItemId === menuItem._id);
      if (existing) {
        return prev.map((i) =>
          i.menuItemId === menuItem._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { menuItemId: menuItem._id, name: menuItem.name, price: menuItem.price, quantity: 1 }];
    });
  }

  function updateQuantity(menuItemId, quantity) {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.menuItemId !== menuItemId));
      return;
    }
    setItems((prev) => prev.map((i) => (i.menuItemId === menuItemId ? { ...i, quantity } : i)));
  }

  function clearCart() {
    setItems([]);
    setRestaurantId(null);
    setRestaurantName(null);
  }

  const total = useMemo(() => items.reduce((sum, i) => sum + i.price * i.quantity, 0), [items]);
  const itemCount = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);

  return (
    <CartContext.Provider
      value={{ restaurantId, restaurantName, items, addItem, updateQuantity, clearCart, total, itemCount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
