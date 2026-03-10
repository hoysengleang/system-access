'use strict';

const request = require('supertest');
const { createApp } = require('../src/app');
const userStore = require('../src/userStore');

const app = createApp();

beforeEach(() => {
  userStore.reset();
});

describe('Health', () => {
  it('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});

describe('POST /api/auth/register', () => {
  it('registers a new user with default role', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'alice', password: 'secret123' });

    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({ username: 'alice', role: 'user' });
    expect(res.body.user.password).toBeUndefined();
    expect(typeof res.body.token).toBe('string');
  });

  it('registers an admin user when role is specified', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'adminUser', password: 'secret123', role: 'admin' });

    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('admin');
  });

  it('rejects duplicate username', async () => {
    await request(app).post('/api/auth/register').send({ username: 'alice', password: 'secret123' });
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'alice', password: 'different123' });

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/username already taken/i);
  });

  it('rejects missing username', async () => {
    const res = await request(app).post('/api/auth/register').send({ password: 'secret123' });
    expect(res.status).toBe(400);
  });

  it('rejects short username', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'ab', password: 'secret123' });
    expect(res.status).toBe(400);
  });

  it('rejects short password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'alice', password: 'abc' });
    expect(res.status).toBe(400);
  });

  it('rejects invalid role', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'alice', password: 'secret123', role: 'superuser' });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/register').send({ username: 'alice', password: 'secret123' });
  });

  it('logs in with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'alice', password: 'secret123' });

    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({ username: 'alice' });
    expect(res.body.user.password).toBeUndefined();
    expect(typeof res.body.token).toBe('string');
  });

  it('rejects wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'alice', password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/invalid credentials/i);
  });

  it('rejects unknown username', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'nobody', password: 'secret123' });

    expect(res.status).toBe(401);
  });

  it('rejects missing fields', async () => {
    const res = await request(app).post('/api/auth/login').send({ username: 'alice' });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/auth/me', () => {
  let token;

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'alice', password: 'secret123' });
    token = res.body.token;
  });

  it('returns current user profile', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.username).toBe('alice');
  });

  it('rejects without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('rejects invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalidtoken');
    expect(res.status).toBe(401);
  });
});
