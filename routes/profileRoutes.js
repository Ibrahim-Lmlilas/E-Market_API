const express = require('express');
const router = express.Router();
const productController = require('../controllers/profileController');
const { protect, adminOnly } = require('../middlewares/auth');

module.exports = router;