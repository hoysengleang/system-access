# system-access

A Node.js/Express REST API providing user authentication and role-based access control (RBAC).

## Features

- **User registration & login** with JWT authentication
- **Roles**: `admin`, `moderator`, `user`
- **Protected routes** based on role
- **User management**: list, view, update, delete users (with permission checks)

## Getting Started

```bash
npm install
npm start        # runs on port 3000 (override with PORT env var)
npm test         # run all tests
```

## API Reference

### Auth

| Method | Endpoint              | Access     | Description                  |
|--------|-----------------------|------------|------------------------------|
| POST   | `/api/auth/register`  | Public     | Register a new user          |
| POST   | `/api/auth/login`     | Public     | Login and receive a JWT      |
| GET    | `/api/auth/me`        | Any user   | View current user profile    |

### Users

| Method | Endpoint          | Access              | Description              |
|--------|-------------------|---------------------|--------------------------|
| GET    | `/api/users`      | admin, moderator    | List all users           |
| GET    | `/api/users/:id`  | admin or own user   | Get a user by ID         |
| PATCH  | `/api/users/:id`  | admin or own user   | Update a user            |
| DELETE | `/api/users/:id`  | admin               | Delete a user            |

### Request/Response Examples

**Register**
```json
POST /api/auth/register
{ "username": "alice", "password": "secret123", "role": "user" }

201 Created
{ "user": { "id": 1, "username": "alice", "role": "user", "createdAt": "..." }, "token": "<jwt>" }
```

**Login**
```json
POST /api/auth/login
{ "username": "alice", "password": "secret123" }

200 OK
{ "user": { ... }, "token": "<jwt>" }
```

All authenticated requests require:
```
Authorization: Bearer <jwt>
```

## Environment Variables

| Variable        | Default                       | Description           |
|-----------------|-------------------------------|-----------------------|
| `PORT`          | `3000`                        | Server port           |
| `JWT_SECRET`    | `system-access-secret-key`    | JWT signing secret    |
| `JWT_EXPIRES_IN`| `24h`                         | JWT expiry duration   |

