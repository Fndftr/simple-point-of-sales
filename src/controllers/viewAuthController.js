const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { findUserByUsername } = require('../models/userModel');

const renderLogin = (req, res) => {
  if (req.user) {
    return res.redirect('/dashboard');
  }

  res.render('pages/login', {
    pageTitle: 'Login POS',
    error: null,
  });
};

const handleLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).render('pages/login', {
        pageTitle: 'Login POS',
        error: 'Username dan password wajib diisi.',
      });
    }

    const user = await findUserByUsername(username);

    if (!user) {
      return res.status(401).render('pages/login', {
        pageTitle: 'Login POS',
        error: 'Username atau password salah.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).render('pages/login', {
        pageTitle: 'Login POS',
        error: 'Username atau password salah.',
      });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );

    res.cookie('auth_token', token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.redirect('/dashboard');
  } catch (error) {
    return res.status(500).render('pages/login', {
      pageTitle: 'Login POS',
      error: 'Terjadi kesalahan pada server.',
    });
  }
};

const logout = (req, res) => {
  res.clearCookie('auth_token');
  res.redirect('/login');
};

module.exports = {
  renderLogin,
  handleLogin,
  logout,
};
