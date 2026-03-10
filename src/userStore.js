'use strict';

const { ROLES } = require('./config');

// In-memory user store
let users = [];
let nextId = 1;

/**
 * Find a user by a predicate.
 * @param {(user: object) => boolean} predicate
 * @returns {object|undefined}
 */
function find(predicate) {
  return users.find(predicate);
}

/**
 * Find a user by ID.
 * @param {number} id
 * @returns {object|undefined}
 */
function findById(id) {
  return users.find((u) => u.id === id);
}

/**
 * Find a user by username.
 * @param {string} username
 * @returns {object|undefined}
 */
function findByUsername(username) {
  return users.find((u) => u.username === username);
}

/**
 * Get all users (without passwords).
 * @returns {object[]}
 */
function getAll() {
  return users.map(({ password: _pwd, ...rest }) => rest);
}

/**
 * Create a new user.
 * @param {object} data
 * @param {string} data.username
 * @param {string} data.password - hashed password
 * @param {string} [data.role]
 * @returns {object} Created user (without password)
 */
function create({ username, password, role = ROLES.USER }) {
  const user = { id: nextId++, username, password, role, createdAt: new Date().toISOString() };
  users.push(user);
  const { password: _pwd, ...safeUser } = user;
  return safeUser;
}

/**
 * Update a user by ID.
 * @param {number} id
 * @param {object} updates
 * @returns {object|null} Updated user (without password), or null if not found
 */
function update(id, updates) {
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) return null;
  // Disallow updating id
  const { id: _id, ...allowed } = updates;
  users[index] = { ...users[index], ...allowed };
  const { password: _pwd, ...safeUser } = users[index];
  return safeUser;
}

/**
 * Delete a user by ID.
 * @param {number} id
 * @returns {boolean}
 */
function remove(id) {
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) return false;
  users.splice(index, 1);
  return true;
}

/** Reset store (used in tests). */
function reset() {
  users = [];
  nextId = 1;
}

module.exports = { find, findById, findByUsername, getAll, create, update, remove, reset };
