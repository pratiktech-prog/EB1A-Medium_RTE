import { useEffect, useState } from 'react';
import api from '../api/client.js';

const STATUS_OPTIONS = ['confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];

function NewRestaurantForm({ onCreated }) {
  const [form, setForm] = useState({ name: '', description: '', city: '', address: '', cuisines: '', priceForTwo: '', imageUrl: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        ...form,
        priceForTwo: Number(form.priceForTwo) || 0,
        cuisines: form.cuisines.split(',').map((c) => c.trim()).filter(Boolean),
      };
      const res = await api.post('/restaurants', payload);
      onCreated(res.data);
      setForm({ name: '', description: '', city: '', address: '', cuisines: '', priceForTwo: '', imageUrl: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create restaurant');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="owner-form" onSubmit={handleSubmit}>
      <h3>Add a new restaurant</h3>
      <input placeholder="Name" value={form.name} onChange={(e) => update('name', e.target.value)} required />
      <input placeholder="City" value={form.city} onChange={(e) => update('city', e.target.value)} required />
      <input placeholder="Address" value={form.address} onChange={(e) => update('address', e.target.value)} />
      <input
        placeholder="Cuisines (comma separated)"
        value={form.cuisines}
        onChange={(e) => update('cuisines', e.target.value)}
      />
      <input
        placeholder="Price for two"
        type="number"
        value={form.priceForTwo}
        onChange={(e) => update('priceForTwo', e.target.value)}
      />
      <input placeholder="Image URL" value={form.imageUrl} onChange={(e) => update('imageUrl', e.target.value)} />
      <textarea
        placeholder="Description"
        value={form.description}
        onChange={(e) => update('description', e.target.value)}
      />
      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={submitting}>
        {submitting ? 'Creating...' : 'Create restaurant'}
      </button>
    </form>
  );
}

function MenuManager({ restaurant }) {
  const [menu, setMenu] = useState([]);
  const [form, setForm] = useState({ name: '', price: '', category: 'Main', isVeg: true, description: '' });
  const [loading, setLoading] = useState(true);

  function loadMenu() {
    api.get(`/restaurants/${restaurant._id}`).then((res) => setMenu(res.data.menu)).finally(() => setLoading(false));
  }

  useEffect(loadMenu, [restaurant._id]);

  async function addItem(e) {
    e.preventDefault();
    try {
      await api.post(`/restaurants/${restaurant._id}/menu`, { ...form, price: Number(form.price) });
      setForm({ name: '', price: '', category: 'Main', isVeg: true, description: '' });
      loadMenu();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not add item');
    }
  }

  async function removeItem(itemId) {
    if (!window.confirm('Remove this menu item?')) return;
    await api.delete(`/restaurants/${restaurant._id}/menu/${itemId}`);
    loadMenu();
  }

  return (
    <div className="menu-manager">
      <h4>Menu for {restaurant.name}</h4>
      {loading ? (
        <p>Loading menu...</p>
      ) : (
        <ul>
          {menu.map((item) => (
            <li key={item._id}>
              {item.name} — ₹{item.price} ({item.category})
              <button className="link-btn danger" onClick={() => removeItem(item._id)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
      <form className="inline-form" onSubmit={addItem}>
        <input
          placeholder="Item name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          placeholder="Price"
          type="number"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          required
        />
        <input
          placeholder="Category"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        />
        <label>
          <input
            type="checkbox"
            checked={form.isVeg}
            onChange={(e) => setForm({ ...form, isVeg: e.target.checked })}
          />
          Veg
        </label>
        <button type="submit">Add item</button>
      </form>
    </div>
  );
}

function RestaurantOrders({ restaurant }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  function loadOrders() {
    api.get(`/orders/restaurant/${restaurant._id}`).then((res) => setOrders(res.data)).finally(() => setLoading(false));
  }

  useEffect(loadOrders, [restaurant._id]);

  async function updateStatus(orderId, status) {
    await api.put(`/orders/${orderId}/status`, { status });
    loadOrders();
  }

  if (loading) return <p>Loading orders...</p>;
  if (orders.length === 0) return <p className="meta">No orders yet for {restaurant.name}.</p>;

  return (
    <div className="owner-orders">
      {orders.map((order) => (
        <div key={order._id} className="order-card">
          <div className="order-card-top">
            <strong>{order.customer?.name}</strong>
            <span className={`status-pill status-${order.status}`}>{order.status}</span>
          </div>
          <ul>
            {order.items.map((item) => (
              <li key={item.menuItem}>
                {item.name} × {item.quantity}
              </li>
            ))}
          </ul>
          <p className="meta">Total: ₹{order.totalAmount}</p>
          {order.status !== 'delivered' && order.status !== 'cancelled' && (
            <select value="" onChange={(e) => updateStatus(order._id, e.target.value)}>
              <option value="" disabled>
                Update status
              </option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          )}
        </div>
      ))}
    </div>
  );
}

export default function OwnerDashboard() {
  const [restaurants, setRestaurants] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  function loadRestaurants() {
    api.get('/restaurants/mine/list').then((res) => {
      setRestaurants(res.data);
      if (res.data.length > 0 && !selected) setSelected(res.data[0]);
    }).finally(() => setLoading(false));
  }

  useEffect(loadRestaurants, []);

  return (
    <div>
      <h1>Owner Dashboard</h1>
      <NewRestaurantForm
        onCreated={(r) => {
          setRestaurants((prev) => [...prev, r]);
          setSelected(r);
        }}
      />

      {loading ? (
        <p>Loading your restaurants...</p>
      ) : restaurants.length === 0 ? (
        <p>You don't have any restaurants yet. Add one above.</p>
      ) : (
        <div className="dashboard-body">
          <div className="restaurant-tabs">
            {restaurants.map((r) => (
              <button
                key={r._id}
                className={selected?._id === r._id ? 'tab active' : 'tab'}
                onClick={() => setSelected(r)}
              >
                {r.name}
              </button>
            ))}
          </div>
          {selected && (
            <>
              <MenuManager restaurant={selected} />
              <h4>Incoming orders</h4>
              <RestaurantOrders restaurant={selected} />
            </>
          )}
        </div>
      )}
    </div>
  );
}
