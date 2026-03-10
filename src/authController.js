'use strict';

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { JWT_SECRET, JWT_EXPIRES_IN, BCRYPT_ROUNDS, ROLES } = require('./config');
const userStore = require('./userStore');

/**
 * POST /api/auth/register
 * Register a new user.
 */
async function register(req, res) {
  const { username, password, role } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required' });
  }
  if (typeof username !== 'string' || username.trim().length < 3) {
    return res.status(400).json({ error: 'username must be at least 3 characters' });
  }
  if (typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ error: 'password must be at least 6 characters' });
  }

  const requestedRole = role || ROLES.USER;
  const validRoles = Object.values(ROLES);
  if (!validRoles.includes(requestedRole)) {
    return res.status(400).json({ error: `role must be one of: ${validRoles.join(', ')}` });
  }

  const existing = userStore.findByUsername(username.trim());
  if (existing) {
    return res.status(409).json({ error: 'username already taken' });
  }

  const hashed = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const user = userStore.create({ username: username.trim(), password: hashed, role: requestedRole });

  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

  return res.status(201).json({ user, token });
}

/**
 * POST /api/auth/login
 * Authenticate a user and return a JWT.
 */
async function login(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required' });
  }

  const user = userStore.findByUsername(username.trim());
  if (!user) {
    return res.status(401).json({ error: 'invalid credentials' });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).json({ error: 'invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

  const { password: _pwd, ...safeUser } = user;
  return res.status(200).json({ user: safeUser, token });
}

/**
 * GET /api/auth/me
 * Return the current authenticated user's profile.
 */
function me(req, res) {
  return res.status(200).json({ user: req.user });
}

module.exports = { register, login, me };
