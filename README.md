#                                                       🏡 WanderLust

A full-stack travel accommodation platform where hosts can list their properties and travelers can discover, book, and review unique stays around the world. Think of it as a simplified Airbnb — built from scratch with real payments, real-time messaging, and an admin dashboard.


![Node.js](https://img.shields.io/badge/Node.js-v20.15-339933?logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-Backend-339933?logo=express&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-Realtime-339933?logo=socketdotio&logoColor=white)


---

## What's Inside

This isn't a tutorial project. It's got actual features people use:

- **Browse & Search** — Filter listings by category, location, price range, and more
- **Book & Pay** — Integrated with [Razorpay](https://razorpay.com/) for real payment processing (test mode)
- **Real-Time Chat** — Guests and hosts can message each other instantly via Socket.IO
- **Reviews & Ratings** — Leave detailed reviews with aspect-based ratings (cleanliness, accuracy, etc.)
- **Host Dashboard** — Manage your listings, track bookings, handle cancellations
- **Admin Panel** — Full dashboard with user management, listing approvals, review moderation, and PDF reports
- **Trust & Safety** — Host reliability scores, review authenticity checks, listing verification system
- **Wishlist** — Save your favorite listings
- **Notifications** — Get notified about bookings, cancellations, messages
- **Maps** — Every listing has a map pin via [Mapbox](https://www.mapbox.com/)
- **Image Uploads** — Powered by [Cloudinary](https://cloudinary.com/)
- **Email Alerts** — Automated emails for bookings, cancellations, and reports

---

## Tech Stack

| Layer | Tech |
|-------|------|
| **Frontend** | React 18, Vite, Framer Motion, Material UI, Recharts |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas (Mongoose ODM) |
| **Auth** | JWT + Passport.js (Local + JWT strategies) |
| **Payments** | Razorpay |
| **Real-time** | Socket.IO |
| **File Storage** | Cloudinary |
| **Maps** | Mapbox GL JS |
| **Email** | Nodemailer (Gmail SMTP) |
| **Security** | Helmet, CORS, Rate Limiting, bcrypt via passport-local-mongoose |

---

## Project Structure

```
WanderLust/
├── backend/
│   ├── app.js                  # Entry point — Express server + Socket.IO
│   ├── middleware.js            # Auth middleware (JWT verification, admin checks)
│   ├── cloudConfig.js           # Cloudinary setup
│   ├── schema.js                # Joi validation schemas
│   ├── config/
│   │   └── passport.js          # Passport strategies (Local + JWT)
│   ├── controllers/
│   │   ├── listing.js           # CRUD for listings + geocoding
│   │   ├── user.js              # Signup, login, profile management
│   │   ├── review.js            # Reviews with pagination
│   │   ├── message.js           # Real-time messaging logic
│   │   ├── notification.js      # In-app notifications
│   │   ├── wishlist.js          # Wishlist management
│   │   ├── cancellation.js      # Booking/listing cancellations + auto-rebooking
│   │   ├── trust.js             # Trust scores, review authenticity
│   │   ├── adminController.js   # Admin CRUD + dashboard stats
│   │   ├── adminReportController.js  # PDF report generation
│   │   ├── reportController.js  # User-submitted listing reports
│   │   └── alternativeBookingController.js  # Rebooking after cancellation
│   ├── models/                  # Mongoose schemas (User, Listing, Booking, Review, etc.)
│   ├── routes/                  # Express routers (one per feature)
│   ├── services/
│   │   └── emailService.js      # All email templates + sending logic
│   ├── socket/
│   │   └── messageSocket.js     # Socket.IO event handlers
│   └── util/
│       ├── rebookingHelper.js   # Find alternative listings
│       └── trustScoring.js      # Trust score calculation
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # Routes + layout
│   │   ├── AuthContext.jsx      # Auth state management
│   │   ├── components/
│   │   │   ├── views/           # Main pages (Listings, ListingDetail, BookingPage, etc.)
│   │   │   ├── users/           # Login, Signup, Account page
│   │   │   ├── Admin/           # Admin dashboard, user/listing/review management
│   │   │   ├── layouts/         # Navbar, Footer, common layouts
│   │   │   ├── extras/          # Terms, Privacy, Help Center
│   │   │   ├── hooks/           # Custom hooks (useSocket)
│   │   │   ├── trust/           # Trust & verification UI components
│   │   │   └── lib/             # API client config
│   │   └── utilis/
│   │       ├── css/             # Component stylesheets
│   │       └── js/              # Utility functions (storage, notifications)
│   └── vite.config.js
```

---

## Getting Started

### Prerequisites

You'll need these installed on your machine:

- [Node.js](https://nodejs.org/) (v18 or higher — I used v20.15)
- [Git](https://git-scm.com/)
- A [MongoDB Atlas](https://www.mongodb.com/atlas) account (free tier works fine)
- A [Cloudinary](https://cloudinary.com/) account (free tier)
- A [Mapbox](https://www.mapbox.com/) account (free tier)
- A [Razorpay](https://razorpay.com/) account (test mode — no real money needed)

### 1. Clone the repo

```bash
git clone https://github.com/Joel112003/WanderLust.git
cd WanderLust
```

### 2. Set up the backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` folder:

```env
NODE_ENV=development
PORT=8000

# Generate these yourself — run: node -p "require('crypto').randomBytes(64).toString('hex')"
JWT_SECRET=your_jwt_secret_here
ADMIN_JWT_SECRET=your_admin_jwt_secret_here
SESSION_SECRET=your_session_secret_here

# MongoDB Atlas — get your connection string from Atlas dashboard
ATLAS_DB=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority

# Cloudinary — get these from your Cloudinary dashboard
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Mapbox — get your token from mapbox.com/account/access-tokens
MAPBOX_TOKEN=your_mapbox_token

# Razorpay — get test keys from Razorpay dashboard
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Email — use a Gmail App Password (not your regular password)
# Go to: Google Account → Security → 2-Step Verification → App Passwords
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASS=your_16_char_app_password
ADMIN_EMAIL=your_email@gmail.com

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173/
```

> **How to get a Gmail App Password:** Go to [myaccount.google.com](https://myaccount.google.com/) → Security → 2-Step Verification (turn it on first) → App Passwords → Generate one for "Mail". You'll get a 16-character password.

Start the backend:

```bash
npm run dev
```

You should see:

```
╔════════════════════════════════════════╗
║    ✅ WanderLust Server Started        ║
║    Port: 8000
║    Environment: development
║    Socket.IO: Enabled ✅               ║
╚════════════════════════════════════════╝
```

### 3. Set up the frontend

Open a new terminal:

```bash
cd frontend
npm install --legacy-peer-deps
```

Create a `.env` file in the `frontend/` folder:

```env
VITE_APP_MAPBOX_TOKEN=your_mapbox_token
VITE_APP_API_URL=http://localhost:8000
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
```

> ⚠️ **Important:** Never put secret keys in the frontend `.env`. Only public keys go here (like `KEY_ID`, not `KEY_SECRET`).

Start the frontend:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser. That's it — you're running!

---

## API Endpoints

Here's a quick overview. All endpoints return JSON.

### Auth
| Method | Endpoint | What it does |
|--------|----------|-------------|
| POST | `/auth/signup` | Register a new user |
| POST | `/auth/login` | Log in (returns JWT token) |
| POST | `/auth/logout` | Log out |
| GET | `/auth/profile` | Get current user's profile |
| PUT | `/auth/profile-update` | Update profile |
| GET | `/auth/host/:id` | View a host's public profile |

### Listings
| Method | Endpoint | What it does |
|--------|----------|-------------|
| GET | `/listings` | Get all approved listings |
| GET | `/listings/search` | Search listings |
| GET | `/listings/:id` | Get listing details |
| POST | `/listings` | Create a listing (auth required) |
| PUT | `/listings/:id` | Update a listing (owner only) |
| DELETE | `/listings/:id` | Delete a listing (owner only) |
| PATCH | `/listings/:id/unavailable-dates` | Set unavailable dates |
| PATCH | `/listings/:id/status` | Approve/reject listing (admin only) |

### Bookings
| Method | Endpoint | What it does |
|--------|----------|-------------|
| GET | `/bookings/listing/:listingId` | Get bookings for a listing (public — for calendar) |
| POST | `/bookings` | Create a booking |
| GET | `/bookings/my-bookings` | Get your bookings |
| PUT | `/bookings/:id/confirm` | Host confirms a booking |
| PUT | `/bookings/:id/cancel` | Cancel your booking |
| GET | `/bookings/owner/listings` | Get all bookings for your listings (host) |
| POST | `/bookings/:id/cancel-by-owner` | Host cancels booking + auto-rebooking |

### Payments (Razorpay)
| Method | Endpoint | What it does |
|--------|----------|-------------|
| POST | `/api/payment/create-order` | Create Razorpay order before payment |
| POST | `/api/payment/verify` | Verify payment signature after payment |
| GET | `/api/payment/bookings` | Get user's paid bookings |
| POST | `/api/payment/cancel/:id` | Cancel a pending booking |

### Reviews
| Method | Endpoint | What it does |
|--------|----------|-------------|
| GET | `/listings/:id/reviews` | Get reviews for a listing |
| POST | `/listings/:id/reviews` | Add a review |
| DELETE | `/listings/:id/reviews/:reviewId` | Delete your review |

### Messages
| Method | Endpoint | What it does |
|--------|----------|-------------|
| POST | `/messages` | Send a message |
| GET | `/messages/conversations` | Get all your conversations |
| GET | `/messages/unread/count` | Get unread message count |
| GET | `/messages/listing/:listingId` | Get messages for a listing |
| PUT | `/messages/:messageId/read` | Mark message as read |

### Other
| Method | Endpoint | What it does |
|--------|----------|-------------|
| GET/POST/DELETE | `/wishlist` | Manage your wishlist |
| GET/PUT/DELETE | `/notifications` | Manage notifications |
| POST | `/api/reports/listing` | Report a listing |
| GET | `/trust/host-reliability/:hostId` | Get host trust score |
| GET | `/trust/listing-trust/:listingId` | Get listing trust metrics |
| GET | `/health` | Health check (for monitoring) |

### Admin
| Method | Endpoint | What it does |
|--------|----------|-------------|
| POST | `/admin/login` | Admin login |
| GET | `/admin/dashboard` | Dashboard stats |
| GET | `/admin/users` | List all users |
| GET | `/admin/listings` | List all listings (including pending) |
| GET | `/admin/reviews` | List all reviews |
| GET | `/admin/reports/generate` | Generate PDF report |

---

## Setting Up Third-Party Services

### MongoDB Atlas
1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) and create a free cluster
2. Click **Connect** → **Connect your application**
3. Copy the connection string and replace `<password>` with your actual password
4. Paste it as `ATLAS_DB` in your `.env`

### Cloudinary
1. Sign up at [cloudinary.com](https://cloudinary.com/)
2. Go to your **Dashboard** — you'll see Cloud Name, API Key, and API Secret right there
3. Copy them into your `.env`

### Mapbox
1. Sign up at [mapbox.com](https://www.mapbox.com/)
2. Go to [Account → Access Tokens](https://account.mapbox.com/access-tokens/)
3. Copy your default public token
4. Put it in both `backend/.env` (as `MAPBOX_TOKEN`) and `frontend/.env` (as `VITE_APP_MAPBOX_TOKEN`)

### Razorpay
1. Sign up at [razorpay.com](https://razorpay.com/)
2. Go to **Settings → API Keys → Generate Test Key**
3. You'll get a Key ID and Key Secret
4. `RAZORPAY_KEY_ID` goes in both backend and frontend `.env`
5. `RAZORPAY_KEY_SECRET` goes in backend `.env` **only** (never expose this on the frontend)

---

## Deployment

The project is set up for [Render](https://render.com/). There's a `render.yaml` in the backend folder.

**Backend (Render):**
1. Connect your GitHub repo to Render
2. Set build command: `npm install`
3. Set start command: `node app.js`
4. Add all your `.env` variables in Render's Environment tab

**Frontend (Vercel or Render):**
1. Set build command: `npm run build`
2. Set output directory: `dist`
3. Add frontend env variables (`VITE_APP_*`)
4. Update `VITE_APP_API_URL` to point to your deployed backend URL

Don't forget to update `FRONTEND_URL` in the backend `.env` to match your deployed frontend URL (for CORS to work).

---

## Things I'd Improve

If I had more time, here's what I'd add:

- **Tests** — Unit and integration tests with Jest + Supertest. The test script is currently a placeholder.
- **Image optimization** — Auto-compress images before uploading to Cloudinary
- **Redis caching** — For search results and frequently accessed listings (not needed at current scale though)
- **Rate limiting per user** — Current rate limiting is IP-based, per-user would be better
- **Proper CI/CD** — GitHub Actions for automated testing and deployment
- **Error monitoring** — Sentry or similar for production error tracking

## Status
🚧 Actively developed — some features like tests and Redis caching are planned but not yet implemented.

---

## Contributing

Pull requests are welcome! If you find a bug or have a feature idea:
If this project helped you, consider giving it a ⭐ — it helps a lot!
1. Fork the repo
2. Create your branch (`git checkout -b feature/cool-feature`)
3. Commit your changes (`git commit -m 'Add cool feature'`)
4. Push to the branch (`git push origin feature/cool-feature`)
5. Open a Pull Request

---

## License

This project is open source and available under the [MIT License](LICENSE).

---

Built by [Joel](https://github.com/Joel112003) ☕
