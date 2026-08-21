# Godown ERP

Full-stack godown management ERP built with React, Vite, Tailwind CSS, Node.js, Express, MongoDB and Mongoose.

## Current modules

- Dashboard
- Farmers
- Paddy Purchases
- Labour Management
- Payments
- Stock
- Truck Register
- Reports & Analytics
- JWT administrator authentication

## Project structure

```text
Godown-ERP/
├── client/              React + Vite frontend
├── server/              Express + MongoDB backend
└── .github/workflows/   CI validation
```

## Requirements

- Node.js 20 or newer
- npm
- MongoDB Atlas connection string or a local MongoDB server

## 1. Configure the backend

From the project root, copy `server/.env.example` to `server/.env` and set real values.

```env
PORT=5000
MONGODB_URI=your-mongodb-connection-string
CLIENT_ORIGIN=http://localhost:5173
JWT_SECRET=your-long-random-secret
ADMIN_NAME=Godown Admin
ADMIN_EMAIL=your-admin-email
ADMIN_PASSWORD=your-strong-password
```

Never commit `server/.env`.

The first time the backend starts, it creates the configured administrator if that email does not already exist in MongoDB. The password is stored as a bcrypt hash, not plain text.

## 2. Configure the frontend

Copy `client/.env.example` to `client/.env`.

```env
VITE_API_URL=http://localhost:5000/api
```

## 3. Install dependencies

Backend:

```bash
cd server
npm install
```

Frontend in another terminal:

```bash
cd client
npm ci
```

## 4. Run the application

Backend:

```bash
cd server
npm run dev
```

Frontend:

```bash
cd client
npm run dev
```

Open the Vite URL shown in the terminal, normally `http://localhost:5173`.

Sign in with the `ADMIN_EMAIL` and `ADMIN_PASSWORD` configured in `server/.env`.

## Main API routes

All ERP routes except health and login require a JWT access token.

```text
GET    /api/health
POST   /api/auth/login
GET    /api/auth/me
GET    /api/dashboard
/api/farmers
/api/labours
/api/purchases
/api/payments
/api/stocks
/api/trucks
```

The resource endpoints support standard list, read, create, update and delete operations.

## Data flow

```text
React form/page
    ↓
client/src/api.js
    ↓ Authorization: Bearer <JWT>
Express API
    ↓
Mongoose model
    ↓
MongoDB
```

When a page reloads, records are loaded again from MongoDB instead of being lost from React state or browser local storage.

## CI

The GitHub Actions workflow validates the frontend build and checks backend JavaScript syntax on pushes and pull requests.
