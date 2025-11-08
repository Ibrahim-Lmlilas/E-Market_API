const CouponService = require('../services/couponService');
const Coupon = require('../models/Coupon');
const NotificationService = require('../services/NotificationService');
const mongoose = require('mongoose');

class CouponController {
  async createCoupon(req, res) {
    const {
      code,
      type,
      discount,
      expirationDate,
      category_id,
      user_id,
      usesLeft,
    } = req.body;

    if (type !== 'fixed' && type !== 'percentage') {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Invalid discount type, must be either 'fixed' or 'percentage'",
        });
    }

    if (type == 'percentage' && discount > 100) {
      return res
        .status(400)
        .json({
          success: false,
          message: 'Invalid discount value, must be below 100%',
        });
    }

    try {
      const newCoupon = await CouponService.createCoupon({
        code,
        type,
        discount,
        expirationDate,
        category_id,
        user_id,
        usesLeft,
      });

      // Ajouter une notification pour l'utilisateur associé au coupon
      if (user_id) {
        await NotificationService.addNotification(
          user_id,
          `A new coupon "${code}" has been created for you.`
        );
      }

      res
        .status(201)
        .json({
          success: true,
          message: 'Coupon created successfully',
          data: newCoupon,
        });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getAllCoupons(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 10;
      const skip = (page - 1) * limit;

      const totalCoupons = await Coupon.countDocuments({ isDeleted: false });
      const coupons = await Coupon.find({ isDeleted: false })
        .populate('category_id', 'title')
        .populate('user_id', 'name email')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      if (!coupons || coupons.length === 0) {
        return res.status(200).json({
          success: true,
          message: 'No coupons found',
          page,
          totalPages: 0,
          data: [],
        });
      }

      res.status(200).json({
        success: true,
        message: 'Coupons retrieved successfully',
        page,
        totalPages: Math.ceil(totalCoupons / limit),
        count: coupons.length,
        data: coupons,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getCouponById(req, res) {
    const { id } = req.params;

    if (!req.params.id || !mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'A valid coupon ID is required',
      });
    }

    try {
      const coupon = await CouponService.getCouponById(id);
      if (!coupon) {
        res.status(404).json({ success: false, message: 'Coupon not found' });
      }
      res.status(200).json({ success: true, data: coupon });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async updateCoupon(req, res) {
    const { id } = req.params;
    const data = req.body;

    if (!req.params.id || !mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'A valid coupon ID is required',
      });
    }

    try {
      const updatedCoupon = await CouponService.updateCoupon(id, data);
      res
        .status(200)
        .json({
          success: true,
          message: 'Coupon updated successfully',
          data: updatedCoupon,
        });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async deleteCoupon(req, res) {
    const { id } = req.params;

    if (!req.params.id || !mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'A valid coupon ID is required',
      });
    }

    try {
      const deletedCoupon = await CouponService.deleteCoupon(id);
      res
        .status(200)
        .json({
          success: true,
          message: 'Coupon deleted successfully',
          data: deletedCoupon,
        });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new CouponController();
