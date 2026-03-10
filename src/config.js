'use strict';

module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || 'system-access-secret-key',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  BCRYPT_ROUNDS: 10,
  ROLES: {
    ADMIN: 'admin',
    MODERATOR: 'moderator',
    USER: 'user',
  },
};
