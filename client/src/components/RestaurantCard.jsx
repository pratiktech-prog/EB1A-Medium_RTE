import { Link } from 'react-router-dom';

export default function RestaurantCard({ restaurant }) {
  return (
    <Link to={`/restaurants/${restaurant._id}`} className="restaurant-card">
      <img
        src={restaurant.imageUrl || 'https://placehold.co/400x250?text=Restaurant'}
        alt={restaurant.name}
      />
      <div className="restaurant-card-body">
        <div className="restaurant-card-top">
          <h3>{restaurant.name}</h3>
          <span className="rating">★ {restaurant.avgRating?.toFixed(1) || 'New'}</span>
        </div>
        <p className="cuisines">{restaurant.cuisines?.join(', ')}</p>
        <p className="meta">
          {restaurant.city} · ₹{restaurant.priceForTwo} for two
        </p>
      </div>
    </Link>
  );
}
