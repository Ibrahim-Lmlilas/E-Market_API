const express = require('express');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const morgan = require('morgan');
require('dotenv').config();
const securityMiddleware = require('./middlewares/security');

const logger = require('./utils/logger');
const ResponseHandler = require('./utils/responseHandler');

const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const profileRoutes = require('./routes/profileRoutes');
const requestRoutes = require('./routes/requestRoutes');
const cartRoutes = require('./routes/cartRoutes');
const couponRoutes = require('./routes/couponRoutes');
const orderRoutes = require('./routes/orderRoutes');
const limitRoutes = require('./routes/testRoutes');
const commentRoutes = require('./routes/commentRoutes');

require('./models/User');
require('./models/Role');
require('./models/Product');
require('./models/Category');

const app = express();
const PORT = process.env.PORT || 3000;

securityMiddleware(app);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(ResponseHandler.logger);

// utilisation morgan avec winston
app.use(
  morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

app.get('/fouad', (req, res) => {
  res.send('Hello Logger!');
  logger.info('Homepage visited');
});

//----------------------redis---------------------------
// const redis = require('redis');

// const redisClient = redis.createClient();

// redisClient.on('error', (err) => console.error('Redis error:', err));

// const connectRedis = async () => {
//   try {
//     await redisClient.connect();
//     console.log(' Connected to Redis');
//   } catch (err) {
//     console.error(' Redis connection error:', err);
//   }
// };

// ---------------------Routes--------------------------
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to E-Market API',
    status: 'Server is running',
    version: '1.0.0',
    documentation: 'http://localhost:3000/api-docs',
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Swagger Documentation
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'E-Market API Documentation',
  })
);

const rateLimiter = require('./middlewares/rateLimiter');

app.use('/api/auth', rateLimiter(5, 15), authRoutes);
app.use('/api/categories', rateLimiter(5, 30), categoryRoutes);
app.use('/api/products', rateLimiter(5, 40), productRoutes);
app.use('/api/profiles', rateLimiter(5, 10), profileRoutes);
app.use('/api/request', rateLimiter(5, 10), requestRoutes);
app.use('/api/v2/carts', rateLimiter(5, 40), cartRoutes);
app.use('/api/v2/coupons', rateLimiter(5, 40), couponRoutes);
app.use('/api/v2/orders', rateLimiter(5, 20), orderRoutes);
app.use('/api/v2/limits', rateLimiter(1, 2), limitRoutes);
app.use('/api/comment', rateLimiter(1, 5), commentRoutes);

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
    const collectionNames = collections.map((c) => c.name);

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
