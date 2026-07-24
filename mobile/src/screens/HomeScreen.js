import { useCallback, useState } from 'react';
import { View, TextInput, FlatList, Text, StyleSheet, ActivityIndicator, Pressable, RefreshControl } from 'react-native';
import { searchRestaurants } from '../api/restaurants';
import RestaurantCard from '../components/RestaurantCard';
import { colors } from '../theme';

export default function HomeScreen({ navigation }) {
  const [location, setLocation] = useState('New York, NY');
  const [term, setTerm] = useState('');
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const runSearch = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await searchRestaurants({ location, term });
      setRestaurants(data.businesses || []);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Could not load restaurants. Check the API server and Yelp API key.'
      );
    } finally {
      setLoading(false);
      setHasSearched(true);
    }
  }, [location, term]);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="City or neighborhood"
        value={location}
        onChangeText={setLocation}
        returnKeyType="search"
        onSubmitEditing={runSearch}
      />
      <TextInput
        style={styles.input}
        placeholder="Cuisine or restaurant name (optional)"
        value={term}
        onChangeText={setTerm}
        returnKeyType="search"
        onSubmitEditing={runSearch}
      />
      <Pressable style={styles.searchBtn} onPress={runSearch}>
        <Text style={styles.searchBtnText}>Search</Text>
      </Pressable>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 24 }} />
      ) : (
        <FlatList
          data={restaurants}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <RestaurantCard
              restaurant={item}
              onPress={() => navigation.navigate('RestaurantDetail', { id: item.id, name: item.name })}
            />
          )}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={runSearch} />}
          ListEmptyComponent={
            hasSearched ? <Text style={styles.empty}>No restaurants found. Try another search.</Text> : null
          }
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  input: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchBtn: { backgroundColor: colors.primary, padding: 10, borderRadius: 8, marginBottom: 12 },
  searchBtnText: { color: 'white', textAlign: 'center', fontWeight: '600' },
  error: { color: colors.danger, marginBottom: 8 },
  empty: { textAlign: 'center', color: colors.muted, marginTop: 40 },
});
