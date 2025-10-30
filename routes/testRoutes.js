const express = require('express');
const router = express.Router();
const rateLimiter = require('../middlewares/rateLimiter');

router.get('/', rateLimiter(1, 2), (req, res) => {
  res.json({ message: 'Test route' });
});

module.exports = router;
