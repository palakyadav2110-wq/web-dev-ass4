# Secure Connect & Communication Platform

Node.js + Express + MongoDB backend with JWT auth, bcrypt, RBAC, a protected Notes API,
Socket.IO real-time chat and EventEmitter-based events.

## Setup
```bash
npm install
cp .env.example .env   # edit JWT_SECRET / MONGO_URI
npm start              # http://localhost:5000
```

## Endpoints
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | /api/auth/signup | – | Register (username, email, password) |
| POST | /api/auth/login | – | Returns JWT (+ sets `token` cookie) |
| POST | /api/auth/logout | – | Clears cookie |
| GET | /api/auth/me | JWT | Current user |
| GET | /api/auth/users | JWT + admin | List users (RBAC) |
| POST/GET | /api/notes | JWT | Create / list notes |
| GET/PUT/DELETE | /api/notes/:id | JWT | Read / update / delete a note |

Chat: open `http://localhost:5000`, paste the JWT, connect.

## API Test Screenshots (REST Client)

**Signup (201 Created)**
![Signup](screenshots/signup.png)

**Login (200 OK + JWT)**
![Login](screenshots/login.png)

**Notes without token (403 Forbidden)**
![Notes without token](screenshots/notes-403.png)

**Create note (201 Created)**
![Create note](screenshots/notes-post.png)

**Get notes (200 OK)**
![Get notes](screenshots/notes-get.png)

**Protected route /me (200 OK)**
![Auth me](screenshots/auth-me.png)

**RBAC: admin-only route blocked for normal user (403)**
![RBAC](screenshots/rbac-admin-403.png)

**Socket.IO chat logs**
![Chat logs](screenshots/chat-logs.png)

## Concepts Covered
Authentication, Authorization, JWT, bcrypt, Protected Routes, RBAC, dotenv, WebSockets, Socket.IO, EventEmitter
