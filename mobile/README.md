# Foodie mobile (iOS + Android)

A single React Native (Expo) app that runs natively on both iOS and Android from one
codebase. It's a restaurant discovery app — search, browse details/photos/reviews, call
or get directions, and save favorites — backed by **real restaurant data from the Yelp
Fusion API**, fetched through the existing `server/` backend so the Yelp API key never
ships inside the app.

## Why a backend proxy?

Restaurant APIs like Yelp issue a secret API key. Any key embedded in a mobile app binary
can be extracted and abused, so the app never talks to Yelp directly — it calls
`GET /api/discover/restaurants` and `GET /api/discover/restaurants/:id` on the `server/`
backend, which holds the real `YELP_API_KEY` and forwards the request.

## Prerequisites

- Node.js 18+
- The `server/` backend running (see the root `../server/README` section) with a
  `YELP_API_KEY` set — get a free key at https://www.yelp.com/developers
- [Expo Go](https://expo.dev/go) on your phone (easiest way to run on a real iOS/Android
  device), or Xcode/Android Studio simulators

## Setup

```bash
cd mobile
npm install
npx expo start
```

- Press `i` to open in the iOS Simulator, `a` for the Android Emulator, or scan the QR
  code with Expo Go on a physical device.
- The app auto-detects your dev machine's IP from the Expo dev server so it can reach the
  backend on `http://<your-machine-ip>:5000/api` when running on a physical device. For a
  deployed backend, set the real URL in `app.json` under `expo.extra.apiUrl`.

## Project structure

```
App.js                          Root component: providers + navigation
src/api/client.js                Axios instance, resolves the backend URL
src/api/restaurants.js           Restaurant search/details API calls
src/context/FavoritesContext.js  AsyncStorage-backed favorites
src/components/                  RestaurantCard, RatingStars
src/screens/                     HomeScreen, RestaurantDetailScreen, FavoritesScreen
src/navigation/RootNavigator.js  Bottom tabs (Restaurants, Favorites) + stacks
```

## Scope / next steps

This is a discovery app, not an ordering app — Yelp (like most public restaurant APIs)
exposes business info, hours, photos, and reviews, not menus or checkout. The `server/`
backend already has full menu/cart/order/auth support for restaurants onboarded directly
into its own database (see the root README); wiring the mobile app to that flow — e.g. by
letting an onboarded restaurant carry its Yelp ID for cross-referencing — would be the
natural next step to bring ordering to mobile.
