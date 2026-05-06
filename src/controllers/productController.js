const prisma = require('../config/prisma');
const {
  listProducts,
  findProductById,
  createProduct: createProductModel,
  updateProduct: updateProductModel,
  deleteProduct: deleteProductModel,
} = require('../models/productModel');
const { findCategoryById } = require('../models/categoryModel');

// Get all products (Bisa diakses Superadmin & Kasir)
const getProducts = async (req, res) => {
  try {
    const products = await listProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server.', error: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const productId = Number(req.params.id);
    if (Number.isNaN(productId)) {
      return res.status(400).json({ message: 'ID produk tidak valid.' });
    }

    const product = await findProductById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Produk tidak ditemukan.' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server.', error: error.message });
  }
};

// Create product (Hanya Superadmin)
const createProduct = async (req, res) => {
  try {
    const { name, price, stock } = req.body;
    const rawCategoryId = req.body.categoryId;
    const categoryId =
      rawCategoryId === undefined || rawCategoryId === null || rawCategoryId === ''
        ? null
        : Number(rawCategoryId);

    if (!name || price === undefined) {
      return res.status(400).json({ message: 'Nama dan harga produk wajib diisi.' });
    }

    const parsedPrice = Number(price);
    const parsedStock = stock === undefined ? 0 : Number(stock);

    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({ message: 'Harga produk tidak valid.' });
    }

    if (Number.isNaN(parsedStock) || parsedStock < 0) {
      return res.status(400).json({ message: 'Stok produk tidak valid.' });
    }

    if (categoryId !== null) {
      if (Number.isNaN(categoryId)) {
        return res.status(400).json({ message: 'Category ID tidak valid.' });
      }

      const category = await findCategoryById(categoryId);
      if (!category) {
        return res.status(404).json({ message: 'Kategori tidak ditemukan.' });
      }
    }

    const product = await createProductModel({
      name,
      price: parsedPrice,
      stock: parsedStock,
      categoryId,
    });

    res.status(201).json({ message: 'Produk berhasil ditambahkan', product });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server.', error: error.message });
  }
};

// Update product (Hanya Superadmin)
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, stock } = req.body;
    const productId = Number(id);
    const rawCategoryId = req.body.categoryId;
    const categoryId =
      rawCategoryId === undefined
        ? undefined
        : rawCategoryId === null || rawCategoryId === ''
          ? null
          : Number(rawCategoryId);

    if (Number.isNaN(productId)) {
      return res.status(400).json({ message: 'ID produk tidak valid.' });
    }

    const data = {};
    if (name) data.name = name;
    if (price !== undefined) {
      const parsedPrice = Number(price);
      if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
        return res.status(400).json({ message: 'Harga produk tidak valid.' });
      }
      data.price = parsedPrice;
    }
    if (stock !== undefined) {
      const parsedStock = Number(stock);
      if (Number.isNaN(parsedStock) || parsedStock < 0) {
        return res.status(400).json({ message: 'Stok produk tidak valid.' });
      }
      data.stock = parsedStock;
    }

    if (categoryId !== undefined) {
      if (Number.isNaN(categoryId)) {
        return res.status(400).json({ message: 'Category ID tidak valid.' });
      }

      if (categoryId !== null) {
        const category = await findCategoryById(categoryId);
        if (!category) {
          return res.status(404).json({ message: 'Kategori tidak ditemukan.' });
        }
      }

      data.categoryId = categoryId;
    }

    const existingProduct = await findProductById(productId);
    if (!existingProduct) {
      return res.status(404).json({ message: 'Produk tidak ditemukan.' });
    }

    const product = await updateProductModel(productId, data);
    res.json({ message: 'Produk berhasil diupdate', product });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server.', error: error.message });
  }
};

// Delete product (Hanya Superadmin)
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const productId = Number(id);

    if (Number.isNaN(productId)) {
      return res.status(400).json({ message: 'ID produk tidak valid.' });
    }

    const existingProduct = await findProductById(productId);
    if (!existingProduct) {
      return res.status(404).json({ message: 'Produk tidak ditemukan.' });
    }

    const transactionItemCount = await prisma.transactionItem.count({
      where: { productId },
    });
    const stockAdjustmentCount = await prisma.stockAdjustment.count({
      where: { productId },
    });

    if (transactionItemCount > 0 || stockAdjustmentCount > 0) {
      return res.status(400).json({
        message: 'Produk tidak bisa dihapus karena sudah dipakai pada transaksi atau penyesuaian stok.',
      });
    }

    await deleteProductModel(productId);
    res.json({ message: 'Produk berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server.', error: error.message });
  }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };
