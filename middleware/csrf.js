const crypto = require('crypto');

/**
 * Simple synchronizer-token CSRF protection.
 * - Stores a token in req.session.csrfToken
 * - Validates that token on any state-mutating request (POST/PUT/DELETE/PATCH)
 * - Exposes the token via res.locals.csrfToken for use in EJS forms
 */
function csrf(req, res, next) {
  // Generate token once per session
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  }

  res.locals.csrfToken = req.session.csrfToken;

  const mutating = ['POST', 'PUT', 'DELETE', 'PATCH'];
  if (mutating.includes(req.method)) {
    const submitted = req.body._csrf || req.headers['x-csrf-token'];
    if (!submitted || submitted !== req.session.csrfToken) {
      return res.status(403).send('403 Forbidden – Invalid CSRF token');
    }
  }

  next();
}

module.exports = csrf;
