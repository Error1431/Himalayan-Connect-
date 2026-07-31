const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIO = require('socket.io');

dotenv.config();

const { passport } = require('./config/passport');

const app = express();
const server = http.createServer(app);
const aiRoutes = require("./routes/aiRoutes");
app.use("/api/ai", aiRoutes);

// Trim any trailing slash — "https://x.vercel.app/" vs "https://x.vercel.app"
// is a common CORS mismatch when the URL is pasted from a browser address bar.
const FRONTEND_URL = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
const PORT = process.env.PORT || 5000;

// Always allow local dev to talk to a deployed backend too, in addition to
// whatever FRONTEND_URL is set to (e.g. the real Vercel URL in production).
const allowedOrigins = Array.from(new Set([FRONTEND_URL, 'http://localhost:3000']));

// Vercel gives every deployment (production AND every preview build) its
// own unique subdomain like "himalayan-connect-abc123.vercel.app" — a
// single fixed FRONTEND_URL can't cover all of them, which is exactly what
// caused the reported CORS block on a preview URL. Any *.vercel.app origin
// is allowed automatically in addition to the explicit allow-list above.
const vercelPreviewPattern = /^https:\/\/[a-z0-9-]+\.vercel\.app$/i;

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (curl, Postman, server-to-server) which
    // don't send an Origin header at all.
    if (!origin || allowedOrigins.includes(origin) || vercelPreviewPattern.test(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(passport.initialize());

const io = socketIO(server, { cors: corsOptions });

io.on('connection', (socket) => {
  console.log('✅ New client connected:', socket.id);

  socket.on('join-user-room', (userId) => {
    if (userId) {
      socket.join(`user-${userId}`);
      console.log(`👤 User ${userId} joined their room`);
    }
  });

  socket.on('join-farmer-group', (farmerId) => {
    if (farmerId) {
      socket.join(`farmer-${farmerId}`);
      console.log(`👨‍🌾 Farmer ${farmerId} joined room`);
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

app.set('io', io);

const uploadsPath = path.join(__dirname, 'uploads');
const productUploadsPath = path.join(uploadsPath, 'products');
const avatarUploadsPath = path.join(uploadsPath, 'avatars');

[uploadsPath, productUploadsPath, avatarUploadsPath].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

app.use('/uploads', express.static(uploadsPath));

mongoose.connect(
  process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/himalayan_connect'
)
  .then(() => {
    console.log('✅ MongoDB Connected - Himalayan Connect Platform');
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  });

const mountRoute = (routePath, routeFiles) => {
  const candidates = Array.isArray(routeFiles) ? routeFiles : [routeFiles];

  for (const routeFile of candidates) {
    const fullPath = path.join(__dirname, 'routes', routeFile);
    const jsPath = `${fullPath}.js`;

    try {
      if (fs.existsSync(jsPath)) {
        app.use(routePath, require(jsPath));
        console.log(`✅ Route mounted: ${routePath}`);
        return;
      }

      if (fs.existsSync(fullPath)) {
        app.use(routePath, require(fullPath));
        console.log(`✅ Route mounted: ${routePath}`);
        return;
      }
    } catch (error) {
      console.error(`❌ Error mounting route ${routePath}:`, error.message);
      return;
    }
  }

  console.log(`⚠️  Route file missing for ${routePath}: ${candidates.map(file => `routes/${file}.js`).join(' or ')}`);
};

mountRoute('/api/auth', ['auth', 'authRoutes']);
mountRoute('/api/farmers', ['farmers', 'farmerRoutes']);
mountRoute('/api/products', ['product']);
mountRoute('/api/homestays', ['homestay']);
mountRoute('/api/bookings', ['bookings', 'bookingRoutes']);
mountRoute('/api/ai', ['ai', 'aiRoutes']);
mountRoute('/api/orders', ['orders', 'orderRoutes']);
mountRoute('/api/settings', ['settings', 'settingsRoutes']);
mountRoute('/api/chat', ['chat', 'chatRoutes']);
mountRoute('/api/posts', ['posts', 'postRoutes']);
mountRoute('/api/farms', ['farms', 'farmRoutes']);
mountRoute('/api/rooms', ['rooms', 'roomRoutes']);
mountRoute('/api/payments', ['payments', 'paymentRoutes']);
mountRoute('/api/profile', ['profile', 'profileRoutes']);
mountRoute('/api/reviews', ['reviews', 'reviewRoutes']);
mountRoute('/api/otp', ['otp', 'otpRoutes']);
mountRoute('/api/verification', ['verification', 'verificationRoutes']);
mountRoute('/api/weather', ['weather', 'weatherRoutes']);
mountRoute('/api/analytics', ['analytics', 'analyticsRoutes']);

app.get('/api/orders/farmer', (req, res) => {
  res.json([]);
});

app.get('/api/collection-schedule', (req, res) => {
  res.json({
    success: true,
    data: []
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Himalayan Connect API Running',
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime()
  });
});

app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Himalayan Connect Backend Server Running',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      products: '/api/products',
      orders: '/api/orders',
      settings: '/api/settings',
      chat: '/api/chat',
      posts: '/api/posts',
      payments: '/api/payments',
      profile: '/api/profile'
    }
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`
  });
});

app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

server.listen(PORT, () => {
  console.log('');
  console.log('🚀 ═══════════════════════════════════════════════════');
  console.log(`🌐 Server running on port ${PORT}`);
  console.log(`🔗 Frontend URL: ${FRONTEND_URL}`);
  console.log(`📁 Uploads folder: ${uploadsPath}`);
  console.log(`⚙️  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`💬 Socket.IO enabled for real-time chat`);
  console.log('🚀 ═══════════════════════════════════════════════════');
  console.log('');
});