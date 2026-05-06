const prisma = require('../config/prisma');
const { listStockAdjustments } = require('../models/stockAdjustmentModel');
const { findProductById } = require('../models/productModel');

const getStockAdjustments = async (req, res) => {
  try {
    const adjustments = await listStockAdjustments();
    res.json(adjustments);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server.', error: error.message });
  }
};

const createStockAdjustment = async (req, res) => {
  try {
    const { productId, quantity, reason, note } = req.body;
    const parsedProductId = Number(productId);
    const parsedQuantity = Number(quantity);

    if (Number.isNaN(parsedProductId) || Number.isNaN(parsedQuantity) || parsedQuantity === 0) {
      return res.status(400).json({ message: 'productId dan quantity harus valid.' });
    }

    if (!reason) {
      return res.status(400).json({ message: 'Reason wajib diisi.' });
    }

    const product = await findProductById(parsedProductId);
    if (!product) {
      return res.status(404).json({ message: 'Produk tidak ditemukan.' });
    }

    const stockAdjustment = await prisma.$transaction(async (tx) => {
      const newStock = product.stock + parsedQuantity;

      if (newStock < 0) {
        throw new Error(`Stok tidak boleh negatif. Stok tersedia: ${product.stock}`);
      }

      await tx.product.update({
        where: { id: parsedProductId },
        data: { stock: newStock },
      });

      return tx.stockAdjustment.create({
        data: {
          productId: parsedProductId,
          userId: req.user.id,
          quantity: parsedQuantity,
          reason,
          note: note || null,
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              username: true,
            },
          },
        },
      });
    });

    res.status(201).json({
      message: 'Penyesuaian stok berhasil',
      stockAdjustment,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getStockAdjustments,
  createStockAdjustment,
};
