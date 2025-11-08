const mongoose = require('mongoose');
const Category = require('../models/Category');
require('dotenv').config();

const createCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const categories = [
      { title: 'Fitness Equipment' },
      { title: 'Nutrition & Supplements' },
      { title: 'Activewear' },
      { title: 'Accessories' },
      { title: 'Recovery & Wellness' },
    ];

    await Category.deleteMany({});

    for (const categoryData of categories) {
      const category = new Category(categoryData);
      await category.save();
    }

    console.log('Categories created successfully!');
  } catch (error) {
    console.error('Error creating categories:', error.message);
  } finally {
    await mongoose.connection.close();
  }
};

createCategories();
