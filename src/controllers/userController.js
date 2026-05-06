const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');
const {
  findUserByUsername,
  listUsers,
  createUser: createUserModel,
  updateUser: updateUserModel,
  deleteUser: deleteUserModel,
  findUserById,
} = require('../models/userModel');

const allowedRoles = new Set(['SUPERADMIN', 'KASIR']);

// Create user (Kasir or Admin)
const createUser = async (req, res) => {
  try {
    const { name, username, password, role } = req.body;

    if (!name || !username || !password) {
      return res.status(400).json({ message: 'Nama, username, dan password wajib diisi.' });
    }

    if (role && !allowedRoles.has(role)) {
      return res.status(400).json({ message: 'Role tidak valid.' });
    }

    const existingUser = await findUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ message: 'Username sudah digunakan.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await createUserModel({
      name,
      username,
      password: hashedPassword,
      role: role || 'KASIR',
    });

    res.status(201).json({ message: 'User berhasil dibuat', user });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server.', error: error.message });
  }
};

// Get all users
const getUsers = async (req, res) => {
  try {
    const users = await listUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server.', error: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const userId = Number(req.params.id);
    if (Number.isNaN(userId)) {
      return res.status(400).json({ message: 'ID user tidak valid.' });
    }

    const user = await findUserById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan.' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server.', error: error.message });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, password } = req.body;

    const userId = Number(id);
    if (Number.isNaN(userId)) {
      return res.status(400).json({ message: 'ID user tidak valid.' });
    }

    if (role && !allowedRoles.has(role)) {
      return res.status(400).json({ message: 'Role tidak valid.' });
    }

    const existingUser = await findUserById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: 'User tidak ditemukan.' });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (role) updateData.role = role;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await updateUserModel(userId, updateData);

    res.json({ message: 'User berhasil diupdate', user });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server.', error: error.message });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = Number(id);

    if (Number.isNaN(userId)) {
      return res.status(400).json({ message: 'ID user tidak valid.' });
    }

    if (userId === req.user.id) {
      return res.status(400).json({ message: 'Tidak dapat menghapus akun sendiri.' });
    }

    const existingUser = await findUserById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: 'User tidak ditemukan.' });
    }

    const transactionCount = await prisma.transaction.count({
      where: { userId },
    });
    const stockAdjustmentCount = await prisma.stockAdjustment.count({
      where: { userId },
    });

    if (transactionCount > 0 || stockAdjustmentCount > 0) {
      return res.status(400).json({
        message: 'User tidak bisa dihapus karena sudah memiliki histori transaksi atau penyesuaian stok.',
      });
    }

    await deleteUserModel(userId);
    res.json({ message: 'User berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server.', error: error.message });
  }
};

module.exports = { createUser, getUsers, getUserById, updateUser, deleteUser };
