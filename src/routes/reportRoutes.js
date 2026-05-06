const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');

router.use(authenticateToken);
router.use(requireRole('SUPERADMIN'));

router.get('/sales', reportController.getSalesReport);

module.exports = router;
