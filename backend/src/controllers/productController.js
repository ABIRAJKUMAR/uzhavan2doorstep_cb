import { Product, User } from '../models/index.js';

export const getProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [{ model: User, as: 'farmer', attributes: ['name', 'location', 'profileImage'] }]
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, category, quantity, unit, price, harvestDate, isOrganic, description } = req.body;
    let images = [];
    if (req.files) {
      images = req.files.map(file => file.path);
    }
    
    // Parse isOrganic safely
    const parsedIsOrganic = isOrganic === 'true' || isOrganic === true;

    const product = await Product.create({
      name, category, quantity, unit, price, harvestDate: harvestDate || null, isOrganic: parsedIsOrganic, description, images, farmerId: req.user.id
    });
    res.status(201).json(product);
  } catch (error) {
    console.error('Create Product Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message || error.toString() });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    if (product.farmerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedProduct = await product.update(req.body);
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (product.farmerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await product.destroy();
    res.json({ message: 'Product removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
