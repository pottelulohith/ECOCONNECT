# EcoConnect / EcoCivic Backend API

A complete, production-ready, database-connected REST API built with **Express.js**, **MongoDB (Mongoose)**, **JWT Authentication**, and **Cloudinary** integration for circular plastic waste recovery and civic issue management.

---

## 🏗 Architecture Overview

EcoConnect unifies three distinct civic stakeholder interfaces onto a single synchronized MongoDB database:

1. **Citizens**: Doorstep plastic pickup scheduling, civic issue reporting, rewards wallet (PTS), and perk redemption.
2. **Municipality**: Command hub dashboard, complaint triage and team assignment, weight verification scale, inventory management, and industry purchase order review.
3. **Recycling Industries**: Recycled polymer marketplace (PET, HDPE, LDPE, PP), purchase requisition pipeline, escrow settlements, and live logistics tracking.

```
┌─────────────────────────────────────────────────────────────┐
│                       EcoConnect Frontend                   │
│     (React 19 + Vite 6 + Tailwind CSS 4 + Lucide Icons)     │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
        HTTP / JSON                    Session Cookies
               │                              │
┌──────────────▼──────────────────────────────▼───────────────┐
│                     EcoConnect Express API                  │
│    (Helmet, CORS, Cookie-Parser, Multer, Zod, JWT Auth)     │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
         Mongoose ORM                 Cloudinary SDK
               │                              │
┌──────────────▼──────────────┐        ┌──────▼───────────────┐
│     MongoDB Atlas / Local   │        │   Cloudinary Storage │
│ (10 Collections / Schemas)  │        │   (Uploads & Photos) │
└─────────────────────────────┘        └──────────────────────┘
```

---

## 📦 Database Schemas & Collections

| Model | Collection | Purpose |
|---|---|---|
| **User** | `users` | Role-based accounts (`citizen`, `municipality`, `industry`), hashed passwords, wallets, industry GST/profile data. |
| **PickupRequest** | `pickuprequests` | Doorstep collection appointments, scheduling, verified weight, polymer grade, reward outcomes. |
| **Complaint** | `complaints` | Civic reports (potholes, garbage, overflows), photo evidence, priority, assigned response team, timeline milestones. |
| **InventoryBatch** | `inventorybatches` | Real-time municipal stockpiles (PET, HDPE, LDPE, PP), purity %, processing facility, available weight. |
| **InventoryTransaction** | `inventorytransactions` | Audit ledger tracking all intakes from citizen collections and deductions from industry dispatches. |
| **PurchaseRequest** | `purchaserequests` | Formal B2B procurement requests placed by recycling industries to the municipality. |
| **Order** | `orders` | Confirmed logistics shipments with driver details, vehicles, and waypoint milestones. |
| **CreditTransaction** | `credittransactions` | Immutable ledger of green points (PTS) earned from recycling or spent on civic vouchers. |
| **ActivityLog** | `activitylogs` | Audit trail across citizen, municipal, and industry portals. |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** v18+ (tested on Node v20/v24)
- **MongoDB** (MongoDB Atlas cloud cluster or local `mongod`)

### 2. Install Dependencies
```bash
# In the backend directory:
cd backend
npm install
```

### 3. Environment Variables Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env` with your values:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
COOKIE_NAME=ecocivic_session
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long
JWT_EXPIRES_IN=7d

# MongoDB Atlas Connection String
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/ecoconnect?retryWrites=true&w=majority

# Cloudinary (Optional - local fallback automatically operates when omitted)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Initial Seed Credentials
SEED_ADMIN_EMAIL=admin@ecoconnect.local
SEED_ADMIN_PASSWORD=admin123
SEED_ADMIN_NAME=Officer R. Vance
```

---

## 🗄 MongoDB Atlas Setup Guide

1. Sign up or log into [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Click **Build a Database** and select the **Free (M0)** shared cluster.
3. Under **Security Quickstart**:
   - Create a database user with username and password (e.g. `ecouser` / `SecretPass123`).
   - Under **IP Access List**, click **Add My Current IP Address** (or `0.0.0.0/0` for universal dev access).
4. Go to **Database Deployments** → Click **Connect** → Choose **Drivers (Node.js)**.
5. Copy the connection string and paste it as `MONGODB_URI` in `backend/.env`.
   *(Replace `<password>` with your database user password).*

---

## 🌱 Seeding Initial Data

Run the database seeder to populate realistic municipal administrators, citizen users, industry partners, inventory stockpiles, and sample queues:

```bash
cd backend
npm run seed
```

### Default Seed Accounts:

| Role | Email | Password | Details |
|---|---|---|---|
| **Municipality** | `admin@ecoconnect.local` | `admin123` | Officer R. Vance, Central Command |
| **Citizen** | `citizen@ecoconnect.local` | `citizen123` | Arjun Mehta, 450 PTS balance |
| **Industry** | `industry@ecoconnect.local` | `industry123` | Green Polymer Industries Ltd. |

---

## 💻 Running the Application

### Start Backend API Server
```bash
cd backend
npm start
# or with file watching:
npm run dev
```
Backend will listen at `http://localhost:5000`.

### Start React Frontend
In a separate terminal at the project root:
```bash
npm.cmd run dev
```
Frontend will run at `http://localhost:5173`. Vite proxies all `/api` requests directly to `http://localhost:5000`.

---

## 🧪 Testing

Run backend automated integration tests:
```bash
cd backend
npm test
```

---

## 📡 REST API Reference

### 🔐 Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new account (`citizen`, `municipality`, or `industry`)
- `POST /api/auth/login` — Login with email and password (returns JWT and sets HTTP-only cookie)
- `POST /api/auth/logout` — Clear session cookie
- `GET /api/auth/me` — Get current authenticated user profile
- `PATCH /api/auth/profile` — Update user address, ward, or industry company details
- `POST /api/auth/demo-login` — Fast-switch session between `citizen`, `municipality`, and `industry`

### 👤 Citizen Endpoints (`/api/citizen`, `/api/pickups`, `/api/complaints`)
- `GET /api/citizen/dashboard` — Live recycled weight, PTS balance, resolved issues count
- `GET /api/citizen/credits` — Current wallet points balance
- `GET /api/citizen/credits/transactions` — Ledger of earned and redeemed points
- `POST /api/citizen/credits/redeem` — Redeem municipal vouchers with PTS
- `POST /api/pickups` — Schedule doorstep plastic pickup
- `GET /api/pickups/mine` — Get logged-in citizen's pickup requests
- `POST /api/complaints` — Submit civic issue report with photo and category
- `GET /api/complaints/mine` — Get citizen's submitted reports and status timelines

### 🏛 Municipality Endpoints (`/api/municipality`)
- `GET /api/municipality/dashboard` — Command Hub metrics: open complaints, active queue, total collected kg, stock kg
- `GET /api/municipality/activity-logs` — System and municipal operations audit trail
- `GET /api/municipality/pickups` — Incoming citizen collection requests
- `PATCH /api/municipality/pickups/:id/schedule` — Set scheduled pickup date
- `PATCH /api/municipality/pickups/:id/verify` — Scale weight verification; automatically adds stock to polymer inventory and credits citizen's wallet
- `GET /api/municipality/complaints` — All civic issue reports
- `PATCH /api/municipality/complaints/:id/assign` — Assign response team and update status
- `PATCH /api/municipality/complaints/:id/status` — Mark complaint in progress or resolved
- `GET /api/municipality/inventory` — Polymer batches stock levels (PET, HDPE, LDPE, PP)
- `GET /api/municipality/inventory/transactions` — Audit ledger of all stock intake and dispatches
- `GET /api/industry/purchase-requests` — All industry orders awaiting municipal approval
- `PATCH /api/industry/purchase-requests/:id/approve` — Approve purchase order; deducts inventory and triggers freight dispatch
- `PATCH /api/industry/purchase-requests/:id/reject` — Deny purchase request

### 🏭 Industry Endpoints (`/api/industry`)
- `GET /api/industry/dashboard` — Total procurement volume (kg), capital spend, pending requests, active shipments
- `GET /api/industry/marketplace` — Available sorted polymer batches from municipal recovery facilities
- `POST /api/industry/purchase-requests` — Place purchase order for selected polymer batches
- `GET /api/industry/purchase-requests/mine` — Industry's own purchase order history
- `GET /api/industry/orders` — Inbound logistics shipments with driver contact, vehicle info, and delivery tracking

### ☁️ File Upload (`/api/upload`)
- `POST /api/upload` — Multipart image upload (Cloudinary with local fallback)
