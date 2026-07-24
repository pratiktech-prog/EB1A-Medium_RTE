import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/client.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import StarRatingInput from '../components/StarRatingInput.jsx';

export default function RestaurantDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addItem } = useCart();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function load() {
    setLoading(true);
    api
      .get(`/restaurants/${id}`)
      .then((res) => setData(res.data))
      .catch(() => setError('Could not load this restaurant.'))
      .finally(() => setLoading(false));
  }

  useEffect(load, [id]);

  async function submitReview(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post(`/reviews/${id}`, { rating, comment });
      setComment('');
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not submit review');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!data) return null;

  const { restaurant, menu, reviews } = data;
  const menuByCategory = menu.reduce((acc, item) => {
    acc[item.category] = acc[item.category] || [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div>
      <div className="restaurant-header">
        <img src={restaurant.imageUrl || 'https://placehold.co/800x300?text=Restaurant'} alt={restaurant.name} />
        <div>
          <h1>{restaurant.name}</h1>
          <p>{restaurant.description}</p>
          <p className="meta">
            {restaurant.cuisines?.join(', ')} · {restaurant.city} · ₹{restaurant.priceForTwo} for two
          </p>
          <p className="rating">★ {restaurant.avgRating?.toFixed(1) || 'New'} ({restaurant.ratingCount} ratings)</p>
        </div>
      </div>

      <h2>Menu</h2>
      {Object.entries(menuByCategory).map(([category, items]) => (
        <div key={category} className="menu-category">
          <h3>{category}</h3>
          <div className="menu-list">
            {items.map((item) => (
              <div key={item._id} className="menu-item">
                <div>
                  <span className={`veg-dot ${item.isVeg ? 'veg' : 'non-veg'}`} />
                  <strong>{item.name}</strong>
                  <p className="meta">{item.description}</p>
                  <p>₹{item.price}</p>
                </div>
                <button onClick={() => addItem(restaurant, item)}>Add</button>
              </div>
            ))}
          </div>
        </div>
      ))}

      <h2>Reviews</h2>
      {user && (
        <form className="review-form" onSubmit={submitReview}>
          <StarRatingInput value={rating} onChange={setRating} />
          <textarea
            placeholder="Share your experience..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button type="submit" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit review'}
          </button>
        </form>
      )}
      {reviews.length === 0 ? (
        <p>No reviews yet.</p>
      ) : (
        <ul className="review-list">
          {reviews.map((r) => (
            <li key={r._id}>
              <strong>{r.user?.name || 'Anonymous'}</strong> — ★ {r.rating}
              <p>{r.comment}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
