const Coupon = require('../models/Coupon');
const CartService = require('./CartService');

class CouponService {
  async createCoupon({
    code,
    type,
    discount,
    expirationDate,
    category_id,
    user_id,
    usesLeft,
  }) {
    const coupon = new Coupon({
      code,
      type,
      discount,
      expirationDate,
      category_id,
      user_id,
      usesLeft,
    });

    await coupon.save();
    return coupon;
  }

  async getAllCoupons() {
    const coupons = await Coupon.find({ isDeleted: false });
    return coupons;
  }

  async getCouponById(couponId) {
    const coupon = await Coupon.findOne({ _id: couponId, isDeleted: false });
    return coupon ? coupon : null;
  }

  async getCouponByCode(code) {
    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isDeleted: false,
    });
    return coupon;
  }

  async deleteCoupon(couponId) {
    const coupon = await Coupon.findById(couponId);
    if (!coupon) return null;

    coupon.isDeleted = true;
    coupon.deletedAt = new Date();
    await coupon.save();
    return coupon;
  }

  async updateCoupon(couponId, data) {
    const coupon = await Coupon.findOne({ _id: couponId, isDeleted: false });

    if (!coupon) return null;

    if (coupon.isDeleted) return null;

    if (data.type) {
      coupon.type = data.type;
      coupon.discount = data.discount;
    }
    if (data.discount) {
      coupon.discount = data.discount;
    }
    if (data.code) {
      coupon.code = data.code;
    }
    if (data.expirationDate) {
      coupon.expirationDate = data.expirationDate;
    }
    if (data.category_id) {
      coupon.category_id = data.category_id;
    }
    if (data.usesLeft !== undefined) {
      coupon.usesLeft = data.usesLeft;
    }
    await coupon.save();
    return coupon;
  }

  async validateCoupon(code, categoryId) {
    const coupon = await this.getCouponByCode(code);

    if (!coupon)
      return {
        valid: false,
        message: 'Coupon not found',
      };

    if (coupon.isDeleted)
      return {
        valid: false,
        message: 'Coupon is deleted',
      };

    if (coupon.usesLeft <= 0)
      return {
        valid: false,
        message: 'Coupon has no remaining uses',
      };

    if (new Date() > new Date(coupon.expirationDate))
      return {
        valid: false,
        message: 'Coupon has expired',
      };

    if (coupon.category_id.toString() !== categoryId.toString()) {
      return {
        valid: false,
        message: 'Coupon not applicable to this category',
      };
    }

    return { valid: true, coupon };
  }

  async decrementCouponUse(couponId) {
    const coupon = await Coupon.findById(couponId);
    if (!coupon) return false;

    if (coupon.usesLeft > 0) {
      coupon.usesLeft -= 1;
      await coupon.save();
      return true;
    }
    return false;
  }

  async applyCoupon(code, cartId, categoryId) {
    const validation = await this.validateCoupon(code, categoryId);
    if (!validation.valid) {
      return null;
    }

    const coupon = validation.coupon;

    const decremented = await this.decrementCouponUse(coupon._id);
    if (!decremented) {
      return { success: false, message: 'Failed to decrement coupon uses' };
    }

    const updatedCart = await CartService.applyCoupon(code, cartId);
    if (!updatedCart) {
      return { success: false, message: 'Failed to apply coupon to cart' };
    }

    return {
      success: true,
      message: 'Coupon applied successfully',
      coupon,
      cart: updatedCart,
    };
  }
}

module.exports = new CouponService();
