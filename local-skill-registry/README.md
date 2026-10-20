# 🌾 Local Skill Registry (ग्रामीण कौशल्य नोंदणी)

A full-stack rural community engagement platform (developed for college community-engagement + government e-services curriculum) that helps Gram Panchayats, government contractors, NGOs, and local businesses discover informal/unorganized-sector workers (masons, electricians, tailors, drivers, welders, farm laborers, plumbers, carpenters, painters, cooks, mechanics, etc.) in nearby villages with a built-in trust and privacy layer.

---

## 🌟 Key Features

1. **Public Worker Directory & Search Engine**:
   - Filter and search informal workers by **Skill Category**, **Village**, **Availability Status**, and **Panchayat Verified Status**.
   - Instant search across names, skills, tools owned, and tehsils.
   - Dual view modes: **Modern Card View** and **Data Table View**.
2. **Built-in Privacy & Anti-Spam Safeguard**:
   - Worker phone numbers are **strictly masked by default** on all public endpoints (`+91 98•••• ••21`) to protect vulnerable rural workers from predatory telemarketers and scammers.
3. **Contact Request & Approval Workflow**:
   - Requesters submit a structured request (Name, Organization/PWD Contractor, Contact Phone, Purpose of hiring).
   - An approved **Panchayat Clerk** reviews and approves/denies requests.
   - Upon Panchayat clearance, the requester unlocks the worker's verified phone number with one-tap **Direct Call** and **WhatsApp** messaging.
4. **Worker Ratings & Community Trust**:
   - After a contact engagement is approved, requesters can leave **1–5 Star Ratings** with written feedback, dynamically updating the worker's average rating and regional reputation.
5. **Worker Registration Form (Replacing Paper / Google Forms)**:
   - Modern, mobile-first registration portal for self-service or Panchayat Sahayak data entry.
   - Includes **e-Shram UAN reference number** linking to national social security schemes.
   - Dual client-side & server-side input validation.
6. **Panchayat Clerk Administration Portal (JWT Authentication)**:
   - Secure clerk login (`admin` / `Panchayat@2026`).
   - Manage pending contact requests with one-click **Approve** (releases phone) or **Deny** with custom notes.
   - Verify/Unverify worker profiles with official Gram Panchayat digital seals.
   - Regional analytics: Top skills registered and village density breakdowns to identify local skill gaps.
7. **Trilingual Localization (100% Native Coverage)**:
   - Seamlessly toggle between **English**, **Hindi (हिंदी)**, and **Marathi (मराठी)** across all pages, forms, badges, modals, and error states with zero reload.
8. **PWA Offline-First Ready**:
   - Web App Manifest (`manifest.json`) + Service Worker (`sw.js`) enabling mobile home-screen installation and offline caching for low-connectivity rural environments.

---

## 🛠 Tech Stack

- **Frontend**: React 18, Vite, Lucide-React icons, Custom Responsive Design System (no heavy utility dependencies, earth & panchayat green palette).
- **Backend**: Node.js, Express.js, JWT, bcryptjs, express-validator.
- **Database**: MongoDB with Mongoose (configured with dual-mode: connects to external `MONGODB_URI` or launches zero-config embedded MongoMemoryServer automatically if local MongoDB is not running).

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### 1. Installation
Install dependencies for both client and server:
```bash
# From root directory:
npm run install:all
```
*(Or install individually: `cd server && npm install`, then `cd ../client && npm install`)*

### 2. Configure Environment Variables
Copy `.env.example` to `.env` in the `server` directory:
```bash
cd server
cp .env.example .env
```
Default `.env` configuration:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/local_skill_registry
JWT_SECRET=super_secret_panchayat_key_2026_local_skill_registry
NODE_ENV=development
USE_MEMORY_DB=false
```
*Note: If local MongoDB is not running on port 27017, the application automatically falls back to an embedded Mongo instance so you can start right away without installing MongoDB!*

### 3. Seed Database with 110+ Workers & Requests
Run the database seed script:
```bash
# From project root:
npm run seed
```
*(Or from `server/`: `node seed.js`)*

Seeded datasets include:
- **112 Realistic Rural Workers** spanning **15 Skill Trades** (Mason, Electrician, Tailor, Driver, Welder, Farm Laborer, Plumber, Carpenter, Painter, Cook, Mechanic, Blacksmith, Potter, Solar Technician, Weaver) across **15 Distinct Villages** (Shivpur, Ramnagar, Chandanwadi, Pipla, Belora, Morgaon, Khed, Sonapur, Wadgaon, Jamthi, Sultanpur, Navapur, Anjanvel, Dhamangaon, Shirkoli).
- **12 Sample Contact Requests** with pending, approved, and denied statuses.
- **Default Admin Account**:
  - **Username**: `admin`
  - **Password**: `Panchayat@2026`

### 4. Run Application
Run both backend and frontend concurrently:
```bash
# From project root:
npm run dev
```

Or run separately in two terminal windows:
```bash
# Terminal 1 (Backend API on port 5000):
npm run server

# Terminal 2 (Vite Frontend on port 3000):
npm run client
```

Open your browser at:
👉 **`http://localhost:3000/`**

---

## 📋 API Endpoints Reference

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/health` | Service health status | No |
| `GET` | `/api/workers` | Public search & filter workers (phone masked) | No |
| `GET` | `/api/workers/:id` | Get worker details & reviews | No |
| `POST` | `/api/workers` | Register new worker with validation | No |
| `PATCH` | `/api/workers/:id/verify` | Toggle Panchayat verification seal | **Yes (Admin JWT)** |
| `PUT` | `/api/workers/:id` | Edit worker details | **Yes (Admin JWT)** |
| `DELETE` | `/api/workers/:id` | Remove worker from registry | **Yes (Admin JWT)** |
| `GET` | `/api/workers/meta/filters` | Distinct skills and villages list | No |
| `POST` | `/api/contact-requests` | Submit request to unlock worker contact | No |
| `GET` | `/api/contact-requests/track/:id` | Track request status (reveals phone if approved) | No |
| `GET` | `/api/contact-requests` | List all requests with status filters | **Yes (Admin JWT)** |
| `PATCH` | `/api/contact-requests/:id/status` | Approve or Deny request with clerk notes | **Yes (Admin JWT)** |
| `POST` | `/api/contact-requests/:id/rate` | Submit 1–5 star rating for approved worker | No (Validated) |
| `POST` | `/api/auth/login` | Clerk login (returns JWT token) | No |
| `GET` | `/api/auth/me` | Current admin session verification | **Yes (Admin JWT)** |
| `GET` | `/api/stats` | Aggregate metrics (workers, verification %, skills) | No |

---

## 🏛️ E-Governance & Academic Project Alignment
- **Problem Addressed**: Informal/unorganized rural laborers (representing 80%+ of India's rural non-farm workforce) face severe underemployment and income instability due to reliance on word-of-mouth.
- **Privacy Design**: Unlike commercial lead generators that broadcast phone numbers leading to spam, this platform enforces a trusted, public-interest governance model where the local Gram Panchayat acts as the privacy gatekeeper.
- **Welfare Linkage**: Facilitates voluntary **e-Shram Universal Account Number (UAN)** capture, linking rural artisans to PM-SYM pension and accidental insurance schemes.
