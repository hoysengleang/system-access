'use strict';

const bcrypt = require('bcryptjs');
const { BCRYPT_ROUNDS, ROLES } = require('./config');
const userStore = require('./userStore');

/**
 * GET /api/users
 * List all users. Admin only.
 */
function listUsers(req, res) {
  return res.status(200).json({ users: userStore.getAll() });
}

/**
 * GET /api/users/:id
 * Get a user by ID. Admin or the user themselves.
 */
function getUser(req, res) {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'invalid user id' });
  }

  const user = userStore.findById(id);
  if (!user) {
    return res.status(404).json({ error: 'user not found' });
  }

  // Only admin can view any profile; non-admin users can only view their own
  if (req.user.role !== ROLES.ADMIN && req.user.id !== id) {
    return res.status(403).json({ error: 'insufficient permissions' });
  }

  const { password: _pwd, ...safeUser } = user;
  return res.status(200).json({ user: safeUser });
}

/**
 * PATCH /api/users/:id
 * Update a user. Admin can update any field; users can only update their own password/username.
 */
async function updateUser(req, res) {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'invalid user id' });
  }

  const existing = userStore.findById(id);
  if (!existing) {
    return res.status(404).json({ error: 'user not found' });
  }

  // Non-admin users can only update their own profile
  if (req.user.role !== ROLES.ADMIN && req.user.id !== id) {
    return res.status(403).json({ error: 'insufficient permissions' });
  }

  const { username, password, role } = req.body;
  const updates = {};

  if (username !== undefined) {
    if (typeof username !== 'string' || username.trim().length < 3) {
      return res.status(400).json({ error: 'username must be at least 3 characters' });
    }
    const conflict = userStore.findByUsername(username.trim());
    if (conflict && conflict.id !== id) {
      return res.status(409).json({ error: 'username already taken' });
    }
    updates.username = username.trim();
  }

  if (password !== undefined) {
    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'password must be at least 6 characters' });
    }
    updates.password = await bcrypt.hash(password, BCRYPT_ROUNDS);
  }

  if (role !== undefined) {
    // Only admin can change roles
    if (req.user.role !== ROLES.ADMIN) {
      return res.status(403).json({ error: 'only admins can change roles' });
    }
    const validRoles = Object.values(ROLES);
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: `role must be one of: ${validRoles.join(', ')}` });
    }
    updates.role = role;
  }

  const updated = userStore.update(id, updates);
  return res.status(200).json({ user: updated });
}

/**
 * DELETE /api/users/:id
 * Delete a user. Admin only.
 */
function deleteUser(req, res) {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'invalid user id' });
  }

  if (req.user.id === id) {
    return res.status(400).json({ error: 'cannot delete your own account' });
  }

  const deleted = userStore.remove(id);
  if (!deleted) {
    return res.status(404).json({ error: 'user not found' });
  }

  return res.status(200).json({ message: 'user deleted successfully' });
}

module.exports = { listUsers, getUser, updateUser, deleteUser };
