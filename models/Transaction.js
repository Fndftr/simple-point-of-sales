const db = require('../config/database');

const Transaction = {
  getAll() {
    return db.prepare('SELECT * FROM transactions ORDER BY created_at DESC').all();
  },

  getById(id) {
    const transaction = db.prepare('SELECT * FROM transactions WHERE id = ?').get(id);
    if (transaction) {
      transaction.items = db
        .prepare('SELECT * FROM transaction_items WHERE transaction_id = ?')
        .all(id);
    }
    return transaction;
  },

  create({ total, payment, change, cashier, items }) {
    const insertTx = db.prepare(
      'INSERT INTO transactions (total, payment, change, cashier) VALUES (?, ?, ?, ?)'
    );
    const insertItem = db.prepare(
      `INSERT INTO transaction_items
         (transaction_id, product_id, product_name, price, quantity, subtotal)
       VALUES (?, ?, ?, ?, ?, ?)`
    );

    const transact = db.transaction(() => {
      const info = insertTx.run(
        parseFloat(total),
        parseFloat(payment),
        parseFloat(change),
        cashier || 'Admin'
      );
      const txId = info.lastInsertRowid;
      for (const item of items) {
        insertItem.run(
          txId,
          item.product_id,
          item.product_name,
          parseFloat(item.price),
          parseInt(item.quantity),
          parseFloat(item.subtotal)
        );
      }
      return txId;
    });

    return transact();
  },

  getSummary() {
    return db
      .prepare(
        `SELECT
          COUNT(*) AS total_transactions,
          COALESCE(SUM(total), 0) AS total_revenue,
          COALESCE(SUM(total), 0) / NULLIF(COUNT(*), 0) AS avg_transaction
         FROM transactions`
      )
      .get();
  },

  getRecentTransactions(limit = 5) {
    return db
      .prepare('SELECT * FROM transactions ORDER BY created_at DESC LIMIT ?')
      .all(limit);
  },

  getTodayRevenue() {
    return db
      .prepare(
        `SELECT COALESCE(SUM(total), 0) AS today_revenue
         FROM transactions
         WHERE date(created_at) = date('now', 'localtime')`
      )
      .get();
  },
};

module.exports = Transaction;
