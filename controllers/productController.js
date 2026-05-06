const Product = require('../models/Product');

exports.index = (req, res) => {
  const products = Product.getAll();
  const categories = Product.getCategories();
  const success = req.session.success || null;
  delete req.session.success;
  res.render('products/index', { products, categories, success });
};

exports.create = (req, res) => {
  const categories = Product.getCategories();
  const error = req.session.error || null;
  delete req.session.error;
  res.render('products/create', { categories, error });
};

exports.store = (req, res) => {
  const { name, price, stock, category } = req.body;
  if (!name || !price || stock === undefined) {
    req.session.error = 'Nama, harga, dan stok wajib diisi.';
    return res.redirect('/products/create');
  }
  Product.create({ name, price, stock, category });
  req.session.success = `Produk "${name}" berhasil ditambahkan.`;
  res.redirect('/products');
};

exports.edit = (req, res) => {
  const product = Product.getById(req.params.id);
  if (!product) return res.status(404).send('Produk tidak ditemukan');
  const categories = Product.getCategories();
  const error = req.session.error || null;
  delete req.session.error;
  res.render('products/edit', { product, categories, error });
};

exports.update = (req, res) => {
  const { name, price, stock, category } = req.body;
  if (!name || !price || stock === undefined) {
    req.session.error = 'Nama, harga, dan stok wajib diisi.';
    return res.redirect(`/products/${req.params.id}/edit`);
  }
  Product.update(req.params.id, { name, price, stock, category });
  req.session.success = `Produk "${name}" berhasil diperbarui.`;
  res.redirect('/products');
};

exports.destroy = (req, res) => {
  const product = Product.getById(req.params.id);
  if (product) {
    Product.delete(req.params.id);
    req.session.success = `Produk "${product.name}" berhasil dihapus.`;
  }
  res.redirect('/products');
};
