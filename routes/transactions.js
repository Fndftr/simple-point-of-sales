const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

// POS page
router.get('/pos', transactionController.pos);
router.post('/pos/add', transactionController.addToCart);
router.post('/pos/remove', transactionController.removeFromCart);
router.post('/pos/clear', transactionController.clearCart);
router.post('/pos/checkout', transactionController.checkout);

// Transaction history
router.get('/transactions', transactionController.index);
router.get('/transactions/:id', transactionController.show);

module.exports = router;
