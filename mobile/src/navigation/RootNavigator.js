import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import RestaurantDetailScreen from '../screens/RestaurantDetailScreen';
import { colors } from '../theme';

const HomeStack = createNativeStackNavigator();
const FavoritesStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const headerOptions = {
  headerStyle: { backgroundColor: colors.primary },
  headerTintColor: 'white',
};

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={headerOptions}>
      <HomeStack.Screen name="Home" component={HomeScreen} options={{ title: 'Slaps' }} />
      <HomeStack.Screen
        name="RestaurantDetail"
        component={RestaurantDetailScreen}
        options={({ route }) => ({ title: route.params?.name || 'Restaurant' })}
      />
    </HomeStack.Navigator>
  );
}

function FavoritesStackNavigator() {
  return (
    <FavoritesStack.Navigator screenOptions={headerOptions}>
      <FavoritesStack.Screen name="Favorites" component={FavoritesScreen} options={{ title: 'Favorites' }} />
      <FavoritesStack.Screen
        name="RestaurantDetail"
        component={RestaurantDetailScreen}
        options={({ route }) => ({ title: route.params?.name || 'Restaurant' })}
      />
    </FavoritesStack.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.primary }}>
      <Tab.Screen name="HomeTab" component={HomeStackNavigator} options={{ title: 'Restaurants' }} />
      <Tab.Screen name="FavoritesTab" component={FavoritesStackNavigator} options={{ title: 'Favorites' }} />
    </Tab.Navigator>
  );
}
