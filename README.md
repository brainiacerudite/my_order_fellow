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
- 🪝 **Event-Driven Webhooks**: Secure webhook listener (HMAC-SHA256 signature verification) that accepts `order.created` and `order.updated` events.
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
git clone https://github.com/brainiacerudite/my_order_fellow.git
cd my_order_fellow
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory. You can copy from the example file:

```bash
cp .env.example .env
```

Then update the values in `.env`:

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

Since this is an event-driven system, you cannot easily test the "Order Reception" flow with just a browser. So a simulation script is provided to mimic an external e-commerce store sending data to the API.

1. Register a Company and get your **Webhook Secret** from the dashboard.
2. Open `scripts/simulate-webhook.ts`.
3. Update the `COMPANY_ID` and `WEBHOOK_SECRET` constants.
4. Run the simulation:

```bash
npx ts-node scripts/simulate-webhook.ts
```

You should see a success message, and a real email should land in your inbox!

---

## **Testing**

Run the comprehensive test suite (Unit + Integration).

```bash
npm test
```

- **Unit Tests:** `npm run test:unit` (Fast, logic-only)
- **Integration Tests:** `npm run test:int` (Full API flow with Test DB)

---

## 📚 API Documentation

You can import the `postman_collection.json` into Postman.

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
│   ├── types/          # TypeScript types
│   └── utils/          # Logger, Hashing, WebhookSignature
└── app.ts              # App Entry Point
```

---

## 📄 License

This project is licensed under the MIT License.
