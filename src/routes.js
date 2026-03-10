'use strict';

const express = require('express');
const authController = require('./authController');
const usersController = require('./usersController');
const { authenticate, authorize } = require('./middleware');
const { ROLES } = require('./config');

const router = express.Router();

// Auth routes
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/me', authenticate, authController.me);

// User management routes
router.get('/users', authenticate, authorize(ROLES.ADMIN, ROLES.MODERATOR), usersController.listUsers);
router.get('/users/:id', authenticate, usersController.getUser);
router.patch('/users/:id', authenticate, usersController.updateUser);
router.delete('/users/:id', authenticate, authorize(ROLES.ADMIN), usersController.deleteUser);

module.exports = router;
