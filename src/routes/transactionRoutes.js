const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');

router.use(authenticateToken);

// Kasir (dan Superadmin) bisa membuat transaksi
router.post('/', transactionController.createTransaction);

// Hanya Superadmin yang bisa melihat semua transaksi
router.get('/', requireRole('SUPERADMIN'), transactionController.getTransactions);
router.get('/:id', requireRole('SUPERADMIN'), transactionController.getTransactionById);

module.exports = router;
