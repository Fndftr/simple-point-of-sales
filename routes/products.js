const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/', productController.index);
router.get('/create', productController.create);
router.post('/', productController.store);
router.get('/:id/edit', productController.edit);
router.put('/:id', productController.update);
router.delete('/:id', productController.destroy);

module.exports = router;
