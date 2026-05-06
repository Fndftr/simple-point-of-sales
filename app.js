const express = require('express');
const session = require('express-session');
const methodOverride = require('method-override');
const path = require('path');
const csrf = require('./middleware/csrf');

// Initialize database on startup
require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

// ── View engine ────────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ── Middleware ─────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'simple-pos-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProd,
      sameSite: 'strict',
    },
  })
);

// ── CSRF protection ────────────────────────────────────────────
app.use(csrf);

// Pass cart error to views and clear it
app.use((req, res, next) => {
  res.locals.cartError = req.session.cartError || null;
  delete req.session.cartError;
  next();
});

// ── Routes ─────────────────────────────────────────────────────
const dashboardRoutes = require('./routes/dashboard');
const productRoutes = require('./routes/products');
const transactionRoutes = require('./routes/transactions');

app.use('/', dashboardRoutes);
app.use('/products', productRoutes);
app.use('/', transactionRoutes);

// ── 404 handler ────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).send('<h1>404 – Halaman tidak ditemukan</h1><a href="/">Kembali ke Beranda</a>');
});

// ── Error handler ──────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).send('<h1>500 – Terjadi kesalahan server</h1>');
});

app.listen(PORT, () => {
  console.log(`✅  Simple POS berjalan di http://localhost:${PORT}`);
});

module.exports = app;
