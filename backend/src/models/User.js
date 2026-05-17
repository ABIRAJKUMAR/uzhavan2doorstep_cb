import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('Farmer', 'Retailer', 'Customer', 'Admin'),
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
  },
  profileImage: {
    type: DataTypes.STRING,
  },
  // Farmer specific fields
  village: DataTypes.STRING,
  district: DataTypes.STRING,
  state: DataTypes.STRING,
  farmType: DataTypes.STRING,
  bankDetails: DataTypes.JSON,
  // Retailer specific fields
  shopName: DataTypes.STRING,
  gstNumber: DataTypes.STRING,
  location: DataTypes.STRING,
});

export default User;
