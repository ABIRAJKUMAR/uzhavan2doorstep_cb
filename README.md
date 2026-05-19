# 🌾 UZHAVAN 2 DOORSTEP - Modern Agritech Supply Chain Platform

A state-of-the-art, real-time, full-stack Agritech platform designed to bridge the gap between farmers, retailers, and direct customers. By eliminating traditional middlemen, providing AI-driven price calculations, integrating live government market data, and enabling farm-to-table traceability via QR codes, **UZHAVAN 2 DOORSTEP** empowers farmers with fair pricing and retailers with fresh quality.

---

## 🚀 Key Features

### 👨‍🌾 Farmer Ecosystem
- **Inventory Management**: Add and manage crop listings with real-time stock levels, quality grades, and images.
- **Analytics & Earnings**: Track total volume sold, pending orders, and total revenue directly on a dedicated dashboard.
- **Automated Invoices**: Batched PDF invoices generated automatically upon order fulfillment.

### 🏪 Retailer & Customer Marketplace
- **Dynamic Marketplace**: Search, filter, and buy organic or high-grade crops directly from nearby farms.
- **Smart Checkout & Payments**: Safe online transactions powered by Razorpay checkout gateway.
- **Order Tracking & QR Traceability**: Scan product QR codes to view the origin farm, harvest details, quality standards, and transportation log.

### 🌐 Smart Integrations
- **Live Govt. Market Rates**: Real-time commodity price synchronization via the official Indian Government Agmarknet API (data.gov.in) with automatic unit conversion (Quintal to Kg).
- **Automated Transactional Emails**: Low-stock alerts, order confirmations, invoice delivery, and shipping updates powered by Brevo (SMTP).
- **Socket.io Live Sync**: Real-time order updates, inventory changes, and notifications.
- **Dynamic System Statistics**: Landing page showing real-time statistics of active farmers, retail partners, and total metric tonnage of produce delivered.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
|---|---|
| **Frontend** | React.js (Vite), Redux Toolkit, Tailwind CSS, Framer Motion, Axios, React Router, Lucide Icons |
| **Backend** | Node.js, Express.js, Socket.io, Sequelize ORM, JWT, node-cron |
| **Database** | Supabase (PostgreSQL Cloud) |
| **Media Hosting**| Cloudinary |
| **Gateways & APIs**| Razorpay (Payment Gateway), Brevo (Transactional Mail API), Agmarknet API (Govt. Market Prices) |

---

## ⚙️ Environmental Configurations (`.env`)

### Backend Setup (`backend/.env`)
Create a `.env` file inside the `backend` folder and populate it with the following:
```env
PORT=5000
DB_HOST=your-supabase-postgres-host
DB_PORT=5432
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_NAME=postgres
JWT_SECRET=your-jwt-auth-secret
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
AGMARKNET_API_KEY=your-data-gov-in-api-key
EMAIL_USER=your-email-address
EMAIL_PASS=your-email-app-password
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-secret
BREVO_API_KEY=your-brevo-api-key
```

### Frontend Setup (`frontend/.env`)
Create a `.env` file inside the `frontend` folder and populate it with the following:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

## 🏃 Setup & Installation

### Prerequisite
Ensure you have **Node.js** (v18+) and **NPM** installed on your system.

### 1. Run Backend Server
```bash
cd backend
npm install
npm run dev
```
- Server will initialize database connections, run schema synchronizations, fetch government market rates, and listen on `http://localhost:5000`.

### 2. Run Frontend Web App
```bash
cd frontend
npm install
npm run dev
```
- Open your browser and navigate to `http://localhost:5173`.

---

## 🛡️ License & Copyright
&copy; 2026 UZHAVAN 2 DOORSTEP. All rights reserved. Designed with ❤️ for sustainable agricultural trade.
