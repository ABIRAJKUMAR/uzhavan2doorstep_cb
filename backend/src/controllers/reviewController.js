import { Review, User } from '../models/index.js';

export const addReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;
    
    // Check if user has already reviewed
    const existingReview = await Review.findOne({
      where: { productId, userId: req.user.id }
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    const review = await Review.create({
      rating,
      comment,
      productId,
      userId: req.user.id
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    
    const reviews = await Review.findAll({
      where: { productId },
      include: [
        { model: User, as: 'reviewer', attributes: ['name', 'role'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
