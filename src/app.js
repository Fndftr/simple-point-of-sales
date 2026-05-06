const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');

const viewRoutes = require('./routes/viewRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const stockAdjustmentRoutes = require('./routes/stockAdjustmentRoutes');
const reportRoutes = require('./routes/reportRoutes');
const { attachOptionalViewUser } = require('./middlewares/viewAuthMiddleware');

const app = express();

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use('/public', express.static(path.join(__dirname, '..', 'public')));
app.use(attachOptionalViewUser);

app.use('/', viewRoutes);

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'POS Express API is running',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/stock-adjustments', stockAdjustmentRoutes);
app.use('/api/reports', reportRoutes);

app.get('/api', (req, res) => {
  res.json({
    message: 'POS Express API is running',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      categories: '/api/categories',
      products: '/api/products',
      transactions: '/api/transactions',
      stockAdjustments: '/api/stock-adjustments',
      reports: '/api/reports',
    },
  });
});

app.use((req, res) => {
  if (req.accepts('html')) {
    return res.status(404).render('pages/error', {
      pageTitle: '404',
      message: 'Route tidak ditemukan.',
      currentUser: req.user,
    });
  }

  res.status(404).json({ message: 'Route tidak ditemukan.' });
});

module.exports = app;
