'use strict';

const jwt = require('jsonwebtoken');
const { JWT_SECRET, ROLES } = require('./config');

/**
 * Middleware: verify the Bearer JWT token.
 * Attaches req.user on success.
 */
function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'missing or invalid authorization header' });
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.id, username: payload.username, role: payload.role };
    return next();
  } catch {
    return res.status(401).json({ error: 'invalid or expired token' });
  }
}

/**
 * Middleware factory: require one of the given roles.
 * @param {...string} roles
 */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'authentication required' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'insufficient permissions' });
    }
    return next();
  };
}

module.exports = { authenticate, authorize, ROLES };
