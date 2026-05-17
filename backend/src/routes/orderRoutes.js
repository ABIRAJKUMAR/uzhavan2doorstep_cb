import express from 'express';
import { createOrder, getOrders, updateOrderStatus, createBatchOrder, getTraceabilityInfo } from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, authorize('Retailer', 'Customer'), createOrder);
router.post('/batch', protect, authorize('Retailer', 'Customer'), createBatchOrder);
router.get('/trace/:invoiceId', getTraceabilityInfo); // Public route for QR scanner
router.get('/', protect, getOrders);
router.put('/:id/status', protect, authorize('Farmer', 'Admin'), updateOrderStatus);

export default router;
