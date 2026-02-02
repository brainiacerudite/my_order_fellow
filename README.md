# My Order Fellow 📦 🚀

**Event-Driven Logistics SaaS Platform**  
Real-time order tracking and automated customer notifications for e-commerce businesses.

---

## 📖 Overview

My Order Fellow is a B2B SaaS backend that serves as the **"Tracking Logic Layer"** for e-commerce stores. Instead of building their own tracking systems, companies connect their store (Shopify, WooCommerce, Custom) to our API via Webhooks.

When an order is created or updated on the store's end, My Order Fellow automatically:

- **Ingests the Event** securely via signed webhooks.
- **Processes the Data** (Normalizes status, updates history).
- **Notifies the Customer** via beautiful, templated emails.
- **Updates the Tracking Page** instantly.

---

## ✨ Key Features

- 🔐 **Secure Authentication**: JWT-based auth with Refresh Tokens and Email OTP verification.
- 🏢 **Company Onboarding & KYC**: Companies must submit KYC documents. Only Admin-approved companies receive API keys (Webhook Secrets).
- 🪝 **Event-Driven Webhooks**: Secure webhook listener (HMAC-SHA256 signature verification) that accepts `ORDER_CREATED` and `ORDER_UPDATED` events.
- 📧 **Automated Notification Engine**: "Fire-and-forget" email system using EJS Templates (Transactional emails for OTPs, Tracking Updates).
- 🔍 **Public Tracking API**: Rate-limited public endpoint for end-customers to view their package journey without logging in.
- 🛡️ **Role-Based Access Control (RBAC)**: Distinct roles for `COMPANY` and `ADMIN` (Separate Admin Portal).

---

## 🛠️ Tech Stack

- **Language**: TypeScript
- **Runtime**: Node.js (Express)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Validation**: Zod
- **Email**: Nodemailer + EJS (Gmail SMTP)
- **Security**: Helmet, CORS, Express-Rate-Limit, BCrypt

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL (Local or Cloud)

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/my-order-fellow.git
cd my-order-fellow
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```ini
# Server
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/order_fellow_db"

# JWT Security
JWT_SECRET="your-super-secret-key"
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Email (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM_NAME="My Order Fellow"
EMAIL_FROM_ADDRESS=your-email@gmail.com
```

### 3. Database Setup

Run the migrations to create the tables:

```bash
npx prisma migrate dev --name init
```

### 4. Run the Server

```bash
# Development Mode (Hot Reload)
npm run dev

# Build & Start Production
npm run build
npm start
```

---

## 🧪 Testing Webhooks (Simulation)

Since this is an event-driven system, you cannot easily test the "Order Reception" flow with just a browser. We have provided a simulation script to mimic an external e-commerce store sending data to your API.

1. Register a Company and get your **Webhook Secret** from the dashboard (or DB).
2. Open `scripts/simulate-webhook.ts`.
3. Update the `COMPANY_ID` and `WEBHOOK_SECRET` constants.
4. Run the simulation:

```bash
npx ts-node scripts/simulate-webhook.ts
```

You should see a success message, and a real email should land in your inbox!

---

## 📚 API Documentation

You can import the `postman_collection.json` (if included) into Postman.

### Key Endpoints

| Method | Endpoint                        | Description               | Auth                  |
| ------ | ------------------------------- | ------------------------- | --------------------- |
| POST   | `/api/v1/auth/register`         | Register new company      | Public                |
| POST   | `/api/v1/companies/kyc`         | Submit KYC Docs           | Bearer                |
| GET    | `/api/v1/tracking/:id`          | Public Order Tracking     | Public (Rate Limited) |
| POST   | `/api/v1/webhooks/incoming`     | Ingest Order Events       | HMAC Signature        |
| POST   | `/api/v1/admin/kyc/:id/approve` | Approve Company & Gen Key | Admin Bearer          |

---

## 📂 Project Structure

```
src/
├── config/             # Environment config & Constants
├── modules/            # Feature-based Modules (Controller, Service, Routes)
│   ├── auth/           # Login/Register/OTP
│   ├── company/        # Profile & KYC
│   ├── order/          # Order Logic
│   ├── webhook/        # Event Listener & Validation
│   ├── admin/          # Admin Approval Logic
│   └── notification/   # Email Service
├── shared/
│   ├── database/       # Prisma Client
│   ├── middlewares/    # Auth, Error, RateLimit, WebhookParser
│   ├── templates/      # EJS Email Templates
│   └── utils/          # Logger, Hashing, WebhookSignature
└── app.ts              # App Entry Point
```

---

## 📄 License

This project is licensed under the MIT License.
