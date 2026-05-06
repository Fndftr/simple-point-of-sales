const Product = require('../models/Product');
const Transaction = require('../models/Transaction');

// ── Cart helpers ──────────────────────────────────────────────
function getCart(req) {
  if (!req.session.cart) req.session.cart = [];
  return req.session.cart;
}

// ── POS / Cashier page ────────────────────────────────────────
exports.pos = (req, res) => {
  const products = Product.getAll().filter((p) => p.stock > 0);
  const cart = getCart(req);
  const cartTotal = cart.reduce((sum, i) => sum + i.subtotal, 0);
  res.render('transactions/pos', { products, cart, cartTotal });
};

// ── Add item to cart ──────────────────────────────────────────
exports.addToCart = (req, res) => {
  const { product_id, quantity } = req.body;
  const qty = parseInt(quantity) || 1;
  const product = Product.getById(product_id);
  if (!product) return res.redirect('/pos');

  const cart = getCart(req);
  const existing = cart.find((i) => i.product_id === parseInt(product_id));

  if (existing) {
    const newQty = existing.quantity + qty;
    if (newQty > product.stock) {
      req.session.cartError = `Stok tidak cukup untuk ${product.name}.`;
    } else {
      existing.quantity = newQty;
      existing.subtotal = existing.price * newQty;
    }
  } else {
    if (qty > product.stock) {
      req.session.cartError = `Stok tidak cukup untuk ${product.name}.`;
    } else {
      cart.push({
        product_id: product.id,
        product_name: product.name,
        price: product.price,
        quantity: qty,
        subtotal: product.price * qty,
      });
    }
  }
  req.session.cart = cart;
  res.redirect('/pos');
};

// ── Remove item from cart ─────────────────────────────────────
exports.removeFromCart = (req, res) => {
  const { product_id } = req.body;
  req.session.cart = getCart(req).filter(
    (i) => i.product_id !== parseInt(product_id)
  );
  res.redirect('/pos');
};

// ── Clear cart ────────────────────────────────────────────────
exports.clearCart = (req, res) => {
  req.session.cart = [];
  res.redirect('/pos');
};

// ── Checkout ──────────────────────────────────────────────────
exports.checkout = (req, res) => {
  const cart = getCart(req);
  if (!cart.length) return res.redirect('/pos');

  const { payment } = req.body;
  const total = cart.reduce((sum, i) => sum + i.subtotal, 0);
  const paymentAmt = parseFloat(payment);

  if (isNaN(paymentAmt) || paymentAmt < total) {
    req.session.cartError = 'Jumlah pembayaran tidak mencukupi.';
    return res.redirect('/pos');
  }

  // Decrease stock
  for (const item of cart) {
    Product.decreaseStock(item.product_id, item.quantity);
  }

  const txId = Transaction.create({
    total,
    payment: paymentAmt,
    change: paymentAmt - total,
    cashier: 'Admin',
    items: cart,
  });

  req.session.cart = [];
  req.session.lastTxId = txId;
  res.redirect(`/transactions/${txId}`);
};

// ── Transaction list ──────────────────────────────────────────
exports.index = (req, res) => {
  const transactions = Transaction.getAll();
  res.render('transactions/index', { transactions });
};

// ── Transaction detail ────────────────────────────────────────
exports.show = (req, res) => {
  const transaction = Transaction.getById(req.params.id);
  if (!transaction) return res.status(404).send('Transaksi tidak ditemukan');
  res.render('transactions/show', { transaction });
};
