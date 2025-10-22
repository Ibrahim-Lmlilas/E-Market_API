const express = require('express');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const morgan = require('morgan');
require('dotenv').config();
const logger = require('./utils/logger');
const ResponseHandler = require('./utils/responseHandler');

const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const profileRoutes = require('./routes/profileRoutes');
const requestRoutes = require('./routes/requestRoutes');
const commentRoutes = require('./routes/commentRoutes');

require('./models/User');
require('./models/Role');
require('./models/Product');
require('./models/Category');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(ResponseHandler.logger);


// utilisation morgan avec winston 
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));


app.get('/fouad', (req, res) => {
  res.send('Hello Logger!');
  logger.info('Homepage visited');
});

// ---------------------Routes--------------------------
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to E-Market API',
    status: 'Server is running',
    version: '1.0.0',
    documentation: 'http://localhost:3000/api-docs'
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'E-Market API Documentation'
}));

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/request', requestRoutes);
app.use('/api/comment', commentRoutes);

// in case route not found
app.use(ResponseHandler.notFound);

// // in case of a server error
app.use(ResponseHandler.errorHandler);


//----------------------------------------------------------

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    const requiredCollections = ['users', 'roles', 'products', 'categories'];
    
    for (const collectionName of requiredCollections) {
      if (!collectionNames.includes(collectionName)) {
        await db.createCollection(collectionName);
        console.log(`📦 Created collection: ${collectionName}`);
      }
    }
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
  });
};

startServer();

module.exports = app;
