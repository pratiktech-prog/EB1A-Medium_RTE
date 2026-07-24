import { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, ActivityIndicator, Pressable, Linking } from 'react-native';
import { getRestaurantDetails } from '../api/restaurants';
import RatingStars from '../components/RatingStars';
import { useFavorites } from '../context/FavoritesContext';
import { colors } from '../theme';

export default function RestaurantDetailScreen({ route }) {
  const { id } = route.params;
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    getRestaurantDetails(id)
      .then(setRestaurant)
      .catch(() => setError('Could not load restaurant details.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />;
  if (error) return <Text style={styles.error}>{error}</Text>;
  if (!restaurant) return null;

  const favorite = isFavorite(restaurant.id);
  const address = restaurant.location?.display_address?.join(', ');

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: restaurant.image_url }} style={styles.hero} />
      <View style={styles.body}>
        <View style={styles.headerRow}>
          <Text style={styles.name}>{restaurant.name}</Text>
          <Pressable onPress={() => toggleFavorite(restaurant)} hitSlop={10}>
            <Text style={styles.favoriteIcon}>{favorite ? '❤️' : '🤍'}</Text>
          </Pressable>
        </View>
        <RatingStars rating={restaurant.rating} reviewCount={restaurant.review_count} />
        {restaurant.categories?.length ? (
          <Text style={styles.meta}>{restaurant.categories.map((c) => c.title).join(', ')}</Text>
        ) : null}
        <Text style={styles.meta}>{[restaurant.price, address].filter(Boolean).join(' · ')}</Text>

        <View style={styles.actionsRow}>
          {restaurant.phone ? (
            <Pressable style={styles.actionBtn} onPress={() => Linking.openURL(`tel:${restaurant.phone}`)}>
              <Text style={styles.actionText}>Call</Text>
            </Pressable>
          ) : null}
          {restaurant.coordinates ? (
            <Pressable
              style={styles.actionBtn}
              onPress={() =>
                Linking.openURL(
                  `https://www.google.com/maps/search/?api=1&query=${restaurant.coordinates.latitude},${restaurant.coordinates.longitude}`
                )
              }
            >
              <Text style={styles.actionText}>Directions</Text>
            </Pressable>
          ) : null}
        </View>

        {restaurant.photos?.length > 1 && (
          <ScrollView horizontal style={styles.photoRow} showsHorizontalScrollIndicator={false}>
            {restaurant.photos.map((url) => (
              <Image key={url} source={{ uri: url }} style={styles.photo} />
            ))}
          </ScrollView>
        )}

        <Text style={styles.sectionTitle}>Reviews</Text>
        {(restaurant.reviews || []).length === 0 ? (
          <Text style={styles.meta}>No reviews available.</Text>
        ) : (
          restaurant.reviews.map((review) => (
            <View key={review.id} style={styles.review}>
              <Text style={styles.reviewAuthor}>{review.user?.name}</Text>
              <RatingStars rating={review.rating} />
              <Text style={styles.reviewText}>{review.text}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  hero: { width: '100%', height: 220 },
  body: { padding: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 22, fontWeight: '700', color: colors.text, flexShrink: 1 },
  favoriteIcon: { fontSize: 24 },
  meta: { color: colors.muted, marginTop: 4 },
  actionsRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  actionBtn: { backgroundColor: colors.primary, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  actionText: { color: 'white', fontWeight: '600' },
  photoRow: { marginTop: 16 },
  photo: { width: 140, height: 100, borderRadius: 8, marginRight: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginTop: 20, marginBottom: 8, color: colors.text },
  review: { backgroundColor: colors.card, borderRadius: 8, padding: 10, marginBottom: 8 },
  reviewAuthor: { fontWeight: '600', color: colors.text },
  reviewText: { color: colors.text, marginTop: 4 },
  error: { color: colors.danger, textAlign: 'center', marginTop: 40 },
});
