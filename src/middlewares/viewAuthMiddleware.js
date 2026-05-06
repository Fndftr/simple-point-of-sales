const jwt = require('jsonwebtoken');

const getTokenFromRequest = (req) => {
  const authHeader = req.headers['authorization'];
  const bearerToken = authHeader && authHeader.split(' ')[1];
  return bearerToken || req.cookies?.auth_token || null;
};

const attachOptionalViewUser = (req, res, next) => {
  const token = getTokenFromRequest(req);
  if (!token) {
    return next();
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
    res.locals.currentUser = req.user;
    res.locals.isAuthenticated = true;
  } catch (error) {
    res.clearCookie('auth_token');
  }

  next();
};

const requireViewAuth = (req, res, next) => {
  const token = getTokenFromRequest(req);

  if (!token) {
    return res.redirect('/login');
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
    res.locals.currentUser = req.user;
    res.locals.isAuthenticated = true;
    next();
  } catch (error) {
    res.clearCookie('auth_token');
    return res.redirect('/login');
  }
};

const requireViewRole = (role) => {
  return (req, res, next) => {
    if (req.user?.role !== role) {
      return res.status(403).render('pages/error', {
        pageTitle: 'Akses Ditolak',
        message: `Akses ditolak. Hanya untuk ${role}.`,
        currentUser: req.user,
      });
    }
    next();
  };
};

module.exports = {
  attachOptionalViewUser,
  requireViewAuth,
  requireViewRole,
};
