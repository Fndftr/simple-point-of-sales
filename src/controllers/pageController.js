const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const { listProducts, createProduct } = require('../models/productModel');
const { listCategories, createCategory, findCategoryById, findCategoryByName } = require('../models/categoryModel');
const { listUsers, createUser: createUserModel, findUserByUsername } = require('../models/userModel');
const { listTransactions, findTransactionById, createTransaction } = require('../models/transactionModel');
const { getSalesSummary } = require('../models/reportModel');
const { listStockAdjustments } = require('../models/stockAdjustmentModel');

const renderHome = (req, res) => {
  if (req.user) {
    return res.redirect('/dashboard');
  }

  res.render('pages/home', {
    pageTitle: 'POS Dashboard',
  });
};

const renderDashboard = async (req, res) => {
  try {
    const [productCount, categoryCount, userCount, transactionCount] = await Promise.all([
      prisma.product.count(),
      prisma.category.count(),
      prisma.user.count(),
      prisma.transaction.count(),
    ]);

    const recentTransactions = await prisma.transaction.findMany({
      include: {
        user: { select: { name: true, username: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const lowStockProducts = await prisma.product.findMany({
      where: { stock: { lte: 10 } },
      include: { category: true },
      orderBy: [{ stock: 'asc' }, { name: 'asc' }],
      take: 8,
    });

    res.render('pages/dashboard', {
      pageTitle: 'Dashboard POS',
      stats: {
        productCount,
        categoryCount,
        userCount,
        transactionCount,
      },
      recentTransactions,
      lowStockProducts,
      currentUser: req.user,
    });
  } catch (error) {
    res.status(500).render('pages/error', {
      pageTitle: 'Error',
      message: error.message,
      currentUser: req.user,
    });
  }
};

const renderProducts = async (req, res) => {
  try {
    const products = await listProducts();
    const categories = await listCategories();
    res.render('pages/products', {
      pageTitle: 'Produk',
      products,
      categories,
      currentUser: req.user,
      error: null,
    });
  } catch (error) {
    res.status(500).render('pages/error', {
      pageTitle: 'Error',
      message: error.message,
      currentUser: req.user,
    });
  }
};

const handleProductCreate = async (req, res) => {
  try {
    const { name, price, stock, categoryId } = req.body;
    if (!name || price === undefined) {
      throw new Error('Nama dan harga produk wajib diisi.');
    }

    const parsedPrice = Number(price);
    const parsedStock = stock === undefined ? 0 : Number(stock);
    const parsedCategoryId = categoryId ? Number(categoryId) : null;

    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      throw new Error('Harga produk tidak valid.');
    }

    if (Number.isNaN(parsedStock) || parsedStock < 0) {
      throw new Error('Stok produk tidak valid.');
    }

    if (parsedCategoryId) {
      const category = await findCategoryById(parsedCategoryId);
      if (!category) {
        throw new Error('Kategori tidak ditemukan.');
      }
    }

    await createProduct({
      name,
      price: parsedPrice,
      stock: parsedStock,
      categoryId: parsedCategoryId,
    });

    return res.redirect('/products');
  } catch (error) {
    const products = await listProducts();
    const categories = await listCategories();
    return res.status(400).render('pages/products', {
      pageTitle: 'Produk',
      products,
      categories,
      currentUser: req.user,
      error: error.message,
    });
  }
};

const renderCategories = async (req, res) => {
  try {
    const categories = await listCategories();
    res.render('pages/categories', {
      pageTitle: 'Kategori',
      categories,
      currentUser: req.user,
      error: null,
    });
  } catch (error) {
    res.status(500).render('pages/error', {
      pageTitle: 'Error',
      message: error.message,
      currentUser: req.user,
    });
  }
};

const handleCategoryCreate = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      throw new Error('Nama kategori wajib diisi.');
    }

    const duplicate = await findCategoryByName(name);
    if (duplicate) {
      throw new Error('Nama kategori sudah digunakan.');
    }

    await createCategory({
      name,
      description: description || null,
    });

    return res.redirect('/categories');
  } catch (error) {
    const categories = await listCategories();
    return res.status(400).render('pages/categories', {
      pageTitle: 'Kategori',
      categories,
      currentUser: req.user,
      error: error.message,
    });
  }
};

const renderUsers = async (req, res) => {
  try {
    const users = await listUsers();
    res.render('pages/users', {
      pageTitle: 'Pengguna',
      users,
      currentUser: req.user,
      error: null,
    });
  } catch (error) {
    res.status(500).render('pages/error', {
      pageTitle: 'Error',
      message: error.message,
      currentUser: req.user,
    });
  }
};

const handleUserCreate = async (req, res) => {
  try {
    const { name, username, password, role } = req.body;

    if (!name || !username || !password) {
      throw new Error('Nama, username, dan password wajib diisi.');
    }

    const existingUser = await findUserByUsername(username);
    if (existingUser) {
      throw new Error('Username sudah digunakan.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await createUserModel({
      name,
      username,
      password: hashedPassword,
      role: role || 'KASIR',
    });

    return res.redirect('/users');
  } catch (error) {
    const users = await listUsers();
    return res.status(400).render('pages/users', {
      pageTitle: 'Pengguna',
      users,
      currentUser: req.user,
      error: error.message,
    });
  }
};

const renderTransactions = async (req, res) => {
  try {
    const transactions = await listTransactions();
    res.render('pages/transactions', {
      pageTitle: 'Transaksi',
      transactions,
      currentUser: req.user,
    });
  } catch (error) {
    res.status(500).render('pages/error', {
      pageTitle: 'Error',
      message: error.message,
      currentUser: req.user,
    });
  }
};

const renderTransactionForm = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: { category: true },
      orderBy: { name: 'asc' },
    });

    res.render('pages/transaction-form', {
      pageTitle: 'Kasir',
      products,
      currentUser: req.user,
      error: null,
    });
  } catch (error) {
    res.status(500).render('pages/error', {
      pageTitle: 'Error',
      message: error.message,
      currentUser: req.user,
    });
  }
};

const handleTransactionCreate = async (req, res) => {
  try {
    const { itemsJson, paymentMethod, cashReceived } = req.body;
    const items = JSON.parse(itemsJson || '[]');

    if (!Array.isArray(items) || items.length === 0) {
      const products = await prisma.product.findMany({ include: { category: true }, orderBy: { name: 'asc' } });
      return res.status(400).render('pages/transaction-form', {
        pageTitle: 'Kasir',
        products,
        currentUser: req.user,
        error: 'Item transaksi tidak boleh kosong.',
      });
    }

    const normalizedItems = items.map((item) => ({
      productId: Number(item.productId),
      quantity: Number(item.quantity),
    }));

    const transaction = await createTransaction({
      userId: req.user.id,
      items: normalizedItems,
      paymentMethod,
      cashReceived,
    });

    return res.redirect(`/transactions/${transaction.id}/receipt`);
  } catch (error) {
    const products = await prisma.product.findMany({ include: { category: true }, orderBy: { name: 'asc' } });
    return res.status(400).render('pages/transaction-form', {
      pageTitle: 'Kasir',
      products,
      currentUser: req.user,
      error: error.message,
    });
  }
};

const renderReceipt = async (req, res) => {
  try {
    const transactionId = Number(req.params.id);
    const transaction = await findTransactionById(transactionId);

    if (!transaction) {
      return res.status(404).render('pages/error', {
        pageTitle: 'Not Found',
        message: 'Transaksi tidak ditemukan.',
        currentUser: req.user,
      });
    }

    res.render('pages/receipt', {
      pageTitle: 'Struk Transaksi',
      transaction,
      currentUser: req.user,
    });
  } catch (error) {
    res.status(500).render('pages/error', {
      pageTitle: 'Error',
      message: error.message,
      currentUser: req.user,
    });
  }
};

const renderReports = async (req, res) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

    const report = await getSalesSummary({
      startDate: startDate && !Number.isNaN(startDate.getTime()) ? startDate : null,
      endDate: endDate && !Number.isNaN(endDate.getTime()) ? endDate : null,
    });

    res.render('pages/reports', {
      pageTitle: 'Laporan Penjualan',
      report,
      currentUser: req.user,
    });
  } catch (error) {
    res.status(500).render('pages/error', {
      pageTitle: 'Error',
      message: error.message,
      currentUser: req.user,
    });
  }
};

const renderStockAdjustments = async (req, res) => {
  try {
    const adjustments = await listStockAdjustments();
    const products = await prisma.product.findMany({
      orderBy: { name: 'asc' },
    });

    res.render('pages/stock-adjustments', {
      pageTitle: 'Penyesuaian Stok',
      adjustments,
      products,
      currentUser: req.user,
      error: null,
    });
  } catch (error) {
    res.status(500).render('pages/error', {
      pageTitle: 'Error',
      message: error.message,
      currentUser: req.user,
    });
  }
};

const handleStockAdjustmentCreate = async (req, res) => {
  try {
    const { productId, quantity, reason, note } = req.body;
    const parsedProductId = Number(productId);
    const parsedQuantity = Number(quantity);

    if (Number.isNaN(parsedProductId) || Number.isNaN(parsedQuantity) || parsedQuantity === 0) {
      throw new Error('productId dan quantity harus valid.');
    }

    const product = await prisma.product.findUnique({ where: { id: parsedProductId } });
    if (!product) {
      throw new Error('Produk tidak ditemukan.');
    }

    await prisma.$transaction(async (tx) => {
      const newStock = product.stock + parsedQuantity;
      if (newStock < 0) {
        throw new Error(`Stok tidak boleh negatif. Stok tersedia: ${product.stock}`);
      }

      await tx.product.update({
        where: { id: parsedProductId },
        data: { stock: newStock },
      });

      await tx.stockAdjustment.create({
        data: {
          productId: parsedProductId,
          userId: req.user.id,
          quantity: parsedQuantity,
          reason,
          note: note || null,
        },
      });
    });

    return res.redirect('/stock-adjustments');
  } catch (error) {
    const adjustments = await listStockAdjustments();
    const products = await prisma.product.findMany({ orderBy: { name: 'asc' } });
    return res.status(400).render('pages/stock-adjustments', {
      pageTitle: 'Penyesuaian Stok',
      adjustments,
      products,
      currentUser: req.user,
      error: error.message,
    });
  }
};

module.exports = {
  renderHome,
  renderDashboard,
  renderProducts,
  handleProductCreate,
  renderCategories,
  handleCategoryCreate,
  renderUsers,
  handleUserCreate,
  renderTransactions,
  renderTransactionForm,
  handleTransactionCreate,
  renderReceipt,
  renderReports,
  renderStockAdjustments,
  handleStockAdjustmentCreate,
};
