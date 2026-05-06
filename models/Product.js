const db = require('../config/database');

const Product = {
  getAll() {
    return db.prepare('SELECT * FROM products ORDER BY name ASC').all();
  },

  getById(id) {
    return db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  },

  create({ name, price, stock, category }) {
    const stmt = db.prepare(
      'INSERT INTO products (name, price, stock, category) VALUES (?, ?, ?, ?)'
    );
    const info = stmt.run(name, parseFloat(price), parseInt(stock), category || null);
    return info.lastInsertRowid;
  },

  update(id, { name, price, stock, category }) {
    db.prepare(
      'UPDATE products SET name = ?, price = ?, stock = ?, category = ? WHERE id = ?'
    ).run(name, parseFloat(price), parseInt(stock), category || null, id);
  },

  delete(id) {
    db.prepare('DELETE FROM products WHERE id = ?').run(id);
  },

  decreaseStock(id, qty) {
    db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?').run(qty, id);
  },

  getCategories() {
    return db.prepare('SELECT DISTINCT category FROM products WHERE category IS NOT NULL ORDER BY category').all();
  },
};

module.exports = Product;
