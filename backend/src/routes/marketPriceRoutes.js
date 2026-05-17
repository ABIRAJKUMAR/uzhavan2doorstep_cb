import express from 'express';
import { MarketPrice } from '../models/index.js';

const router = express.Router();

// GET all latest market prices
router.get('/', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Try to get today's prices
    let prices = await MarketPrice.findAll({
      where: { date: today },
      order: [['commodity', 'ASC']]
    });

    // If no data for today (e.g. cron hasn't run yet), get latest available date
    if (prices.length === 0) {
      const latestRecord = await MarketPrice.findOne({
        order: [['date', 'DESC']]
      });
      if (latestRecord) {
        prices = await MarketPrice.findAll({
          where: { date: latestRecord.date },
          order: [['commodity', 'ASC']]
        });
      }
    }

    res.json({ success: true, count: prices.length, data: prices });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

export default router;
