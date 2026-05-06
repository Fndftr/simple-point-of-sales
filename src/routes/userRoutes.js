const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');

router.use(authenticateToken);
router.use(requireRole('SUPERADMIN')); // Hanya Super Admin yang bisa mengelola user

router.post('/', userController.createUser);
router.get('/', userController.getUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
