const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');

router.use(authenticateToken);

// Semua role yang login bisa melihat produk
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);

// Hanya SUPERADMIN yang bisa CRUD produk
router.post('/', requireRole('SUPERADMIN'), productController.createProduct);
router.put('/:id', requireRole('SUPERADMIN'), productController.updateProduct);
router.delete('/:id', requireRole('SUPERADMIN'), productController.deleteProduct);

module.exports = router;
