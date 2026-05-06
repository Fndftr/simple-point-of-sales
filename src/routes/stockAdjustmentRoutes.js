const express = require('express');
const router = express.Router();
const stockAdjustmentController = require('../controllers/stockAdjustmentController');
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');

router.use(authenticateToken);
router.use(requireRole('SUPERADMIN'));

router.get('/', stockAdjustmentController.getStockAdjustments);
router.post('/', stockAdjustmentController.createStockAdjustment);

module.exports = router;
