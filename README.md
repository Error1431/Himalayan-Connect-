# Himalaya Connect

A full-stack platform connecting Himalayan farmers and homestay owners directly with customers — organic produce, village homestays, and a role-aware AI assistant ("Pahadi Mitra"), with zero middlemen.

## Project Structure

```
Himalaya-Connect/
├── Backend/     Express + MongoDB API (auth, products, homestays, chat, orders, payments)
└── Frontend/    React (CRA) client
```

## Getting Started

### 1. Backend

```bash
cd Backend
npm install
cp .env.example .env   # then fill in your own values (see below)
npm run dev             # nodemon, http://localhost:5000
```

### 2. Frontend

```bash
cd Frontend
npm install
npm start                # http://localhost:3000
```

## Backend Environment Variables (`Backend/.env`)

| Variable | Required | Notes |
|---|---|---|
| `MONGO_URI` | Yes | MongoDB connection string (Atlas or local) |
| `JWT_SECRET` / `JWT_REFRESH_SECRET` | Yes | Any long random strings |
| `FRONTEND_URL` | Yes | Used for CORS and for links inside verification emails |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM` | No | For sending real verification emails. If left blank, verification emails are printed to the server console instead — handy for local dev, but set these before deploying. |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | For payments | From your Razorpay dashboard |
| `WEATHER_API_KEY` | For Farmer Dashboard weather | — |
| `OPENAI_API_KEY` | For the real AI assistant (Week 7) | From platform.openai.com. Without it, chat still works using the local rule-based engine, just without real AI answers for open-ended questions. |

**Important:** `Backend/.env` is git-ignored on purpose and is **not** included in this zip. Create your own from `Backend/.env.example`. If you previously shared a `.env` file containing real database/API credentials with anyone (including in a chat), treat those credentials as compromised and rotate them (change the MongoDB password, regenerate API keys) — don't just delete the file.

## What Changed In This Pass

**Fixed (app-breaking):**
- `Backend/package.json` was missing `mongoose`, `axios`, and `razorpay` even though the code requires them — a fresh `npm install` would leave the server unable to start. Added them.
- `Frontend/src/pages/Home.js` imported `../components/AIAssistant`, a path that never existed in the project — this alone would fail the whole React build. The floating AI button now opens the real `/ai-assistant` page instead.
- `Frontend/src/pages/FarmerDashboard.js` used the same kind of duplicate/broken AI widget (with a placeholder Anthropic API key that was never going to work) — removed it and pointed "AI Advisory" at the same unified `/ai-assistant` page.
- A stray self-import (`./ui` inside `components/ui/RazorpayCheckoutButton.jsx`) fixed to `.`.

**AI Assistant — now role-locked, per your instructions:**
- The role picker (the "Farmer / Homestay / Customer" screen) is gone. A logged-in user's assistant is now derived automatically from their account role — a farmer only ever sees the Farmer assistant, a homestay owner only the Homestay assistant, a customer only the Customer assistant. There's no "Switch Role" button anymore.
- Anyone browsing without an account gets a single, limited **Guest Assistant** that answers basic questions and prompts them to log in or register for the full experience.

**Seller name + profile + messaging on listings:**
- Every product card (Products page) and homestay card (Homestays page) now shows the farmer/owner's name, linking to their existing public profile page (`/profile/:id`) where their listings are shown.
- Added a **Message** button on both, which opens `/messages` and starts (or resumes) a chat with that seller — this uses the chat system that already existed in the backend.

**Cart + Wishlist:**
- Added a **Wishlist** feature (new `WishlistContext`, saved in the browser) with a heart button on every product and homestay card.
- Added an **Add to Cart** button on products (wired to the existing `CartContext`).
- Settings page now has two new tabs: **Orders** (pulls from the existing `/api/orders` endpoint) and **Wishlist** (manage saved items, message the seller, or remove them).

**Auth & security (Week 6 checklist):**
- Registration now generates an email-verification link (`GET /api/auth/verify-email/:token`, valid 24h) and emails it via `nodemailer`. If SMTP isn't configured, the email is printed to the server console instead of failing — useful for local dev.
- Added `POST /api/auth/resend-verification` for a logged-in user to request a new link.
- Added rate limiting (5 requests / 15 minutes) on `/api/auth/login` and `/api/auth/register`.
- Added `express-validator` checks on register/login request bodies (valid email, password length, valid role, etc.), returning clean 400 responses.
- CORS was already restricted to `FRONTEND_URL` only — left as-is.
- JWT auth, bcrypt hashing, and protected routes/middleware were already implemented correctly and were left untouched.
- **Google OAuth ("Sign in with Google")** is wired up end-to-end with Passport.js (`Backend/config/passport.js`, `GET /api/auth/google`, `GET /api/auth/google/callback`, and a `Sign in / Sign up with Google` button on the Login and Register pages, landing on a new `/oauth-success` page). It only activates once you add your own `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` to `Backend/.env` — see below. Until then, the button shows a clear "not configured yet" message instead of crashing.

### Setting up Google Sign-In

1. Go to the [Google Cloud Console credentials page](https://console.cloud.google.com/apis/credentials), create an **OAuth 2.0 Client ID** (type: Web application).
2. Add `http://localhost:5000/api/auth/google/callback` as an **Authorized redirect URI** (add your production callback URL too, once deployed).
3. Copy the generated Client ID and Client Secret into `Backend/.env` as `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
4. Restart the backend. The Google button on Login/Register will now work.

New accounts created via Google land as a **Customer** by default (their email is already verified by Google) — they can upgrade to Farmer/Homestay from Settings if needed.

## Week 7 — Real AI Integration ("Pahadi Mitra" gets smarter)

The chat assistant already had a fast, local rule-based engine
(`Frontend/src/utils/ai-engine.js`) covering common questions (crop advice, prices,
recipes, etc.) — that's kept exactly as it was, so nothing that already worked changed.

What's new: when that local engine doesn't have a specific answer, the chat now
escalates the question to a **real AI backend endpoint**, `POST /api/ai/assistant`,
which calls OpenAI (`gpt-4o-mini`) with a system prompt grounded in Himalaya Connect's
actual products, prices, and the three user roles — see `Backend/services/openaiService.js`
and `PROMPTS.md` (prompt iterations tested + why the final one was chosen).

**How to enable it:**
1. Get a key from [platform.openai.com/api-keys](https://platform.openai.com/api-keys).
2. Add `OPENAI_API_KEY=sk-...` to `Backend/.env`.
3. Restart the backend (`Ctrl+C`, then `npm run dev`).
4. Open the AI Assistant in the app and ask something the quick-reply buttons don't
   cover (e.g. "how do I price a new product I've never sold before?") — you'll see the
   typing/loading indicator while it calls the real API, then a generated answer.

**What happens without a key:** the endpoint responds with a clear "not configured"
message instead of crashing, the chat shows a small toast, and falls back to the local
engine's generic response — the feature degrades gracefully rather than breaking the app.

**Error handling implemented:** request timeout (20s), OpenAI rate-limit/quota errors,
and missing configuration are all caught separately in `Backend/controllers/aiController.js`
and shown as distinct, human-readable messages rather than a generic failure.

**Rate limiting:** `POST /api/ai/assistant` is capped at 20 requests / 15 minutes per IP
(`Backend/middleware/rateLimiter.js`) to keep API costs bounded.

## Real Payments, Addresses & Bug Fixes (this pass)

### Real payment flow (Homestay booking + Product Buy Now)
`Backend/routes/payments.js` used to return **hardcoded fake "success" responses**
without ever talking to Razorpay — every payment "succeeded" instantly with no real
transaction. That's fixed: it now calls a real `paymentController.js` that creates a
genuine Razorpay order and verifies the payment signature server-side.

- **Homestay booking** (`/booking/:id`, `Frontend/src/pages/BookingPage.js`) — this page
  existed but was **never actually wired into the app**; the route showed a fake "Booking
  Engine... verifying structural handshake metrics" loading screen that never resolved.
  It's now connected, with a new **Address step** added to Guest Details, and the final
  step opens **Razorpay's real checkout modal** (UPI incl. Google Pay/PhonePe, debit/credit
  cards, netbanking, wallets — all built into one modal) instead of a fake dropdown.
- **Product "Buy Now"** (`Frontend/src/pages/ProductCheckout.js`, new) — same pattern:
  address form, then real Razorpay payment, then the order is created.
- Both remove the old WhatsApp-based "Order"/"Book via WhatsApp" buttons per your
  instructions — the only paths now are through the app itself with real payment.
- New `Backend/.env` var needed: `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` (get free test
  keys at [dashboard.razorpay.com](https://dashboard.razorpay.com) — use test mode, no
  real money needed for demoing).

### Sample/dummy listings could never actually be booked
Both the Products and Homestays pages always mixed in a few hardcoded sample cards
(`dummy_1`, `dummy_2`...) alongside real database listings — clicking "Book Direct" or
"Buy Now" on one of these led to a dead page (that `/booking/dummy_2` screenshot). Fixed:
sample listings now only appear when there are **zero real ones** (so the page never
looks empty), are clearly labelled, and their buttons show an explanatory message instead
of leading anywhere broken.

### Removed hardcoded/placeholder phone numbers
Every WhatsApp-based flow (`wa.me/919876543210`, `tel:+919876543210`, etc.) is gone along
with the WhatsApp buttons themselves, across Products, ProductCard, HomestayDetail, and
BookingPage. The homestay detail page's "Contact Host" card now shows the **real host's
phone** (if they've shared one) and a real in-app **Message Host** button instead of a
hardcoded fake number and a fake email. The Footer/Contact page's placeholder support
number was also cleaned up to `+91 99999 99999` — **update this to your real support
number** before going live.

### Google Sign-In: Login vs. Register now behave correctly
Previously, "Sign in with Google" would silently create a brand-new account for *any*
Google email, even on the Login page. Now:
- **Login page** → only signs in if an account with that Google email already exists.
  If not, it declines with a clear message: *"We couldn't find a Himalaya Connect account
  for that Google email. Please register first."*
- **Register page** → creates a new account if one doesn't exist yet (unchanged).

### Theme dropdown in Settings now actually works
Settings → Preferences → Theme (Light/Dark/Auto) was saved to the database but never
touched the actual app theme — it was completely disconnected from the real dark/light
toggle. Clicking **Save Preferences** now applies the selected theme immediately, in sync
with the navbar's toggle button.

### Toast notifications now disappear
The "✅ apple added to cart" style notifications (bottom-right) were **never auto-dismissing**
— they piled up forever. Root cause: two separate, slightly-incompatible toast
implementations existed in the codebase, and the one actually wired into the app was
missing its dismiss timer entirely. Fixed — toasts now auto-dismiss after 6 seconds.

### Removed an insecure debug endpoint
`POST /api/auth/db-verify` was a leftover debug route that let anyone create a user
record with no password, bypassing normal registration. Removed.

## Deploying (Render backend + Vercel frontend + MongoDB Atlas)

You mentioned you've already connected MongoDB Atlas, deployed the backend on Render, and
the frontend on Vercel — here's what needs to be set correctly for all three pieces to
talk to each other:

**On Render (backend), set these environment variables** (Render dashboard → your service
→ Environment):
- `MONGO_URI` — your Atlas connection string
- `JWT_SECRET`, `JWT_REFRESH_SECRET` — any long random strings
- `FRONTEND_URL` — your **exact** Vercel URL, e.g. `https://himalaya-connect.vercel.app`
  (no trailing slash — the backend now strips one if you include it anyway, but best to
  match exactly)
- `BACKEND_URL` — your **exact** Render URL, e.g. `https://himalaya-connect-api.onrender.com`
  (required for Google OAuth's callback URL to be correct in production — without this it
  defaults to `localhost` and Google sign-in will fail on the live site)
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `OPENAI_API_KEY`, `GOOGLE_CLIENT_ID`,
  `GOOGLE_CLIENT_SECRET`, `SMTP_*` — same as local, from `.env.example`
- Render's own `PORT` is set automatically — the app already reads `process.env.PORT`
  correctly.

**On Google Cloud Console** (if using Google Sign-In in production): add your Render
callback URL as an Authorized redirect URI too, alongside the localhost one:
`https://your-backend.onrender.com/api/auth/google/callback`

**On Vercel (frontend), set this environment variable**:
- `REACT_APP_API_URL` — your **exact** Render backend URL, e.g.
  `https://himalaya-connect-api.onrender.com` (no `/api` at the end, no trailing slash)
- Redeploy after setting it — Create React App bakes env vars in at build time, so just
  changing the variable without a rebuild won't take effect.

**Important operational note about Render's free tier:** product/homestay photos and
avatars are currently stored on local disk (`Backend/uploads/`) via `multer`. Render's
free tier has an **ephemeral filesystem** — anything written to disk is wiped on every
redeploy or when the service spins down from inactivity. This isn't a bug introduced in
this pass, but it will cause uploaded images to disappear over time in production. The
proper fix is to switch image uploads to a persistent store (Cloudinary, AWS S3, or
Render's paid persistent disk) — that's a bigger change requiring its own API keys, so
it's called out here rather than done silently. Let me know if you'd like this wired up
next.

## Global-Ready Registration + Mobile Menu Fix (this pass)

### Registration is now global (country code, state, country)
Since Himalaya Connect is going global, `Register.js` now has:
- A **country code selector** next to the phone number (40 countries, flag + dial code) —
  the final phone number is stored with its real international dial code
  (e.g. `+91 98765 43210`), so numbers from different countries never collide.
- A **Country dropdown** — selecting it also updates the phone's dial code automatically.
- A **State/Region field** — a proper dropdown of Indian states when Country = India,
  and a free-text field for any other country (state/province naming varies too much
  globally for one fixed list).
- Backend: `User` model gained `phoneCountryCode` and `location.country` fields to store
  this; existing users are unaffected (both default sensibly — `+91` / `India`).

### Mobile menu was completely non-functional — now fixed
Found the actual bug: the hamburger (☰) button correctly toggled its icon between ☰ and ✕,
but **the dropdown panel with the actual links never existed in the code** — clicking it
visually "did something" but no menu ever appeared, which matches exactly what you saw.
Added the real mobile menu now: Home, Organic Produce, Homestays, and (depending on login
state) either Login/Register or Messages/Dashboard/Settings/Logout — all with working
links, and it closes automatically after tapping a link or navigating.

## Real OTP Registration, Reviews, Wishlist Page, Market Analysis & More (this pass)

### Registration now has real phone OTP verification (3 steps)
1. **Name + Phone** → tap "Send OTP" — a real 6-digit code is generated and sent via SMS.
2. **Enter the OTP** to verify the number actually belongs to the person registering (with resend + cooldown).
3. **Email, Country/State/District/Address, Password** → account is created — the backend
   rejects account creation unless the phone was genuinely OTP-verified in step 2 (can't be skipped).

**SMS provider:** uses [Fast2SMS](https://www.fast2sms.com/dashboard/dev-api) (India-focused, simple REST API). Add `SMS_API_KEY` to `Backend/.env` — **without it, OTPs are printed to the server console instead of being texted**, so registration still fully works end-to-end for local testing/demos without needing a paid SMS account. Swap providers later by editing `Backend/utils/sms.js` only.

### Settings → Account Verification: Email OTP + Aadhaar/DigiLocker
- **Email verification** now has a real OTP flow (code sent to your email, enter it to verify) — separate from the link-based verification sent at signup, for people who prefer a code.
- **Aadhaar verification**: the existing manual document-upload flow is unchanged and fully working. Added a **"Instantly Verify via DigiLocker"** button above it.
  - ⚠️ **Important:** DigiLocker (India's government ID verification service) requires official partner API credentials, obtained by applying at [partners.digilocker.gov.in](https://partners.digilocker.gov.in) or through a KYC aggregator like Setu or Surepass — this is a business approval process that **only you can complete** (I can't obtain these credentials on your behalf). The button and backend route (`Backend/routes/verification.js`) are fully wired up in the same pattern as Google Sign-In — the moment you add `DIGILOCKER_CLIENT_ID` / `DIGILOCKER_CLIENT_SECRET` to `.env` and implement the callback exchange (scaffolded, with comments pointing at DigiLocker's docs), it goes live. Until then, it shows a clear message and falls back to the manual upload, which works today.

### Real product/homestay reviews (replacing the fake "5.0 stars" on everything)
- The `Review` model existed in the codebase but had **no routes or controller at all** — every product/homestay showed a hardcoded "5.0 (20 reviews)" regardless of reality. Built `Backend/controllers/reviewController.js` + `Backend/routes/reviews.js` from scratch.
- Buyers can now **rate & review** products they've ordered, from Settings → Orders.
- Product/homestay cards now show the **real average and count** (or "No reviews yet" instead of a fake number).
- `ProductCheckout.js` shows real customer reviews before you pay.

### Dedicated Wishlist page + navbar button
- New `/wishlist` page, plus a heart icon next to Messages in the navbar (desktop and mobile), with a live count badge.

### Cart & Buy Now → real Address + Payment (was previously fake)
- **Cart "Place Order"** used to just fire an instant fake order with no address or payment at all. It now goes to a real checkout (`/checkout/cart`) — address form, then Razorpay payment (UPI/Card/Netbanking/Wallet).

### Fixed: Google OAuth was broken for every user after the first
Found the actual cause of the `google_auth_failed` error on your Vercel deployment: new Google sign-ups were all given the same hardcoded placeholder phone number, but `phone` has a unique index in the database — so only the very first person to ever sign in with Google succeeded, and everyone after that hit a duplicate-key error. Each Google account now gets its own unique placeholder. **If you already have a stuck test account** in your Atlas database with phone `0000000000`, delete that one user document (or update its phone) — this code fix only prevents *future* collisions.

### Fixed: profile photo not showing on the public seller/farmer profile
Avatars uploaded from Settings were only ever saved to the `Settings` document (what the navbar reads) and never copied to the `User` document (what public profile pages read) — now synced on every upload. Also fixed the public profile page rendering the image path directly without the backend's URL prefix, which would 404.

### Farmer Dashboard: new "Market Analysis" tab
Mirrors the Homestay Dashboard's booking/analytics feel: total revenue, total orders, a real **Recent Orders** table (was silently broken — it called `/orders/farmer`, an endpoint that never existed, so it always showed nothing), and a price/rating overview of your own listed products. New backend endpoint: `GET /api/orders/received`.

### Homestay listings: multi-photo upload + real gallery
- `AddHomestay.jsx` (the form already existed but had **no image upload at all** and would have been rejected by the backend) now supports 1–6 photos, occupancy (single/double), AC/Non-AC, and amenities — with previews and remove buttons.
- A prominent **"+ Add Homestay"** button was added to the Homestay Dashboard header.
- Homestay listing cards now show an **auto-sliding carousel** through all uploaded photos (`components/ImageCarousel.jsx`) instead of one static image.
- The homestay detail page's hero section was previously **entirely fake** — decorative gradient boxes with emoji (🏔️ 🛏️), not real photos at all. Replaced with a real gallery (main photo + thumbnails) and a full-screen lightbox showing every uploaded photo. Its wishlist heart button was also a fake local toggle disconnected from the rest of the app — now uses the same real wishlist as everywhere else.

### Dark mode: invisible input text, fixed globally
Many forms across the app used plain Tailwind classes (`border-gray-300`, etc.) without a dark-mode variant, so in dark mode the browser's default black input text sat on a dark background — you could see the field outline but not what you typed. Rather than hunting down every individual input across dozens of files, added a global CSS override (`Frontend/src/index.css`, same technique already used elsewhere in this file) so every native input/select/textarea gets correct dark-mode colors automatically, including browser autofill.

## Fixed: Post images/videos turning into a black box after re-login

**What was happening:** you uploaded a post with a photo/video on the live Vercel+Render
site, it displayed correctly right away, but after logging out and back in with a
different account, the post's text details showed up fine while the image/video was just
a black box.

**Root cause:** Render's free tier has an **ephemeral filesystem** — every file your
server writes to disk (via `multer`, for post photos, product images, homestay photos,
avatars — everything) gets **wiped whenever the service redeploys or spins down from
inactivity** (which free-tier services do automatically after ~15 minutes idle). MongoDB
Atlas is unaffected (it's a separate, persistent database), so the post's text/details
kept showing up — the database record was fine — but the actual image file behind that
`/uploads/...` path was gone, hence the black box. This wasn't a one-off glitch; it would
keep happening to *every* uploaded file, for every user, on a schedule tied to Render's
idle timeout.

**Real fix (not a workaround):** `Backend/middleware/upload.js` (shared by posts,
products, homestays, and rooms) and the separate avatar-upload code in
`Backend/controllers/settingsController.js` now use **Cloudinary** — a real, persistent,
CDN-backed file host — when configured, instead of local disk. Cloudinary URLs are full
`https://res.cloudinary.com/...` links, and every place in the app that renders an
uploaded file already checks whether the URL is already absolute before deciding to
prefix the backend's own address — so this required **no frontend changes at all**.

**To activate it:**
1. Sign up free at [cloudinary.com](https://cloudinary.com/users/register/free) (generous
   free tier, no credit card required).
2. From your Cloudinary dashboard, copy your **Cloud name**, **API Key**, and **API Secret**.
3. Add them to `Backend/.env`:
   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
4. Also set these three on **Render's environment variables** (not just your local
   `.env`) before redeploying — this is the part that actually matters for your live site.
5. Restart the backend. New uploads will now go to Cloudinary and persist permanently,
   regardless of Render restarts. **Posts/images already uploaded before this fix will
   still be broken** (their files are already gone) — ask affected users to re-upload
   once this is live.

Without Cloudinary configured, the app automatically falls back to local disk storage
(the previous behavior) so nothing breaks — but the black-box-after-restart issue will
keep happening on Render's free tier until you add these three variables.

**On "dynamic, works with any future .com/.in domain":** this fix also makes the app more
domain-portable in general — since Cloudinary URLs are stored in full and don't depend on
your backend's own domain at all, uploaded media keeps working even if you change your
backend's hosting or custom domain later. The rest of the app (API calls, CORS, OAuth
callbacks) was already built around `FRONTEND_URL` / `REACT_APP_API_URL` environment
variables rather than hardcoded addresses (see the Deploying section above) — so pointing
the whole app at a new custom domain is just an environment-variable change on Render/Vercel, not a code change.

## Forgot Password, Weather Fix, Map on Homestay Form, Multi-Photo Products (this pass)

### Real Forgot Password flow
- "Forgot password?" link on the Login page.
- `Backend/controllers/authController.js`: `forgotPassword` emails a real, time-limited (1 hour) reset link; `resetPassword` verifies the token and updates the password. Always responds with the same generic message regardless of whether the email exists, so this endpoint can't be used to check who has an account.
- New pages: `ForgotPassword.js` and `ResetPassword.js`.

### Weather on the Farmer Dashboard — found and fixed 2 real bugs
1. `Backend/routes/weather.js` existed but was **never mounted** in `server.js` — every request to it 404'd, which is exactly the "API failed" message you saw.
2. The frontend (`WeatherAdvisory.jsx`) was calling OpenWeatherMap **directly from the browser** with an **API key hardcoded in the source code** — visible to anyone who opened devtools, and possibly rate-limited/dead from being exposed for a while.

Both fixed: the route is now mounted (`GET /api/weather/current`, `GET /api/weather/forecast`), and the frontend calls the backend instead — the key now lives only in `Backend/.env` (`WEATHER_API_KEY`, already there from earlier).

### Homestay listing form: Map + ZIP code
Turns out a fully-built `LocationPicker` component (map click-to-set, address search, "use my current location", ZIP verification) already existed in the codebase but was never used on this form. Wired it into `AddHomestay.jsx` — selecting a location now also captures GPS coordinates and ZIP code, both saved on the homestay. Homestay listings also now carry a ready-to-use `mapUrl` (opens the exact location in Google Maps) for the frontend to link to.

### Farmer "Add Product" form: 1–6 photos (was 1 only)
Same pattern as the homestay form: multi-select upload, thumbnail previews, remove button, minimum 1 required. `Backend/routes/product.js` and `productController.js` updated to accept up to 6 images (`Product.images[]`), keeping the first one as `imageUrl` for older UI bits that only read a single image.

### On the recurring Google Sign-In error
The specific duplicate-phone bug from earlier is fixed and confirmed working. If Google sign-in is still failing intermittently, the next most common causes on a Render + Vercel + Atlas setup are, in order of likelihood:
1. **`BACKEND_URL` not set on Render** (or set to the wrong value) — this is used to build the exact callback URL Google redirects to; if it doesn't match what's registered in Google Cloud Console *exactly* (including https/http and no trailing slash), Google will reject it.
2. **MongoDB Atlas Network Access** not allowing Render's IPs — Atlas blocks all connections by default; under Atlas → Network Access, add `0.0.0.0/0` (allow from anywhere) or you'll get intermittent connection failures that look like random errors.
3. Google Cloud Console's **Authorized redirect URIs** missing the exact production callback URL (`https://your-backend.onrender.com/api/auth/google/callback`).

Server-side error logging was also improved (`Backend/routes/auth.js`) to print the specific error name/message/code to Render's logs — if it happens again, check the Render service logs right after reproducing it and share that text; the frontend only ever sees a generic error code by design (so failed logins don't leak internal details), so I need the server-side log line to diagnose further.
