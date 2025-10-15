const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
require('dotenv').config();

const createProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const count = await Product.countDocuments();
    if (count > 0) {
      console.log('🛒 Products already exist');
      return;
    }

    const categories = await Category.find();
    if (categories.length === 0) {
      console.log('⚠️ No categories found. Please run createCategories.js first.');
      return;
    }

    const getCategoryId = (title) =>
      categories.find((c) => c.title === title)?._id;

    const products = [
      {
        title: 'Adjustable Dumbbell Set',
        description:
          'Durable dumbbell set perfect for home workouts and strength training.',
        price: 899,
        stock: 50,
        category: getCategoryId('Fitness Equipment'),
        imageUrl: 'https://example.com/images/dumbbells.jpg',
      },
      {
        title: 'Whey Protein Isolate',
        description:
          'High-quality protein powder to support muscle growth and recovery.',
        price: 499,
        stock: 100,
        category: getCategoryId('Nutrition & Supplements'),
        imageUrl: 'https://example.com/images/protein.jpg',
        promotion: {
          isActive: true,
          discountType: 'percentage',
          discountValue: 15,
        },
      },
      {
        title: 'Compression T-shirt',
        description:
          'Lightweight and breathable activewear for intense training sessions.',
        price: 199,
        stock: 75,
        category: getCategoryId('Activewear'),
        imageUrl: 'https://example.com/images/shirt.jpg',
      },
      {
        title: 'Resistance Bands Set',
        description:
          'Set of 5 high-quality resistance bands with different tension levels.',
        price: 129,
        stock: 150,
        category: getCategoryId('Accessories'),
        imageUrl: 'https://example.com/images/bands.jpg',
      },
    ];

    await Product.insertMany(products);
    console.log('✅ Products created successfully!');
  } catch (error) {
    console.error('❌ Error creating products:', error.message);
  } finally {
    await mongoose.connection.close();
  }
};

createProducts();
