import { Pressable, Image, Text, View, StyleSheet } from 'react-native';
import RatingStars from './RatingStars';
import { colors } from '../theme';

export default function RestaurantCard({ restaurant, onPress }) {
  const categories = (restaurant.categories || []).map((c) => c.title).join(', ');
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Image
        source={{ uri: restaurant.image_url || 'https://placehold.co/400x250?text=Restaurant' }}
        style={styles.image}
      />
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {restaurant.name}
        </Text>
        <RatingStars rating={restaurant.rating} reviewCount={restaurant.review_count} />
        {categories ? (
          <Text style={styles.meta} numberOfLines={1}>
            {categories}
          </Text>
        ) : null}
        <Text style={styles.meta}>
          {[restaurant.price, restaurant.location?.city].filter(Boolean).join(' · ')}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: 10, marginBottom: 14, overflow: 'hidden' },
  image: { width: '100%', height: 160 },
  body: { padding: 10, gap: 2 },
  name: { fontSize: 16, fontWeight: '700', color: colors.text },
  meta: { fontSize: 12, color: colors.muted },
});
