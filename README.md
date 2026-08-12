# Fade Connect — Smart Salon Appointment Booking System

A full-stack MERN application that lets customers discover nearby salons, book a specific
barber and time slot, and pay online — while salon owners manage their profile, staff,
services, schedule, and bookings from a dashboard, and admins moderate the platform.

This build focuses on a **fully working core flow** (auth → search → salon detail → book →
pay → manage) end to end, with the admin panel and a few peripheral screens (notifications,
coupons) kept intentionally lighter.

---

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS, React Router, Axios, Recharts, lucide-react |
| Backend | Node.js, Express |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcrypt |
| Image uploads | Cloudinary (falls back to local disk in dev) |
| Payments | Razorpay (falls back to a simulated payment in dev) |
| Email | Nodemailer (falls back to console logging in dev) |

---

## Project structure

```
fade-connect/
├── server/                # Express API
│   ├── src/
│   │   ├── config/        # db, cloudinary, razorpay
│   │   ├── models/        # Mongoose schemas
│   │   ├── controllers/   # business logic
│   │   ├── routes/        # REST endpoints
│   │   ├── middleware/    # auth, upload, error handling, validation
│   │   ├── utils/         # tokens, email, slot/availability engine
│   │   ├── seed/          # seed.js — sample data
│   │   ├── app.js
│   │   └── server.js
│   └── .env.example
└── client/                # React app
    ├── src/
    │   ├── pages/          # customer/, owner/, admin/, + auth pages
    │   ├── components/     # layout, shared UI, ProtectedRoute
    │   ├── context/        # AuthContext
    │   └── api/axios.js
    └── .env.example
```

---

## Prerequisites

- Node.js 18+
- A MongoDB instance — either:
  - **Local**: install MongoDB Community Server and run `mongod` (not included here — see
    [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)), or
  - **Cloud**: a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (recommended —
    no local install needed, works from any machine)

No other external accounts are required to run the app locally — Cloudinary, Razorpay,
Google Maps, and SMTP all have dev-mode fallbacks (see [Optional integrations](#optional-integrations-cloudinary-razorpay-google-maps-email)).

---

## Setup

### 1. Backend

```bash
cd server
npm install
cp .env.example .env
```

Edit `server/.env` and set `MONGO_URI` to your database:

```
# Local MongoDB
MONGO_URI=mongodb://127.0.0.1:27017/fade-connect

# OR MongoDB Atlas
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/fade-connect
```

Also set `JWT_SECRET` to any long random string.

Seed the database with sample salons, barbers, services, slots, a completed booking + review,
and coupons:

```bash
npm run seed
```

This prints sample login credentials when it finishes, e.g.:

```
Admin:     admin@fadeconnect.app / admin123
Owner:     owner1@fadeconnect.app / owner123  (The Gentlemen's Parlour)
Customer:  customer1@fadeconnect.app / customer123
```

Start the API:

```bash
npm run dev      # nodemon, auto-restarts on changes
# or
npm start
```

The API runs on `http://localhost:5000` by default. Check `http://localhost:5000/api/health`.

### 2. Frontend

In a second terminal:

```bash
cd client
npm install
cp .env.example .env   # defaults work out of the box for local dev
npm run dev
```

Open `http://localhost:5173`. The Vite dev server proxies `/api` and `/uploads` requests to
the backend on port 5000 (see `client/vite.config.js`), so no CORS setup is needed locally.

### 3. Log in

Use the seeded credentials above, or register a new **Customer** or **Salon Owner** account
from the UI. New owner accounts are prompted to set up their salon profile immediately after
registering; new salons start in `pending` status until an admin approves them (the seeded
salons are pre-approved).

---

## Optional integrations (Cloudinary, Razorpay, Google Maps, Email)

Every third-party integration is wired with real SDK code, but has a safe fallback so the
app is fully usable without any of these accounts:

| Integration | Without credentials | With credentials |
|---|---|---|
| **Cloudinary** (image uploads) | Files are saved to `server/uploads` and served locally | Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` |
| **Razorpay** (payments) | `MOCK_PAYMENTS=true` auto-simulates a successful payment | Set `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` and `MOCK_PAYMENTS=false` |
| **Google Maps** (salon location) | Salon detail page embeds a Google Maps view via the no-key embed URL (`google.com/maps?q=lat,lng&output=embed`), plus a "Get directions" link | Set `VITE_GOOGLE_MAPS_API_KEY` in `client/.env` to enable richer JS-API features later (autocomplete, custom markers) |
| **SMTP / Nodemailer** (emails) | Emails are logged to the server console | Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` |

---

## The AI Hairstyle feature

`POST /api/ai/hairstyle` accepts a selfie upload and returns a face-shape estimate,
hairstyle/beard/color recommendations, and a match score. **This is a mocked recommendation
engine** — it derives a deterministic (but not real computer-vision-based) result from a hash
of the uploaded image, so the UI and API contract are fully built out and ready to swap in a
real model (e.g., a TensorFlow.js face-landmark model or a dedicated CV microservice) without
changing the frontend.

---

## Core booking flow (what's fully implemented)

1. Customer registers/logs in (JWT, bcrypt-hashed passwords)
2. Searches salons by name, city, rating, price, or service (paginated, filtered)
3. Views salon detail: services, barber profiles, business hours, reviews
4. Picks a service → barber → date → an actually-available time slot (computed live from
   the salon's business hours, the barber's working days, blocked/holiday dates, and
   already-booked slots — including a race-condition-safe atomic reservation)
5. Confirms the booking (status `pending`) and pays online (Razorpay or mock)
6. Booking flips to `confirmed` on successful payment; owner can also accept/reject
7. Customer can cancel or reschedule (frees/reserves slots accordingly) from Booking History
8. Owner dashboard shows today's/weekly bookings, monthly revenue, popular services, peak
   hours, and top customers; owner manages salon profile, barbers, services, and slot
   generation (with holiday/blocked-date support) from dedicated pages

Admin, notifications, favorites, and coupons are implemented with working APIs and simpler UI.

---

## Notes on database design

The spec's `Users` / `SalonOwners` / `Admins` collections are implemented as a **single
`User` model with a `role` field** (`customer` | `owner` | `admin`). This is standard
practice for apps where all roles share the same auth flow (login, password reset, profile)
and avoids duplicating that logic across three schemas — role-specific data (salon ownership,
admin permissions) lives on separate collections that reference the user.

---

## Scripts reference

**server/**
- `npm run dev` — start API with nodemon
- `npm start` — start API (production)
- `npm run seed` — wipe + reseed the database
- `npm run seed:destroy` — wipe all collections without reseeding

**client/**
- `npm run dev` — start Vite dev server
- `npm run build` — production build to `client/dist`
- `npm run preview` — preview the production build
- `npm run lint` — run oxlint
