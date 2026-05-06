const Product = require('../models/Product');
const Transaction = require('../models/Transaction');

exports.dashboard = (req, res) => {
  const summary = Transaction.getSummary();
  const recent = Transaction.getRecentTransactions(5);
  const todayRevenue = Transaction.getTodayRevenue();
  const totalProducts = Product.getAll().length;
  res.render('dashboard', { summary, recent, todayRevenue, totalProducts });
};
