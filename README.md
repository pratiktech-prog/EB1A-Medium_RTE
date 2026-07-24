# Foodie — a Zomato-like food ordering app

A full-stack restaurant discovery and food ordering app: browse restaurants, view menus, add
items to a cart, check out, track orders, leave reviews, and (for restaurant owners) manage
restaurants, menus, and incoming orders.

## Stack

- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT auth
- **Frontend**: React (Vite), React Router, Axios

## Project structure

```
server/   Express REST API
client/   React (Vite) single-page app
```

## Prerequisites

- Node.js 18+
- A MongoDB instance (local `mongod`, Docker, or a free MongoDB Atlas cluster)

## Setup

### 1. Backend

```bash
cd server
cp .env.example .env    # edit MONGO_URI / JWT_SECRET if needed
npm install
npm run seed             # populates sample restaurants, menus, and two demo users
npm run dev               # starts the API on http://localhost:5000
```

Demo accounts created by the seed script:

- Customer: `customer@example.com` / `password123`
- Restaurant owner: `owner@example.com` / `password123`

### 2. Frontend

```bash
cd client
cp .env.example .env    # optional: override VITE_API_URL
npm install
npm run dev               # starts the app on http://localhost:5173
```

The Vite dev server proxies `/api/*` requests to `http://localhost:5000`, so the two apps
work together out of the box in development.

## Features

- **Restaurant discovery**: search and filter restaurants by name, city, or cuisine
- **Menus**: browse a restaurant's menu grouped by category, with veg/non-veg indicators
- **Cart & checkout**: add items to a cart, adjust quantities, and place an order with a
  delivery address (single-restaurant cart, mirroring how Zomato/Swiggy carts work)
- **Order tracking**: customers see their order history and live status
- **Reviews & ratings**: signed-in customers can rate and review restaurants; a restaurant's
  average rating updates automatically
- **Auth**: JWT-based signup/login for both customers and restaurant owners
- **Owner dashboard**: restaurant owners can create restaurants, manage menu items, and
  update the status of incoming orders (confirmed → preparing → out for delivery → delivered)

## API overview

| Method | Route | Description |
| --- | --- | --- |
| POST | `/api/auth/signup` | Create an account |
| POST | `/api/auth/login` | Log in, returns a JWT |
| GET | `/api/auth/me` | Current user (auth required) |
| GET | `/api/restaurants` | List/search/filter restaurants |
| GET | `/api/restaurants/:id` | Restaurant details, menu, reviews |
| POST | `/api/restaurants` | Create a restaurant (owner) |
| POST/PUT/DELETE | `/api/restaurants/:id/menu[/:itemId]` | Manage menu items (owner) |
| POST | `/api/reviews/:restaurantId` | Add/update a review (auth) |
| POST | `/api/orders` | Place an order (auth) |
| GET | `/api/orders/mine` | Customer's order history (auth) |
| GET | `/api/orders/restaurant/:restaurantId` | Orders for an owned restaurant (owner) |
| PUT | `/api/orders/:id/status` | Update order status (owner) |

## Notes / next steps

- Payments are mocked — placing an order does not integrate a real payment gateway.
- There is a single delivery address per order; no geolocation/maps integration.
- No image upload — restaurant/menu images are set via URL.
