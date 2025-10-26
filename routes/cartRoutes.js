const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const cartController = require('../controllers/CartController');
const validator = require('../middlewares/validationMiddleware');
const { CartItemSchema, UpdateCartItemSchema } = require('../utils/validationSchema');
const { cartSchema } = require('../models/cart');


//cart routes
router.get('/user/:userId', protect, cartController.getCartByUserId);
router.get('/me', protect, cartController.getCartByLoggedInUser)
router.post('/', protect, cartController.createCart);
router.delete('/user/:cartId', protect, cartController.clearCart);

// Cart item routes
router.get('/mycart/items', protect, cartController.getCartItemsByLoggedUser);
router.post('/mycart/items', protect, validator.validate(CartItemSchema), cartController.addCartItem);

router.get('/user/:cartId/items', protect, cartController.getCartItemsByCartId);

router.put('/user/:cartId/items/:cartItemId', protect, validator.validate(UpdateCartItemSchema), cartController.updateCartItem);
router.delete('/user/:cartId/items/:cartItemId', protect, cartController.deleteCartItem);


module.exports = router;
router.get('/api/v2/carts/:userId', protect, cartController.getCartByUserId);
router.post('/api/v2/carts', protect, cartController.createCart);

router.get('/api/v2/carts/:cartId/items', protect, cartController.getCartItemsByCartId);
router.post('/api/v2/carts/:cartId/items', protect, validator.validate(cartSchema), cartController.addCartItem);
router.put('/api/v2/carts/:cartId/items/:cartItemId', protect, validator.validate(UpdateCartItemSchema), cartController.updateCartItem);
router.delete('/api/v2/carts/:cartId/items/:cartItemId', protect, cartController.deleteCartItem);
