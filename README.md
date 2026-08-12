# Fade Connect

Fade Connect is a full-stack salon booking platform built with **HTML, CSS, JavaScript, Node.js, Express.js, and MongoDB (Mongoose)**.

## Features

- User and salon-owner authentication (JWT)
- Discover salons with search/filter by city and keyword
- Salon profile details with ratings, services, workers, and available slots
- Booking creation with slot validation and booking status management
- Owner dashboard endpoint for booking management
- Profile management (`/api/auth/me`)
- Modular backend structure: models, routes, controllers, middleware, config
- Responsive premium-style frontend in plain HTML/CSS/JS

## Project Structure

```text
backend/
  app.js
  server.js
  config/
  controllers/
  middleware/
  models/
  routes/
  utils/
public/
  index.html
  styles.css
  app.js
```

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Copy env file and set values:

```bash
cp .env.example .env
```

3. Make sure MongoDB is running locally (or set `MONGO_URI` to your instance).

4. Start the app:

```bash
npm start
```

App URL: `http://localhost:5000`  
Health check: `GET /api/health`

## Environment Variables

- `PORT` (default: `5000`)
- `MONGO_URI` (required)
- `MONGO_DB_NAME` (default: `fade_connect`)
- `JWT_SECRET` (required)
- `NODE_ENV` (`development`/`production`)

## Core API Endpoints

- **Auth**: `/api/auth/register`, `/api/auth/login`, `/api/auth/me`
- **Users**: `/api/users` (admin only)
- **Salons**: `/api/salons`
- **Services**: `/api/services`
- **Workers**: `/api/workers`
- **Bookings**: `/api/bookings`, `/api/bookings/me`, `/api/bookings/owner`

All protected routes require `Authorization` header with JWT token.
