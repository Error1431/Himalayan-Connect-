# Himalaya Connect

A full-stack platform that connects Himalayan farmers and homestay owners directly with customers — organic produce, village homestays, and a role-aware AI assistant ("Pahadi Mitra") — with zero middlemen.

## Live Demo

🔗 **Live App:** [https://himalayan-connect.vercel.app/](https://himalayan-connect.vercel.app/) *
## Demo Video

🎥 **5-Minute Walkthrough:** [https://www.youtube.com/watch?v=lXXBzDSHvuQ](https://www.youtube.com/watch?v=lXXBzDSHvuQ) 

## Screenshots

![alt text](<Screenshot 2026-08-08 135926.png>) ![alt text](<Screenshot 2026-08-08 135911.png>) ![alt text](<Screenshot 2026-08-08 135848.png>) ![alt text](<Screenshot 2026-08-08 135834.png>) ![alt text](<Screenshot 2026-08-08 140332.png>) ![alt text](<Screenshot 2026-08-08 140304.png>) ![alt text](<Screenshot 2026-08-08 135934.png>)
| | |
|---|---|
| ![Home](Frontend/screenshots/home.png) Home | ![Products](Frontend/screenshots/products.png) Products |
| ![AI Assistant](Frontend/screenshots/ai-assistant.png) Pahadi Mitra AI Assistant | ![Dashboard](Frontend/screenshots/dashboard.png) Farmer Dashboard |

## Features

- **Role-based accounts** — Farmer, Homestay Owner, and Customer roles with dedicated dashboards
- **Marketplace** — browse, search, and filter organic produce with seller profiles and messaging
- **Homestay bookings** — listings, availability calendar, and booking confirmation flow
- **"Pahadi Mitra" AI Assistant** — role-locked chat that answers from a local rule-based engine, escalating to OpenAI (`gpt-4o-mini`) for open-ended queries
- **Cart, Checkout & Wishlist** — add-to-cart, saved items, and Razorpay-powered checkout
- **Direct messaging** — real-time chat (Socket.IO) between customers and sellers
- **Reviews & ratings** on products and homestays
- **Farmer Dashboard** — live weather advisory, profit/margin calculator, and order tracking
- **Auth & security** — JWT auth, bcrypt password hashing, email verification, phone OTP (Firebase), Google OAuth sign-in, rate-limited login/register endpoints
- **Admin analytics** dashboard for platform-wide insights
- Fully responsive UI across mobile and desktop

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 (CRA), React Router, Tailwind CSS, Formik + Yup, Chart.js, Framer Motion |
| **Backend** | Node.js, Express, Socket.IO |
| **Database** | MongoDB (Mongoose ODM) |
| **AI** | OpenAI `gpt-4o-mini` + local rule-based fallback engine |
| **Auth** | JWT, bcrypt, Passport.js (Google OAuth), Firebase (phone OTP) |
| **Payments** | Razorpay |
| **File Storage** | Cloudinary (local-disk fallback for dev) |
| **Deployment** | Frontend → Vercel · Backend → Render |

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- A MongoDB connection string (MongoDB Atlas free tier works)

### 1. Clone the repository
```bash
git clone https://github.com/username/repo.git
cd Himalaya-Connect-Final
```

### 2. Backend
```bash
cd Backend
npm install
cp .env.example .env   # fill in your own values — see table below
npm run dev             # http://localhost:5000
```

### 3. Frontend
```bash
cd Frontend
npm install
cp .env.example .env   # set REACT_APP_API_URL=http://localhost:5000
npm start                # http://localhost:3000
```

### Environment Variables (`Backend/.env`)

| Variable | Required | Notes |
|---|---|---|
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` / `JWT_REFRESH_SECRET` | Yes | Any long random strings |
| `FRONTEND_URL` | Yes | Used for CORS and email links |
| `SMTP_*` | No | Sends real verification emails; without it, they're logged to console |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | For payments | From Razorpay dashboard |
| `WEATHER_API_KEY` | For Farmer Dashboard | — |
| `OPENAI_API_KEY` | For real AI answers | Falls back to the local rule-based engine if blank |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | For Google Sign-In | From Google Cloud Console |
| `FIREBASE_*` | For phone OTP | From Firebase service-account JSON |
| `CLOUDINARY_*` | Recommended for production | Local disk is used as a fallback in dev |

`Backend/.env` is git-ignored and **not** included in this zip — copy it from `Backend/.env.example`.

## API Documentation

Base URL: `http://localhost:5000/api`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/register` | Register a new user (Farmer / Homestay / Customer) |
| `POST` | `/auth/login` | Log in, returns JWT access + refresh tokens |
| `GET` | `/auth/verify-email/:token` | Verify email from the emailed link |
| `GET` | `/auth/google` | Start Google OAuth flow |
| `GET` | `/products` | List / search / filter products |
| `POST` | `/products` | Create a product listing (auth: Farmer) |
| `GET` | `/homestay` | List homestays |
| `POST` | `/bookings` | Create a homestay booking |
| `POST` | `/orders` | Place a product order |
| `POST` | `/payments/create-order` | Create a Razorpay order |
| `GET`/`POST` | `/chat` | Fetch or send direct messages |
| `POST` | `/ai/assistant` | Ask the AI assistant (role-aware) |
| `GET` | `/reviews/:targetId` | Get reviews for a product/homestay |

Example request/response:
```http
POST /api/auth/login
Content-Type: application/json

{ "email": "farmer@example.com", "password": "yourpassword" }
```
```json
{
  "token": "eyJhbGciOi...",
  "user": { "id": "...", "name": "...", "role": "farmer" }
}
```

## Architecture / Folder Structure

```
Himalaya-Connect-Final/
├── Backend/
│   ├── controllers/   # request handlers (business logic)
│   ├── routes/        # Express route definitions, auto-mounted under /api
│   ├── models/        # Mongoose schemas (User, Product, Order, Booking, ...)
│   ├── middleware/     # auth guard, rate limiting, validation
│   ├── services/       # openaiService.js — OpenAI integration
│   ├── config/          # passport.js — Google OAuth strategy
│   └── server.js        # app entry point
└── Frontend/
    ├── src/
    │   ├── pages/        # one component per route (Home, Products, Login, ...)
    │   ├── components/   # reusable UI (Navbar, ProductCard, HimalayanAI/, ...)
    │   ├── context/       # AuthContext, CartContext, WishlistContext, ThemeContext
    │   └── utils/          # ai-engine.js, profit-calculator.js, countries.js
    └── public/
```

The frontend talks to the backend only through `REACT_APP_API_URL`; the backend auto-mounts every file in `Backend/routes/` under `/api`.

## Known Limitations

- Without `OPENAI_API_KEY`, the AI assistant answers only from the local rule-based engine (no open-ended AI responses)
- Without Cloudinary credentials, uploaded images are stored on local disk and are lost on redeploy to an ephemeral host (e.g. Render)
- Without SMTP credentials, verification emails are printed to the server console instead of being sent
- Payment flow requires a Razorpay test/live account; checkout can't complete without keys
- DigiLocker (instant Aadhaar verification) is not wired up — manual document upload is used instead
- No automated test suite yet

## Credits & Acknowledgements

- Built as the Week 10 capstone for the TBI–GEU Full-Stack Development Internship
- AI pair-programming assistance from Claude (Anthropic) for debugging, refactoring, and this README
- UI icons via `react-icons`; charts via `Chart.js` / `react-chartjs-2`
