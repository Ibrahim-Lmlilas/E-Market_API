const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Role = require('../models/Role');
require('dotenv').config();

const createUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    await User.deleteMany({});

    const roles = await Role.find();

    const findRole = (name) => roles.find((r) => r.name === name)?._id;

    await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@gmail.com',
      password: 'admin@gmail.com',
      role: findRole('ADMIN'),
    });

    await User.create({
      firstName: 'Seller',
      lastName: 'User',
      email: 'seller@gmail.com',
      password: 'seller@gmail.com',
      role: findRole('SELLER'),
    });

    await User.create({
      firstName: 'Regular',
      lastName: 'User',
      email: 'user@gmail.com',
      password: 'user@gmail.com',
      role: findRole('USER'),
    });

    console.log('Users created successfully!');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
};

createUsers();
