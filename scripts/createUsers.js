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

    const findRole = (name) => roles.find(r => r.name === name)?._id;

    await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@gmail.com',
      password: await bcrypt.hash('admin@gmail.com', 10),
      role: findRole('ADMIN')
    });

    await User.create({
      firstName: 'Seller',
      lastName: 'User',
      email: 'seller@gmail.com',
      password: await bcrypt.hash('seller@gmail.com', 10),
      role: findRole('SELLER')
    });

    await User.create({
      firstName: 'Regular',
      lastName: 'User',
      email: 'user@gmail.com',
      password: await bcrypt.hash('user@gmail.com', 10),
      role: findRole('USER')
    });

    console.log('Users created successfully!');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
};

createUsers();
