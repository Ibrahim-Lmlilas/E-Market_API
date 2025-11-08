const mongoose = require('mongoose');
require('dotenv').config();

const clearDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    await mongoose.connection.dropDatabase();

    console.log('Database cleared successfully!');
  } catch (error) {
    console.error('Error clearing database:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('Connection closed.');
  }
};

clearDatabase();
