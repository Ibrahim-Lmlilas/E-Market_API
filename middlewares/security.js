// middlewares/security.js
const helmet = require('helmet');
const cors = require('cors');

const securityMiddleware = (app) => {
  app.use(
    helmet({
      contentSecurityPolicy: false,
    })
  );

  app.use(
    cors({
      origin: process.env.CLIENT_URL || 'http://localhost:3000', // set your frontend URL here
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
    })
  );
};

module.exports = securityMiddleware;
