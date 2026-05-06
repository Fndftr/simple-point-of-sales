/**
 * Seed script – populates the database with sample products.
 * Run once: node seed.js
 */
const db = require('./config/database');

const products = [
  { name: 'Kopi Hitam', price: 8000, stock: 100, category: 'Minuman' },
  { name: 'Kopi Susu', price: 12000, stock: 80, category: 'Minuman' },
  { name: 'Teh Manis', price: 5000, stock: 150, category: 'Minuman' },
  { name: 'Air Mineral 600ml', price: 4000, stock: 200, category: 'Minuman' },
  { name: 'Jus Jeruk', price: 15000, stock: 60, category: 'Minuman' },
  { name: 'Nasi Goreng', price: 20000, stock: 50, category: 'Makanan' },
  { name: 'Mie Goreng', price: 18000, stock: 45, category: 'Makanan' },
  { name: 'Roti Bakar', price: 10000, stock: 70, category: 'Makanan' },
  { name: 'Pisang Goreng', price: 7000, stock: 80, category: 'Snack' },
  { name: 'Keripik Singkong', price: 6000, stock: 120, category: 'Snack' },
];

const insert = db.prepare(
  'INSERT OR IGNORE INTO products (name, price, stock, category) VALUES (?, ?, ?, ?)'
);

const insertAll = db.transaction(() => {
  for (const p of products) {
    insert.run(p.name, p.price, p.stock, p.category);
  }
});

insertAll();
console.log('✅  Seed selesai – ' + products.length + ' produk ditambahkan.');
