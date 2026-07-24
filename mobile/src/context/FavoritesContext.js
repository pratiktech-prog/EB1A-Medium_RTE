import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'foodie:favorites';
const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => setFavorites(raw ? JSON.parse(raw) : []))
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (loaded) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites, loaded]);

  const isFavorite = useCallback((id) => favorites.some((f) => f.id === id), [favorites]);

  const toggleFavorite = useCallback((restaurant) => {
    setFavorites((prev) =>
      prev.some((f) => f.id === restaurant.id)
        ? prev.filter((f) => f.id !== restaurant.id)
        : [...prev, restaurant]
    );
  }, []);

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}
