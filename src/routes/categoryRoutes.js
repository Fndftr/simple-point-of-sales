const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');

router.use(authenticateToken);

router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategoryById);
router.post('/', requireRole('SUPERADMIN'), categoryController.createCategory);
router.put('/:id', requireRole('SUPERADMIN'), categoryController.updateCategory);
router.delete('/:id', requireRole('SUPERADMIN'), categoryController.deleteCategory);

module.exports = router;
