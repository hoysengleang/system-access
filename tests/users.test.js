'use strict';

const request = require('supertest');
const { createApp } = require('../src/app');
const userStore = require('../src/userStore');

const app = createApp();

async function registerAndLogin(username, password, role) {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ username, password, role });
  return res.body.token;
}

beforeEach(() => {
  userStore.reset();
});

describe('GET /api/users (admin only)', () => {
  it('admin can list all users', async () => {
    const adminToken = await registerAndLogin('admin', 'adminpass', 'admin');
    await registerAndLogin('alice', 'alicepass', 'user');

    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.users)).toBe(true);
    expect(res.body.users.length).toBe(2);
    expect(res.body.users.every((u) => u.password === undefined)).toBe(true);
  });

  it('moderator can list all users', async () => {
    const modToken = await registerAndLogin('mod', 'modpass', 'moderator');
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${modToken}`);
    expect(res.status).toBe(200);
  });

  it('regular user cannot list all users', async () => {
    const userToken = await registerAndLogin('alice', 'alicepass', 'user');
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });

  it('unauthenticated request is rejected', async () => {
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/users/:id', () => {
  it('user can view their own profile', async () => {
    const res1 = await request(app)
      .post('/api/auth/register')
      .send({ username: 'alice', password: 'alicepass' });
    const { token, user } = res1.body;

    const res = await request(app)
      .get(`/api/users/${user.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.username).toBe('alice');
  });

  it('user cannot view another user profile', async () => {
    const res1 = await request(app)
      .post('/api/auth/register')
      .send({ username: 'alice', password: 'alicepass' });
    const res2 = await request(app)
      .post('/api/auth/register')
      .send({ username: 'bob', password: 'bobpass1' });

    const bobToken = res2.body.token;
    const aliceId = res1.body.user.id;

    const res = await request(app)
      .get(`/api/users/${aliceId}`)
      .set('Authorization', `Bearer ${bobToken}`);
    expect(res.status).toBe(403);
  });

  it('admin can view any user profile', async () => {
    const adminToken = await registerAndLogin('admin', 'adminpass', 'admin');
    const res1 = await request(app)
      .post('/api/auth/register')
      .send({ username: 'alice', password: 'alicepass' });
    const aliceId = res1.body.user.id;

    const res = await request(app)
      .get(`/api/users/${aliceId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });

  it('returns 404 for non-existent user', async () => {
    const adminToken = await registerAndLogin('admin', 'adminpass', 'admin');
    const res = await request(app)
      .get('/api/users/9999')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });
});

describe('PATCH /api/users/:id', () => {
  it('user can update their own username', async () => {
    const res1 = await request(app)
      .post('/api/auth/register')
      .send({ username: 'alice', password: 'alicepass' });
    const { token, user } = res1.body;

    const res = await request(app)
      .patch(`/api/users/${user.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ username: 'alice2' });

    expect(res.status).toBe(200);
    expect(res.body.user.username).toBe('alice2');
  });

  it('user cannot change their own role', async () => {
    const res1 = await request(app)
      .post('/api/auth/register')
      .send({ username: 'alice', password: 'alicepass' });
    const { token, user } = res1.body;

    const res = await request(app)
      .patch(`/api/users/${user.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ role: 'admin' });

    expect(res.status).toBe(403);
  });

  it('admin can change a user role', async () => {
    const adminToken = await registerAndLogin('admin', 'adminpass', 'admin');
    const res1 = await request(app)
      .post('/api/auth/register')
      .send({ username: 'alice', password: 'alicepass' });
    const aliceId = res1.body.user.id;

    const res = await request(app)
      .patch(`/api/users/${aliceId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'moderator' });

    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('moderator');
  });

  it('user cannot update another user', async () => {
    const res1 = await request(app)
      .post('/api/auth/register')
      .send({ username: 'alice', password: 'alicepass' });
    const res2 = await request(app)
      .post('/api/auth/register')
      .send({ username: 'bob', password: 'bobpass1' });

    const bobToken = res2.body.token;
    const aliceId = res1.body.user.id;

    const res = await request(app)
      .patch(`/api/users/${aliceId}`)
      .set('Authorization', `Bearer ${bobToken}`)
      .send({ username: 'hacked' });

    expect(res.status).toBe(403);
  });

  it('rejects duplicate username on update', async () => {
    await request(app).post('/api/auth/register').send({ username: 'bob', password: 'bobpass1' });
    const res1 = await request(app)
      .post('/api/auth/register')
      .send({ username: 'alice', password: 'alicepass' });
    const { token, user } = res1.body;

    const res = await request(app)
      .patch(`/api/users/${user.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ username: 'bob' });

    expect(res.status).toBe(409);
  });
});

describe('DELETE /api/users/:id', () => {
  it('admin can delete a user', async () => {
    const adminToken = await registerAndLogin('admin', 'adminpass', 'admin');
    const res1 = await request(app)
      .post('/api/auth/register')
      .send({ username: 'alice', password: 'alicepass' });
    const aliceId = res1.body.user.id;

    const res = await request(app)
      .delete(`/api/users/${aliceId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/deleted successfully/i);
  });

  it('admin cannot delete themselves', async () => {
    const res1 = await request(app)
      .post('/api/auth/register')
      .send({ username: 'admin', password: 'adminpass', role: 'admin' });
    const { token, user } = res1.body;

    const res = await request(app)
      .delete(`/api/users/${user.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
  });

  it('regular user cannot delete users', async () => {
    const adminToken = await registerAndLogin('admin', 'adminpass', 'admin');
    const res1 = await request(app)
      .post('/api/auth/register')
      .send({ username: 'alice', password: 'alicepass' });
    const aliceId = res1.body.user.id;

    const userToken = await registerAndLogin('bob', 'bobpass1', 'user');

    const res = await request(app)
      .delete(`/api/users/${aliceId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(403);
  });

  it('returns 404 when deleting non-existent user', async () => {
    const adminToken = await registerAndLogin('admin', 'adminpass', 'admin');
    const res = await request(app)
      .delete('/api/users/9999')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });
});
