# ECO-CONNECT (EcoCivic) — Full Stack Citizen & Circular Economy Platform

A complete, database-connected civic circular economy platform built with **React 19**, **Vite 6**, **Tailwind CSS 4**, and a persistent **Express.js + MongoDB (Mongoose)** backend API with **JWT Authentication** and **Cloudinary** media storage.

EcoConnect unifies three primary stakeholder portals with real-time data exchange:
1. **Citizens**: Schedule doorstep plastic pickups, report civic hazards, earn civic credits (PTS), and redeem utility/transit vouchers.
2. **Municipality**: Command Hub overview, triage and dispatch field teams to civic issues, verify collected plastic weights, update inventory, and approve industry purchase requests.
3. **Recycling Industries**: Purchase sorted post-consumer polymers (PET, HDPE, LDPE, PP) directly from municipal recovery hubs, track orders, and monitor simulated freight GPS delivery.

---

## 🛠️ Full Stack Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       EcoConnect Frontend                   │
│   (Citizen Portal | Municipal Command | Industry Portal)    │
└──────────────────────────────┬──────────────────────────────┘
                               │
                       Vite Proxy (/api)
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                    EcoConnect Backend API                   │
│               Express.js • Node.js • Port 5000              │
│       JWT Cookies • Multer • Mongoose ORM • Helmet          │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
         Mongoose ORM                  Cloudinary SDK
               │                              │
┌──────────────▼──────────────┐        ┌──────▼───────────────┐
│     MongoDB Atlas / Local   │        │   Cloudinary Storage │
│ (10 Synchronized Models)    │        │   (Uploads & Photos) │
└─────────────────────────────┘        └──────────────────────┘
```

---

## 🚀 Quick Start Guide

### 1. Start the Backend API

```bash
cd backend

# Install dependencies (first time only)
npm.cmd install

# Configure environment variables
# Copy .env.example to .env and configure your MongoDB connection string
copy .env.example .env

# (Optional) Seed the database with initial admin, sample records, and inventory
npm.cmd run seed

# Start backend server (starts on http://localhost:5000)
npm.cmd start
```

### 2. Start the Frontend Dev Server

In a new terminal window in the project root:

```bash
# Install frontend dependencies (if not already done)
npm.cmd install

# Start Vite dev server (starts on http://localhost:5173)
npm.cmd run dev
```

Open `http://localhost:5173` in your browser. All requests to `/api` are automatically proxied to the backend at `http://localhost:5000`.

---

## 🔐 Default Demo Accounts

Use the persistent **EcoConnect Portals** pill at the bottom of the screen to quickly switch between all three stakeholder roles, or log in with these credentials:

| Portal | Email | Password | Role |
|---|---|---|---|
| **Municipality** | `admin@ecoconnect.local` | `admin123` | Officer R. Vance |
| **Citizen** | `citizen@ecoconnect.local` | `citizen123` | Arjun Mehta |
| **Industry** | `industry@ecoconnect.local` | `industry123` | Green Polymer Industries Ltd. |

---

## 📦 Data Models & Cross-Portal Integration

- **Doorstep Plastic Pickups**: When a Citizen requests a pickup, it appears in the Municipality's collection queue. When the Municipality verifies the scale weight and polymer type, credits are automatically added to the Citizen's wallet and stock is automatically added to the Municipal polymer inventory.
- **Civic Complaints**: When a Citizen reports an issue with photo evidence, it appears in the Municipality Complaints Flow. The officer assigns a response team (e.g. Roads Crew, Electrical Squad), which immediately updates the Citizen's resolution timeline.
- **Polymer Marketplace & Sales**: The Municipality maintains stockpiles of PET, HDPE, LDPE, and PP. Recycling Industries can inspect batches and submit purchase requests. When the Municipality approves an order, the stock is automatically deducted from inventory and a tracked delivery shipment is created.

---

## 🧪 Testing and Production Builds

- **Backend Integration Tests**:
  ```bash
  cd backend
  npm.cmd test
  ```
- **Frontend Production Build**:
  ```bash
  npm.cmd run build
  ```
