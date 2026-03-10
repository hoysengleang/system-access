'use strict';

const express = require('express');
const routes = require('./routes');

function createApp() {
  const app = express();

  app.use(express.json());

  // Health check
  app.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));

  // API routes
  app.use('/api', routes);

  // 404 handler
  app.use((_req, res) => res.status(404).json({ error: 'not found' }));

  return app;
}

module.exports = { createApp };
