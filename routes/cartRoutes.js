const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const cartController = require('../controllers/CartController');
const validator = require('../middlewares/validationMiddleware');
const { cartSchema, UpdateCartItemSchema } = require('../utils/validationSchema');



router.get('/api/carts/:userId', protect, cartController.getCartByUserId);
router.post('/api/carts', protect, cartController.createCart);

router.get('/api/carts/:cartId/items', protect, cartController.getCartItemsByCartId);
router.post('/api/carts/:cartId/items', protect, validator(cartSchema), cartController.addCartItem);
router.put('/api/carts/:cartId/items/:cartItemId', protect, validator(UpdateCartItemSchema), cartController.updateCartItem);
router.delete('/api/carts/:cartId/items/:cartItemId', protect, cartController.deleteCartItem);