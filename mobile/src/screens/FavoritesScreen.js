import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useFavorites } from '../context/FavoritesContext';
import RestaurantCard from '../components/RestaurantCard';
import { colors } from '../theme';

export default function FavoritesScreen({ navigation }) {
  const { favorites } = useFavorites();

  return (
    <View style={styles.container}>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RestaurantCard
            restaurant={item}
            onPress={() => navigation.navigate('RestaurantDetail', { id: item.id, name: item.name })}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No favorites yet. Tap the heart on a restaurant to save it.</Text>
        }
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  empty: { textAlign: 'center', color: colors.muted, marginTop: 40 },
});
