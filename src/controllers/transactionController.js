const {
  createTransaction: createTransactionModel,
  listTransactions,
  findTransactionById,
} = require('../models/transactionModel');

// Create Transaction (Kasir & Superadmin)
const createTransaction = async (req, res) => {
  try {
    const { items, paymentMethod, cashReceived } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Item transaksi tidak boleh kosong.' });
    }

    const normalizedItems = items.map((item) => ({
      productId: Number(item.productId),
      quantity: Number(item.quantity),
    }));

    if (
      normalizedItems.some(
        (item) =>
          Number.isNaN(item.productId) ||
          Number.isNaN(item.quantity) ||
          item.quantity <= 0
      )
    ) {
      return res.status(400).json({
        message: 'Setiap item harus memiliki productId dan quantity yang valid.',
      });
    }

    const normalizedPaymentMethod = String(paymentMethod || 'CASH').toUpperCase();
    const allowedPaymentMethods = new Set(['CASH', 'CARD', 'QRIS', 'TRANSFER']);
    if (!allowedPaymentMethods.has(normalizedPaymentMethod)) {
      return res.status(400).json({ message: 'Payment method tidak valid.' });
    }

    if (normalizedPaymentMethod === 'CASH') {
      const parsedCashReceived = Number(cashReceived);
      if (Number.isNaN(parsedCashReceived)) {
        return res.status(400).json({ message: 'cashReceived wajib diisi untuk pembayaran tunai.' });
      }
    }

    const result = await createTransactionModel({
      userId: req.user.id,
      items: normalizedItems,
      paymentMethod: normalizedPaymentMethod,
      cashReceived,
    });

    res.status(201).json({ message: 'Transaksi berhasil', transaction: result });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all transactions (Hanya Superadmin)
const getTransactions = async (req, res) => {
  try {
    const transactions = await listTransactions();
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server.', error: error.message });
  }
};

// Get transaction by ID
const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    const transactionId = Number(id);

    if (Number.isNaN(transactionId)) {
      return res.status(400).json({ message: 'ID transaksi tidak valid.' });
    }

    const transaction = await findTransactionById(transactionId);

    if (!transaction) return res.status(404).json({ message: 'Transaksi tidak ditemukan.' });

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server.', error: error.message });
  }
};

module.exports = { createTransaction, getTransactions, getTransactionById };
