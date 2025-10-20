const mongoose = require('mongoose');
const Role = require('../models/Role');
require('dotenv').config();


const createRoles = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Check if roles exist
    const count = await Role.countDocuments();
    if (count > 0) {
      console.log('Roles already exist');
      return;
    }
    
    await Role.create({ name: 'USER' });
    await Role.create({ name: 'ADMIN' });
    await Role.create({ name: 'SELLER' });
    await Role.create({ name: 'MODERATOR' });
    await Role.create({ name: 'SUPER_ADMIN' });

    console.log('✅ Roles created successfully!');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
};

createRoles();