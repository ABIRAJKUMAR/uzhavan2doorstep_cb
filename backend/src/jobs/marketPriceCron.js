import cron from 'node-cron';
import axios from 'axios';
import { MarketPrice } from '../models/index.js';

const fetchDailyMarketPrices = async () => {
  try {
    console.log('Starting Daily Market Price Synchronization...');
    // 1. Define our robust fallback data (so common items always exist)
    const mockData = [
      { commodity: 'Tomato', market: 'Chennai (Koyambedu)', minPrice: 20, maxPrice: 30, modalPrice: 25 },
      { commodity: 'Onion', market: 'Chennai (Koyambedu)', minPrice: 40, maxPrice: 50, modalPrice: 45 },
      { commodity: 'Potato', market: 'Chennai (Koyambedu)', minPrice: 25, maxPrice: 35, modalPrice: 30 },
      { commodity: 'Green Chilli', market: 'Madurai', minPrice: 30, maxPrice: 40, modalPrice: 35 },
      { commodity: 'Carrot', market: 'Ooty', minPrice: 50, maxPrice: 70, modalPrice: 60 },
      { commodity: 'Banana', market: 'Trichy', minPrice: 15, maxPrice: 25, modalPrice: 20 },
      { commodity: 'Rice (Ponni)', market: 'Thanjavur', minPrice: 45, maxPrice: 55, modalPrice: 50 },
      { commodity: 'Apple', market: 'Kashmir/Delhi', minPrice: 120, maxPrice: 150, modalPrice: 135 },
      { commodity: 'Mango', market: 'Salem', minPrice: 60, maxPrice: 100, modalPrice: 80 },
      { commodity: 'Coconut', market: 'Pollachi', minPrice: 12, maxPrice: 20, modalPrice: 15 },
      { commodity: 'Cabbage', market: 'Hosur', minPrice: 10, maxPrice: 20, modalPrice: 15 },
      { commodity: 'Cauliflower', market: 'Hosur', minPrice: 15, maxPrice: 25, modalPrice: 20 },
      { commodity: 'Ginger', market: 'Erode', minPrice: 80, maxPrice: 120, modalPrice: 100 },
      { commodity: 'Garlic', market: 'Ooty', minPrice: 150, maxPrice: 250, modalPrice: 200 },
      { commodity: 'Turmeric', market: 'Erode', minPrice: 70, maxPrice: 100, modalPrice: 85 },
      { commodity: 'Cotton', market: 'Coimbatore', minPrice: 6000, maxPrice: 7500, modalPrice: 6800 },
      { commodity: 'Sugarcane', market: 'Villupuram', minPrice: 2500, maxPrice: 3000, modalPrice: 2800 },
      { commodity: 'Groundnut', market: 'Tiruvannamalai', minPrice: 50, maxPrice: 70, modalPrice: 60 },
      { commodity: 'Black Gram', market: 'Madurai', minPrice: 90, maxPrice: 120, modalPrice: 105 },
      { commodity: 'Wheat', market: 'Local', minPrice: 30, maxPrice: 40, modalPrice: 35 },
      { commodity: 'Papaya', market: 'Theni', minPrice: 15, maxPrice: 25, modalPrice: 20 },
      { commodity: 'Brinjal', market: 'Vellore', minPrice: 20, maxPrice: 40, modalPrice: 30 },
      { commodity: 'Ladies Finger', market: 'Kanchipuram', minPrice: 25, maxPrice: 45, modalPrice: 35 },
      { commodity: 'Drumstick', market: 'Dindigul', minPrice: 40, maxPrice: 80, modalPrice: 60 }
    ];

    let finalMarketData = [...mockData];
    
    // 2. Fetch live data and OVERWRITE mock data if a live price exists
    if (process.env.AGMARKNET_API_KEY) {
      console.log('Fetching live data from data.gov.in (Agmarknet)...');
      try {
        const response = await axios.get(`https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${process.env.AGMARKNET_API_KEY}&format=json&filters[state]=Tamil%20Nadu&limit=1000`);
        
        if (response.data && response.data.records && response.data.records.length > 0) {
          const liveData = response.data.records.map(record => ({
            commodity: record.commodity,
            market: record.market,
            minPrice: parseFloat(record.min_price) / 100,
            maxPrice: parseFloat(record.max_price) / 100,
            modalPrice: parseFloat(record.modal_price) / 100,
          }));

          // Merge: Replace mock items with live items, and add any new live items
          liveData.forEach(liveItem => {
            const existingIndex = finalMarketData.findIndex(mockItem => 
              mockItem.commodity.toLowerCase() === liveItem.commodity.toLowerCase()
            );
            
            if (existingIndex !== -1) {
              finalMarketData[existingIndex] = liveItem; // Overwrite with live price
            } else {
              finalMarketData.push(liveItem); // Add new live commodity
            }
          });
          
          console.log(`Successfully merged ${liveData.length} LIVE market rates!`);
        } else {
          console.log('API returned no records for today. Using fallback data.');
        }
      } catch (apiError) {
        console.error('API Fetch failed, using fallback data:', apiError.message);
      }
    } else {
      console.log('No AGMARKNET_API_KEY found. Using standard fallback data.');
    }

    if (finalMarketData.length > 0) {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      
      // Clear old data for today to prevent duplicates
      await MarketPrice.destroy({ where: { date: today } });

      // Save new data
      const newPrices = finalMarketData.map(item => ({
        ...item,
        date: today
      }));

      await MarketPrice.bulkCreate(newPrices);
      console.log(`Successfully updated ${newPrices.length} market prices for ${today}.`);
    }
  } catch (error) {
    console.error('Error fetching market prices:', error.message);
  }
};

export const startMarketPriceCron = () => {
  // Run every morning at 6:00 AM
  cron.schedule('0 6 * * *', () => {
    fetchDailyMarketPrices();
  });
  
  console.log('Market Price Cron Job initialized (runs at 6 AM daily).');
};

// Expose the fetch function so we can run it manually on startup if the table is empty
export const triggerManualFetch = fetchDailyMarketPrices;
