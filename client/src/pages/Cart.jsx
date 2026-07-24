import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/client.js';

export default function Cart() {
  const { restaurantId, restaurantName, items, updateQuantity, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState(user?.address || '');
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');

  async function placeOrder() {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!address.trim()) {
      setError('Please enter a delivery address.');
      return;
    }
    setPlacing(true);
    setError('');
    try {
      await api.post('/orders', {
        restaurantId,
        items: items.map((i) => ({ menuItemId: i.menuItemId, quantity: i.quantity })),
        deliveryAddress: address,
      });
      clearCart();
      navigate('/orders');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not place order.');
    } finally {
      setPlacing(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="page-center">
        <h2>Your cart is empty</h2>
        <p>Browse restaurants and add some delicious food!</p>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1>Your Cart</h1>
      <p className="meta">Ordering from {restaurantName}</p>

      <div className="cart-items">
        {items.map((item) => (
          <div key={item.menuItemId} className="cart-item">
            <span>{item.name}</span>
            <div className="quantity-control">
              <button onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}>-</button>
              <span>{item.quantity}</span>
              <button onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}>+</button>
            </div>
            <span>₹{item.price * item.quantity}</span>
          </div>
        ))}
      </div>

      <div className="cart-total">
        <strong>Total: ₹{total}</strong>
      </div>

      <div className="checkout-form">
        <label htmlFor="address">Delivery address</label>
        <textarea
          id="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter your delivery address"
        />
        {error && <p className="error">{error}</p>}
        <button onClick={placeOrder} disabled={placing}>
          {placing ? 'Placing order...' : 'Place order'}
        </button>
      </div>
    </div>
  );
}
