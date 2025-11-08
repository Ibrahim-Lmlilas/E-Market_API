const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middlewares/auth');
const couponController = require('../controllers/couponController');
const validator = require('../middlewares/validationMiddleware');
const { couponSchema, editCouponSchema } = require('../utils/validationSchema');

router.get('/', protect, adminOnly, couponController.getAllCoupons);
router.get('/:id', protect, adminOnly, couponController.getCouponById);

router.post(
  '/',
  protect,
  adminOnly,
  validator.validate(couponSchema),
  couponController.createCoupon
);

router.put(
  '/:id',
  protect,
  adminOnly,
  validator.validate(editCouponSchema),
  couponController.updateCoupon
);

router.delete('/:id', protect, adminOnly, couponController.deleteCoupon);

module.exports = router;
