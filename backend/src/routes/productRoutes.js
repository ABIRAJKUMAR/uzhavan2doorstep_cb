import express from 'express';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../controllers/productController.js';
import { protect, authorize } from '../middleware/auth.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

router.get('/', getProducts);
router.post('/', protect, authorize('Farmer'), upload.array('images', 5), createProduct);
router.put('/:id', protect, authorize('Farmer'), updateProduct);
router.delete('/:id', protect, authorize('Farmer'), deleteProduct);

export default router;
