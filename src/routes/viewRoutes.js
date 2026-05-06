const express = require('express');
const router = express.Router();
const viewAuthController = require('../controllers/viewAuthController');
const pageController = require('../controllers/pageController');
const { requireViewAuth, requireViewRole } = require('../middlewares/viewAuthMiddleware');

router.get('/', pageController.renderHome);
router.get('/login', viewAuthController.renderLogin);
router.post('/login', viewAuthController.handleLogin);
router.post('/logout', viewAuthController.logout);
router.get('/logout', viewAuthController.logout);

router.get('/dashboard', requireViewAuth, pageController.renderDashboard);
router.get('/products', requireViewAuth, pageController.renderProducts);
router.post('/products', requireViewAuth, requireViewRole('SUPERADMIN'), pageController.handleProductCreate);
router.get('/categories', requireViewAuth, requireViewRole('SUPERADMIN'), pageController.renderCategories);
router.post('/categories', requireViewAuth, requireViewRole('SUPERADMIN'), pageController.handleCategoryCreate);
router.get('/users', requireViewAuth, requireViewRole('SUPERADMIN'), pageController.renderUsers);
router.post('/users', requireViewAuth, requireViewRole('SUPERADMIN'), pageController.handleUserCreate);
router.get('/transactions', requireViewAuth, requireViewRole('SUPERADMIN'), pageController.renderTransactions);
router.get('/transactions/new', requireViewAuth, pageController.renderTransactionForm);
router.post('/transactions', requireViewAuth, pageController.handleTransactionCreate);
router.get('/transactions/:id/receipt', requireViewAuth, pageController.renderReceipt);
router.get('/reports/sales', requireViewAuth, requireViewRole('SUPERADMIN'), pageController.renderReports);
router.get('/stock-adjustments', requireViewAuth, requireViewRole('SUPERADMIN'), pageController.renderStockAdjustments);
router.post('/stock-adjustments', requireViewAuth, requireViewRole('SUPERADMIN'), pageController.handleStockAdjustmentCreate);

module.exports = router;
