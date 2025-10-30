const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
const User = require('../models/User');
require('dotenv').config();

const createProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    await Product.deleteMany({});

    const categories = await Category.find();
    if (categories.length === 0) {
      console.log(
        '⚠️ No categories found. Please run createCategories.js first.'
      );
      return;
    }

    const getCategoryId = (title) =>
      categories.find((c) => c.title === title)?._id;

    const seller = await User.findOne({ email: 'seller@gmail.com' });
    if (!seller) {
      console.log('⚠️ No seller found. Please run createUsers.js first.');
      return;
    }

    const products = [
      {
        title: 'Adjustable Dumbbell Set',
        description:
          'Durable dumbbell set perfect for home workouts and strength training.',
        seller: seller._id,
        price: 899,
        stock: 50,
        category: getCategoryId('Fitness Equipment'),
        images: [
          {
            url: 'https://example.com/images/bands.jpg',
            isMain: true,
          },
        ],
      },
      {
        title: 'Whey Protein Isolate',
        description:
          'High-quality protein powder to support muscle growth and recovery.',
        seller: seller._id,
        price: 499,
        stock: 100,
        category: getCategoryId('Nutrition & Supplements'),
        images: [
          {
            url: 'https://example.com/images/bands.jpg',
            isMain: true,
          },
        ],
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
        seller: seller._id,
        price: 199,
        stock: 75,
        category: getCategoryId('Activewear'),
        images: [
          {
            url: 'https://example.com/images/bands.jpg',
            isMain: true,
          },
        ],
      },
      {
        title: 'Resistance Bands Set',
        description:
          'Set of 5 high-quality resistance bands with different tension levels.',
        seller: seller._id,
        price: 129,
        stock: 150,
        category: getCategoryId('Accessories'),
        images: [
          {
            url: 'https://example.com/images/bands.jpg',
            isMain: true,
          },
        ],
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
