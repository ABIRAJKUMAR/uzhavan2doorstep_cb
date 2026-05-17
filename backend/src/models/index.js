import User from './User.js';
import Product from './Product.js';
import Order from './Order.js';
import MarketPrice from './MarketPrice.js';

User.hasMany(Product, { foreignKey: 'farmerId' });
Product.belongsTo(User, { foreignKey: 'farmerId', as: 'farmer' });

User.hasMany(Order, { foreignKey: 'farmerId', as: 'farmerOrders' });
User.hasMany(Order, { foreignKey: 'retailerId', as: 'retailerOrders' });

Order.belongsTo(User, { foreignKey: 'farmerId', as: 'farmer' });
Order.belongsTo(User, { foreignKey: 'retailerId', as: 'retailer' });
Order.belongsTo(Product, { foreignKey: 'productId' });

export { User, Product, Order, MarketPrice };
