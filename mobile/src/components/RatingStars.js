import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme';

export default function RatingStars({ rating, reviewCount }) {
  return (
    <View style={styles.row}>
      <Text style={styles.stars}>★ {rating != null ? rating.toFixed(1) : '—'}</Text>
      {reviewCount != null && <Text style={styles.count}>({reviewCount})</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stars: { color: colors.success, fontWeight: '600' },
  count: { color: colors.muted, fontSize: 12 },
});
