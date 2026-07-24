import api from './client';

export function searchRestaurants({ location, term, categories, price, offset }) {
  return api
    .get('/discover/restaurants', { params: { location, term, categories, price, offset } })
    .then((res) => res.data);
}

export function getRestaurantDetails(id) {
  return api.get(`/discover/restaurants/${id}`).then((res) => res.data);
}
