import { useEffect, useState } from 'react';
import api from '../api/client.js';
import RestaurantCard from '../components/RestaurantCard.jsx';

export default function Home() {
  const [restaurants, setRestaurants] = useState([]);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = {};
    if (search) params.search = search;
    if (city) params.city = city;
    if (cuisine) params.cuisine = cuisine;

    setLoading(true);
    const timeout = setTimeout(() => {
      api
        .get('/restaurants', { params })
        .then((res) => setRestaurants(res.data))
        .catch(() => setError('Could not load restaurants. Is the API running?'))
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timeout);
  }, [search, city, cuisine]);

  const cities = [...new Set(restaurants.map((r) => r.city))];
  const cuisines = [...new Set(restaurants.flatMap((r) => r.cuisines || []))];

  return (
    <div>
      <h1>Order food from restaurants near you</h1>

      <div className="filters">
        <input
          type="text"
          placeholder="Search restaurants, cuisines or cities..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={city} onChange={(e) => setCity(e.target.value)}>
          <option value="">All cities</option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select value={cuisine} onChange={(e) => setCuisine(e.target.value)}>
          <option value="">All cuisines</option>
          {cuisines.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="error">{error}</p>}
      {loading ? (
        <p>Loading restaurants...</p>
      ) : restaurants.length === 0 ? (
        <p>No restaurants found.</p>
      ) : (
        <div className="restaurant-grid">
          {restaurants.map((r) => (
            <RestaurantCard key={r._id} restaurant={r} />
          ))}
        </div>
      )}
    </div>
  );
}
