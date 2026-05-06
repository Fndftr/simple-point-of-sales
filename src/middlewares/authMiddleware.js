const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const bearerToken = authHeader && authHeader.split(' ')[1];
  const cookieToken = req.cookies && req.cookies.auth_token;
  const token = bearerToken || cookieToken;

  if (!token) return res.status(401).json({ message: 'Akses ditolak. Token tidak ditemukan.' });

  jwt.verify(token, process.env.JWT_SECRET || 'secret_key', (err, user) => {
    if (err) return res.status(403).json({ message: 'Token tidak valid.' });
    req.user = user;
    next();
  });
};

const requireRole = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ message: `Akses ditolak. Hanya untuk ${role}.` });
    }
    next();
  };
};

module.exports = { authenticateToken, requireRole };
