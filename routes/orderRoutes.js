const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middlewares/auth');
const orderController = require('../controllers/orderController');
const validator = require('../middlewares/validationMiddleware');
const { orderSchema } = require('../utils/validationSchema');

router.get('/', protect, adminOnly, orderController.getAllOrders);

router.get('/:id', protect, adminOnly, orderController.getOrderById);

router.post(
  '/',
  protect,
  validator.validate(orderSchema),
  orderController.createOrder
);

router.put(
  '/:id',
  protect,
  adminOnly,
  validator.validate(orderSchema),
  orderController.updateOrderStatus
);

router.delete('/:id', protect, adminOnly, orderController.deleteOrder);

module.exports = router;
