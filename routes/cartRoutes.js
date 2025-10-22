const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const cartController = require('../controllers/CartController');
const validator = require('../middlewares/validationMiddleware');
const { cartSchema, UpdateCartItemSchema } = require('../utils/validationSchema');



router.get('/api/v2/carts/:userId', protect, cartController.getCartByUserId);
router.post('/api/v2/carts', protect, cartController.createCart);

router.get('/api/v2/carts/:cartId/items', protect, cartController.getCartItemsByCartId);
router.post('/api/v2/carts/:cartId/items', protect, validator(cartSchema), cartController.addCartItem);
router.put('/api/v2/carts/:cartId/items/:cartItemId', protect, validator(UpdateCartItemSchema), cartController.updateCartItem);
router.delete('/api/v2/carts/:cartId/items/:cartItemId', protect, cartController.deleteCartItem);