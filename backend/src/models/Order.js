import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  retailerId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  farmerId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  totalAmount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Accepted', 'Packed', 'Shipped', 'Delivered', 'Rejected'),
    defaultValue: 'Pending',
  },
  deliveryAddress: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  orderNumber: {
    type: DataTypes.STRING,
    unique: true,
  }
});

Order.beforeCreate((order) => {
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
  const dateStr = new Date().toISOString().slice(0,10).replace(/-/g, '');
  order.orderNumber = `ORD-${dateStr}-${randomStr}`;
});

export default Order;
