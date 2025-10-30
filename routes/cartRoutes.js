const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const cartController = require('../controllers/CartController');
const validator = require('../middlewares/validationMiddleware');
const {
  CartItemSchema,
  UpdateCartItemSchema,
} = require('../utils/validationSchema');

//cart routes
router.get('/user/:userId', protect, cartController.getCartByUserId);
router.get('/me', protect, cartController.getCartByLoggedInUser);
router.post('/', protect, cartController.createCart);
router.delete('/user/:cartId', protect, cartController.clearCart);

// Cart item routes
router.get('/mycart/items', protect, cartController.getCartItemsByLoggedUser);
router.post(
  '/mycart/items',
  protect,
  validator.validate(CartItemSchema),
  cartController.addCartItem
);

router.get('/user/:cartId/items', protect, cartController.getCartItemsByCartId);

router.put(
  '/user/:cartId/items/:cartItemId',
  protect,
  validator.validate(UpdateCartItemSchema),
  cartController.updateCartItem
);
router.delete(
  '/user/:cartId/items/:cartItemId',
  protect,
  cartController.deleteCartItem
);

module.exports = router;
