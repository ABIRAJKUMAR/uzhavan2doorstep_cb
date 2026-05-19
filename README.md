# 🌾 UZHAVAN 2 DOORSTEP 🌾
### Connecting Farmers Directly to Retailers & Customers

UZHAVAN 2 DOORSTEP is a premium, full-stack AgTech supply chain platform designed to eliminate middlemen, ensure fair pricing, and deliver fresh produce directly from farms to local shops and households. Powered by real-time Indian Government market data (Agmarknet), automated invoice generation, transactional notifications, and end-to-end QR code traceability.

---

## 🚀 Key Features

### 1. Real-time Market Price Ticker (Agmarknet API)
* Integrated with the official Indian Government API (`data.gov.in`) to fetch daily crop prices across Tamil Nadu.
* Dynamically updates 84+ unique commodities (Tomato, Onion, Potato, Chilli, etc.) matching localized market rates (Paramakudi, Ramanathapuram, Katpadi Uzhavar Sandhais).
* Runs on an automated daily cron job at 6:00 AM, converting values from Rs. per quintal to Rs. per kg.

### 2. End-to-End QR Traceability
* Every product listed features a dynamic, automatically generated QR code.
* Retailers and customers can scan the code to instantly view complete transparency details: farmer profile, harvest location, harvest date, organic certification status, and transport details.

### 3. Role-Based Dashboards (Farmer, Retailer, Customer)
* **Farmers:** Crop inventory management, stock level indicators, low-stock alerts, active sales metrics, and order fulfillment controls.
* **Retailers & Customers:** Complete marketplace access, dynamic shopping cart, structured checkout, order history pipelines, and PDF invoices.

### 4. Interactive Transactional Systems
* **Payment Integration:** Ready for payment processing.
* **Brevo Email Notifications:** Fully integrated transaction emails notifying buyers on order placement and farmers on stock thresholds.
* **Dynamic PDF Invoices:** Built-in client-side and server-side PDF generator to instantly produce beautiful, shareable order invoices.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
|---|---|
| **Frontend** | React (Vite), Redux Toolkit, Tailwind CSS, Framer Motion, Lucide Icons, Axios |
| **Backend** | Node.js, Express.js, Sequelize ORM, PostgreSQL, Socket.io, Node-cron |
| **Integrations** | Cloudinary (Image Cloud), Brevo SMTP (Transactional Email), Razorpay, Agmarknet API |
| **Deployment** | Vercel (Frontend), Render (Backend + Database Cron) |

---

## 📂 Project Architecture

```
UZHAVAN2DOORSTEP/
├── backend/
│   ├── src/
│   │   ├── config/          # Sequelize & Database Configuration
│   │   ├── controllers/     # API Route Controllers (Auth, Orders, Products, Payments)
│   │   ├── jobs/            # Node-cron Daily Government Market Ticker Job
│   │   ├── models/          # Sequelize PostgreSQL Models (User, Product, Order, Price)
│   │   ├── routes/          # REST Endpoint Routers
│   │   └── utils/           # Utility Services (Email, PDF, Cloudinary)
│   ├── index.js             # Express App Entrance
│   └── .env                 # Server Environmental Configurations
├── frontend/
│   ├── public/              # Static Icons, SVG Favicons, and Backgrounds
│   ├── src/
│   │   ├── components/      # Shared components (Navbar, ProtectedRoutes, Ticker)
│   │   ├── pages/           # Pages (LandingPage, Marketplace, Dashboards, Traceability)
│   │   ├── store/           # Redux State Management Store
│   │   ├── App.jsx          # Route Mapping & ScrollToTop handler
│   │   └── main.jsx         # React DOM Render Engine
│   └── tailwind.config.js   # Custom Design Palette & Dark Mode tokens
```

---

## ⚙️ Environment Configuration

### Backend Setup (`backend/.env`)
Create a `.env` file in the `backend` directory with the following variables:
```env
PORT=5000
DB_HOST=your-database-host
DB_PORT=5432
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_NAME=postgres
JWT_SECRET=your_jwt_secret_token
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
AGMARKNET_API_KEY=your_data_gov_in_api_key
EMAIL_USER=your_gmail_user
EMAIL_PASS=your_gmail_app_password
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
BREVO_API_KEY=your_brevo_api_key
```

### Frontend Setup (`frontend/.env`)
Create a `.env` file in the `frontend` directory:
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 💻 Local Development Setup

### Step 1: Clone & Configure Database
Ensure you have a PostgreSQL database instance running locally or via a cloud hosting provider (e.g., Supabase, Neon).

### Step 2: Initialize Backend
```bash
cd backend
npm install
npm run dev
```
*The backend will sync all Sequelize models with the database, trigger a startup test fetch to Agmarknet to populate initial rates, and listen on port `5000`.*

### Step 3: Initialize Frontend
```bash
cd ../frontend
npm install
npm run dev
```
*The frontend development server will launch on `http://localhost:5173`.*

---

## 🎨 Premium Visual Standards
* **Adaptive Dark Mode:** Fully responds to system preferences or manual navbar toggles with unified slate dark color tokens (`dark:bg-dark-900`, `dark:bg-dark-800`).
* **Glassmorphism Effects:** Frosted glass navbar header layouts leveraging backdrop-filters for a highly modern aesthetic.
* **Fluid Interactions:** Smooth micro-animations powered by `framer-motion` for cards, buttons, status badges, and loading states.
