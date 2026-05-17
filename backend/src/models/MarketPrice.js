import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const MarketPrice = sequelize.define('MarketPrice', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  commodity: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  market: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  minPrice: {
    type: DataTypes.FLOAT,
  },
  maxPrice: {
    type: DataTypes.FLOAT,
  },
  modalPrice: { // Most common/average price
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  }
});

export default MarketPrice;
