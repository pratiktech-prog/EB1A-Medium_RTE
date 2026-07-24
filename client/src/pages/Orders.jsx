import { useEffect, useState } from 'react';
import api from '../api/client.js';

const STATUS_LABELS = {
  placed: 'Placed',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/orders/mine')
      .then((res) => setOrders(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading orders...</p>;
  if (orders.length === 0) return <p>You haven't placed any orders yet.</p>;

  return (
    <div>
      <h1>My Orders</h1>
      <div className="order-list">
        {orders.map((order) => (
          <div key={order._id} className="order-card">
            <div className="order-card-top">
              <strong>{order.restaurant?.name}</strong>
              <span className={`status-pill status-${order.status}`}>{STATUS_LABELS[order.status]}</span>
            </div>
            <ul>
              {order.items.map((item) => (
                <li key={item.menuItem}>
                  {item.name} × {item.quantity} — ₹{item.price * item.quantity}
                </li>
              ))}
            </ul>
            <p className="meta">
              Total: ₹{order.totalAmount} · Placed {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
