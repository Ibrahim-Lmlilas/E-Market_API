const jwt = require('jsonwebtoken');
const User = require('../models/User');
const blacklistedTokens = require('../utils/blacklist');

const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token provided',
      });
    }

    if (blacklistedTokens.has(token)) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, expired token provided',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id)
      .populate('role', 'name')
      .select('-password');

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    next();
  } catch (_) {
    res.status(401).json({
      success: false,
      message: 'Not authorized, token failed',
    });
  }
};

const adminOnly = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
    }

    const isAdmin = req.user.isAdmin();

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.',
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const sellerOrAdminRole = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
    }

    // Check if user is admin
    const isAdmin = req.user.isAdmin();
    if (isAdmin) {
      return next();
    }

    // Check if user has SELLER role
    const isSeller = req.user.role && req.user.role.name === 'SELLER';
    if (isSeller) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied. Only sellers and admins can manage products.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const sellerOrAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
    }

    const Product = require('../models/Product');
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Check if user is admin
    const isAdmin = req.user.isAdmin();
    if (isAdmin) {
      return next();
    }

    // Check if user is the seller of the product
    const isSeller = product.seller.toString() === req.user._id.toString();
    if (isSeller) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only edit your own products.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { protect, adminOnly, sellerOrAdminRole, sellerOrAdmin };
