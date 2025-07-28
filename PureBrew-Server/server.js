require('dotenv').config();
const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const path = require("path");
const userRoutes = require("./routes/userRoutes");
const ActivityLog = require("./models/ActivityLog");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");

connectDB();

const app = express();

app.use(express.json());
app.use(cookieParser());

// ✅ Helmet with relaxed COOP & COEP
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: false,
}));

// ✅ Custom CSP for Vite (localhost:5174)
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'", "http://localhost:5174"],
    scriptSrc: ["'self'", "'unsafe-inline'", "https://www.google.com", "https://www.gstatic.com", "http://localhost:5174"],
    styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "http://localhost:5174"],
    imgSrc: ["'self'", "data:", "http://localhost:5001", "http://localhost:5174"],
    connectSrc: ["'self'", "http://localhost:5001", "http://localhost:5174"],
    fontSrc: ["'self'", "https://fonts.gstatic.com", "http://localhost:5174"],
    objectSrc: ["'none'"],
    upgradeInsecureRequests: [],
  },
}));

// ✅ CORS to allow frontend
app.use(cors({
  origin: "http://localhost:5174",
  credentials: true,
}));

// ✅ Serve /uploads with CORS headers
app.use("/uploads", (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:5174");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Log IP Middleware
async function logIpMiddleware(req, res, next) {
  let token = req.header("Authorization")?.split(" ")[1];
  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  let m_user = 'Guest';
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      m_user = user;
    } catch (err) {
      m_user = 'Guest';
    }
  }

  const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  let info = '';
  const userLabel = m_user ? `User (${m_user.name})` : 'Visitor';

  if (req.originalUrl.startsWith('/api/auth/login') && req.method === 'POST') {
    info = `${userLabel} logged in`;
  } else if (req.originalUrl.startsWith('/api/auth/logout')) {
    info = `${userLabel} logged out`;
  } else if (req.originalUrl.startsWith('/api/auth/register') && req.method === 'POST') {
    info = `${userLabel} registered`;
  } else if (req.originalUrl.startsWith('/api/auth/forgot-password')) {
    info = `${userLabel} requested password reset`;
  } else if (req.originalUrl.startsWith('/api/auth/reset-password') && req.method === 'POST') {
    info = `${userLabel} reset password`;
  } else if (req.originalUrl.startsWith('/api/users/profile') && req.method === 'PUT') {
    info = `${userLabel} updated profile`;
    if (req.body.password) info = `${userLabel} changed password`;
  } else if (req.originalUrl.startsWith('/api/bookings') && req.method === 'POST') {
    info = `${userLabel} created a booking`;
  } else if (req.originalUrl.startsWith('/api/bookings') && req.method === 'GET') {
    info = `${userLabel} viewed bookings`;
  } else if (req.originalUrl.startsWith('/api/contact') && req.method === 'POST') {
    info = `${userLabel} submitted a contact form`;
  } else if (req.originalUrl.startsWith('/api/coffees') && req.method === 'GET') {
    info = `${userLabel} viewed coffees`;
  } else {
    info = `${userLabel} accessed ${req.originalUrl}`;
  }

  const logEntry = {
    ip,
    action: 'Request',
    user: m_user && m_user._id ? m_user._id : undefined,
    userAgent: req.headers['user-agent'],
    url: req.originalUrl,
    method: req.method,
    info,
    meta: {
      body: req.body,
      query: req.query,
      params: req.params
    }
  };

  ActivityLog.create(logEntry).catch(err => {
    console.error('Failed to save activity log:', err);
  });

  next();
}

app.use(logIpMiddleware);

// ✅ API Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/coffees", require("./routes/coffeeRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/contact", require("./routes/contactRoutes"));
app.use("/api/users", userRoutes);

// ✅ Admin log route
app.get("/api/users/activity-logs", async (req, res) => {
  try {
    const { user } = req.query;
    const filter = user ? { user } : {};
    const logs = await ActivityLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(500)
      .populate('user', 'name email');
    res.json(logs);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  // Production-ready logging (no sensitive info)
  if (process.env.NODE_ENV === 'development') {
    console.log(`🚀 Server running on port ${PORT}`);
  }
});
