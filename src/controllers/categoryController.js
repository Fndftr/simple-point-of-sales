const prisma = require('../config/prisma');
const {
  listCategories,
  findCategoryById,
  findCategoryByName,
  createCategory: createCategoryModel,
  updateCategory: updateCategoryModel,
  deleteCategory: deleteCategoryModel,
} = require('../models/categoryModel');

const getCategories = async (req, res) => {
  try {
    const categories = await listCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server.', error: error.message });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const categoryId = Number(req.params.id);
    if (Number.isNaN(categoryId)) {
      return res.status(400).json({ message: 'ID kategori tidak valid.' });
    }

    const category = await findCategoryById(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Kategori tidak ditemukan.' });
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server.', error: error.message });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Nama kategori wajib diisi.' });
    }

    const existingCategory = await findCategoryByName(name);
    if (existingCategory) {
      return res.status(400).json({ message: 'Nama kategori sudah digunakan.' });
    }

    const category = await createCategoryModel({
      name,
      description: description || null,
    });

    res.status(201).json({ message: 'Kategori berhasil dibuat', category });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server.', error: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const categoryId = Number(req.params.id);
    const { name, description } = req.body;

    if (Number.isNaN(categoryId)) {
      return res.status(400).json({ message: 'ID kategori tidak valid.' });
    }

    const existingCategory = await findCategoryById(categoryId);
    if (!existingCategory) {
      return res.status(404).json({ message: 'Kategori tidak ditemukan.' });
    }

    if (name) {
      const duplicate = await findCategoryByName(name);
      if (duplicate && duplicate.id !== categoryId) {
        return res.status(400).json({ message: 'Nama kategori sudah digunakan.' });
      }
    }

    const category = await updateCategoryModel(categoryId, {
      ...(name ? { name } : {}),
      ...(description !== undefined ? { description } : {}),
    });

    res.json({ message: 'Kategori berhasil diupdate', category });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server.', error: error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const categoryId = Number(req.params.id);

    if (Number.isNaN(categoryId)) {
      return res.status(400).json({ message: 'ID kategori tidak valid.' });
    }

    const existingCategory = await findCategoryById(categoryId);
    if (!existingCategory) {
      return res.status(404).json({ message: 'Kategori tidak ditemukan.' });
    }

    const linkedProducts = await prisma.product.count({
      where: {
        categoryId,
      },
    });

    if (linkedProducts > 0) {
      return res.status(400).json({
        message: 'Kategori tidak bisa dihapus karena masih dipakai produk.',
      });
    }

    await deleteCategoryModel(categoryId);
    res.json({ message: 'Kategori berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server.', error: error.message });
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
