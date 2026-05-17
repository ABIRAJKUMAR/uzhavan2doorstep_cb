# AgriLink - Farmer to Retailer Supply Chain Platform

A modern AI-powered full stack web application connecting farmers directly with retailers. Farmers can upload and sell agricultural products, and retailers can buy directly without traditional middlemen.

## Technologies Used
- **Frontend**: React.js, Vite, Tailwind CSS, Redux Toolkit, React Router, Axios, Framer Motion, Lucide React
- **Backend**: Node.js, Express.js, PostgreSQL (Sequelize), JWT Authentication, Cloudinary (for images)

## Setup Instructions

### 1. Backend Setup
1. Open terminal and navigate to the `backend` folder.
2. Ensure you have PostgreSQL installed and running. Create a database named `agrilink`.
3. Update `backend/.env` with your PostgreSQL credentials and Cloudinary credentials if available.
4. Run `npm install` to install dependencies.
5. Run `npm run dev` to start the backend server on `http://localhost:5000`.

### 2. Frontend Setup
1. Open a new terminal and navigate to the `frontend` folder.
2. Run `npm install` to install dependencies.
3. Run `npm run dev` to start the frontend application.
4. Access the app at `http://localhost:5173`.

## Features Implemented
- JWT-based authentication for Farmers and Retailers
- Glassmorphism UI and Dark Mode support
- Farmer Dashboard (Add products, view stock, manage orders, view analytics)
- Retailer Dashboard (View marketplace, add to cart, checkout, view order history)
- Beautiful Marketplace page
- Responsive modern design
