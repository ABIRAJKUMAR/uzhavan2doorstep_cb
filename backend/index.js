import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import dns from 'dns';
// Disable IPv6 resolution globally to force Nodemailer and other packages to connect via IPv4
dns.resolve6 = (hostname, options, callback) => {
  const cb = typeof options === 'function' ? options : callback;
  process.nextTick(() => cb(new Error('IPv6 resolution disabled')));
};
if (dns.promises && dns.promises.resolve6) {
  dns.promises.resolve6 = async () => {
    throw new Error('IPv6 resolution disabled');
  };
}
const originalResolve = dns.resolve;
dns.resolve = (hostname, rrtype, callback) => {
  const type = typeof rrtype === 'string' ? rrtype : 'A';
  const cb = typeof rrtype === 'function' ? rrtype : callback;
  if (type === 'AAAA') {
    return process.nextTick(() => cb(new Error('IPv6 resolution disabled')));
  }
  return originalResolve(hostname, rrtype, cb);
};
dns.setDefaultResultOrder('ipv4first');
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';
import sequelize from './src/config/db.js';
import authRoutes from './src/routes/authRoutes.js';
import productRoutes from './src/routes/productRoutes.js';
import orderRoutes from './src/routes/orderRoutes.js';
import paymentRoutes from './src/routes/paymentRoutes.js';
import marketPriceRoutes from './src/routes/marketPriceRoutes.js';
import reviewRoutes from './src/routes/reviewRoutes.js';
import { startMarketPriceCron, triggerManualFetch } from './src/jobs/marketPriceCron.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
  }
});

app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/market-prices', marketPriceRoutes);
app.use('/api/reviews', reviewRoutes);

// Socket.io
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  
  socket.on('join_room', (userId) => {
    socket.join(userId);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Global Error Handler for Multer / Cloudinary / Express
app.use((err, req, res, next) => {
  console.error('🔥 Global Error Caught:', err);
  if (err && err.message) {
    console.error('Error Message:', err.message);
  } else {
    console.error('Error Stringified:', JSON.stringify(err));
  }
  res.status(500).json({ message: 'Server error', error: err.message || JSON.stringify(err) });
});

// Database and server setup
const PORT = process.env.PORT || 5000;

// Database Sync and Start Server
sequelize.sync({ alter: true }).then(async () => {
  console.log('Database connected and synced with alter');
  
  // Start the cron job for daily market prices
  startMarketPriceCron();
  
  // Force fetch on startup to test API Key
  console.log('Testing Government API Connection...');
  await triggerManualFetch();

  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch((err) => {
  console.error('Database connection error:', err);
});
