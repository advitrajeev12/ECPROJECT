import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dbConnect from './config/db.js';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xssLib from 'xss';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';

// Routes
import adminRoutes from './routes/adminRoutes.js';
import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/api/authRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import orderRoutes from './routes/orderRoutes.js';

dotenv.config();
console.log(`[Server] Environment: ${process.env.NODE_ENV}`);

const app = express();
const PORT = process.env.PORT || 5001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Trust proxy (important for sessions when behind Next.js or other proxies)
app.set('trust proxy', 1);

// ─── CORS ────────────────────────────────────────────────────────────────────
app.use(cors({
    origin: function (origin, callback) {
        // Allow all origins in development or if origin is not provided
        if (!origin || process.env.NODE_ENV !== 'production') {
            return callback(null, true);
        }

        const allowedOrigins = [
            'http://localhost:3000',
            'http://127.0.0.1:3000',
            'http://10.11.2.119:3000',
            'http://local-origin.dev',
            'https://local-origin.dev'
        ];

        if (
            allowedOrigins.includes(origin) ||
            (origin && (origin.endsWith('.local-origin.dev') || origin === 'http://local-origin.dev' || origin === 'https://local-origin.dev')) ||
            origin.startsWith('http://192.168.') ||
            origin.startsWith('http://10.') ||
            origin.startsWith('http://172.') ||
            origin.startsWith('https://192.168.') ||
            origin.startsWith('https://10.') ||
            origin.startsWith('https://172.')
        ) {
            callback(null, true);
        } else {
            console.warn(`CORS blocked for origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// ─── BODY PARSERS ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// ─── SECURITY MIDDLEWARES ─────────────────────────────────────────────────────
// 1. HTTP Security Headers
const cspDirectives = {
    "default-src": ["'self'"],
    "script-src": ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://checkout.razorpay.com"],
    "style-src": ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com"],
    "img-src": ["'self'", "data:", "https://lh3.googleusercontent.com", "https://drive.google.com", "https://images.unsplash.com", "*"],
    "font-src": ["'self'", "https://cdnjs.cloudflare.com", "https://fonts.gstatic.com"],
    "connect-src": ["'self'", "http://127.0.0.1:5001", "http://localhost:5001", "http://192.168.0.100:5001", "http://172.20.10.2:5001", "http://192.168.29.5:5001", "http://192.168.29.5:3001", "https://www.fast2sms.com", "https://api.razorpay.com", "https://lumberjack.razorpay.com"],
    "frame-src": ["'self'", "https://api.razorpay.com"],
    "frame-ancestors": ["'self'"],
};

if (process.env.NODE_ENV !== 'production') {
    cspDirectives["upgrade-insecure-requests"] = null;
}

app.use(helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: {
        directives: cspDirectives,
    },
}));

// ─── SECURITY SANITIZATION ────────────────────────────────────────────────────
// Custom sanitizers to avoid Express 5 "read-only property" crashes

const sanitizeMongo = (obj) => {
    if (obj && typeof obj === 'object') {
        for (const key in obj) {
            if (key.startsWith('$') || key.includes('.')) {
                delete obj[key];
            } else {
                sanitizeMongo(obj[key]);
            }
        }
    }
};

const deepXssClean = (value) => {
    if (typeof value === 'string') return xssLib(value);
    if (Array.isArray(value)) return value.map(deepXssClean);
    if (value && typeof value === 'object' && !(value instanceof Date)) {
        const cleaned = {};
        for (const [k, v] of Object.entries(value)) cleaned[k] = deepXssClean(v);
        return cleaned;
    }
    return value;
};



// 4. General API rate limiter — 100 req / 15 min per IP
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests. Please try again later.' }
});
app.use('/api', limiter);

// 5. Tighter auth rate limiter — 20 attempts / 15 min (brute-force protection)
const IS_DEV = process.env.NODE_ENV !== 'production';

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: IS_DEV ? 100 : 20,         // unlimited in dev, strict in prod
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many login attempts. Please wait 15 minutes.' }
});
app.use('/api/users/login', authLimiter);
app.use('/api/users/signup', authLimiter);
app.use('/api/users/verify-otp', authLimiter);
app.use('/api/users/verify-msg91-otp', authLimiter);

// OTP rate limiter — relaxed in dev so testing doesn't get blocked
const otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: IS_DEV ? 100 : 5,          // unlimited in dev, strict in prod (prevents SMS spam)
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many OTP requests. Please wait 15 minutes.' }
});
app.use('/api/users/send-otp', otpLimiter);
app.use('/api/users/resend-otp', otpLimiter);

// ─── SESSION (kept for Admin EJS panel only) ──────────────────────────────────
app.use(session({
    secret: process.env.SESSION_SECRET || 'baljyoti_secret_2024',
    resave: true, // Reverting to true for dev troubleshooting
    saveUninitialized: true, // Reverting to true for dev troubleshooting
    cookie: {
        secure: false, // Ensure false for HTTP development
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'lax'
    }
}));

// ─── VIEW ENGINE (Admin Panel) ────────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// ─── DEBUG LOGGER ─────────────────────────────────────────────────────────────
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// ─── SECURITY SANITIZATION ────────────────────────────────────────────────────
// (Moved below static files to prevent interference)
app.use((req, res, next) => {
    // 1. Sanitize for NoSQL Injection (in-place modification is safe for Express 5)
    if (req.body) sanitizeMongo(req.body);
    if (req.query) sanitizeMongo(req.query);
    if (req.params) sanitizeMongo(req.params);

    // 2. Sanitize for XSS (only body is safely replaceable in Express 5)
    if (req.body) {
        try {
            req.body = deepXssClean(req.body);
        } catch (e) {
            Object.assign(req.body, deepXssClean(req.body));
        }
    }
    // For query/params, we modify in-place if they were objects
    if (req.query) {
        const cleaned = deepXssClean(req.query);
        Object.assign(req.query, cleaned);
    }
    next();
});

// ─── DATABASE ─────────────────────────────────────────────────────────────────
dbConnect();

// ─── ROUTES ───────────────────────────────────────────────────────────────────
app.use('/api/products', productRoutes);
app.use('/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/', (req, res) => res.send('Server is running'));

// ─── GLOBAL ERROR HANDLER ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err.message);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
