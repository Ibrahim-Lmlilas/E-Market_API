const OrderService = require('../services/OrderService');
const NotificationService = require('../services/NotificationService');
const Order = require('../models/Order');
const mongoose = require('mongoose');

class OrderController {
  // Create new order
  async createOrder(req, res) {
    const { cartId, couponCodes } = req.body;
    const userId = req.user?.id;

    try {
      const order = await OrderService.validateOrder(cartId, couponCodes);

      // Notify the user
      await NotificationService.addNotification(
        userId,
        'Your order has been created successfully.'
      );

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: order,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getAllOrders(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 10;
      const skip = (page - 1) * limit;

      const totalOrders = await Order.countDocuments({ isDeleted: false });
      const orders = await Order.find({ isDeleted: false })
        .populate('user_id', 'name email')
        .populate('cart_id')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      if (!orders || orders.length === 0) {
        return res.status(200).json({
          success: true,
          message: 'No orders found',
          page,
          totalPages: 0,
          data: [],
        });
      }

      res.status(200).json({
        success: true,
        message: 'Orders retrieved successfully',
        page,
        totalPages: Math.ceil(totalOrders / limit),
        count: orders.length,
        data: orders,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Get all orders for a user
  async getUserOrders(req, res) {
    const userId = req.user?.id;

    try {
      const orders = await OrderService.getUserOrders(userId);

      if (!orders) {
        return res
          .status(404)
          .json({ success: false, message: 'Orders not found' });
      }

      res.status(200).json({
        success: true,
        message: 'Orders retrieved successfully',
        data: orders,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Get order by ID
  async getOrderById(req, res) {
    const { id } = req.params;

    if (!req.params.id || !mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'A valid order ID is required',
      });
    }

    try {
      const order = await OrderService.getOrderById(id);

      if (!order) {
        return res
          .status(404)
          .json({ success: false, message: 'Order not found' });
      }

      res.status(200).json({
        success: true,
        message: 'Order retrieved successfully',
        data: order,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Update order status (admin or system)
  async updateOrderStatus(req, res) {
    const { id } = req.params;
    const { status } = req.body;

    if (!req.params.id || !mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'A valid order ID is required',
      });
    }

    try {
      const updatedOrder = await OrderService.updateOrderStatus(id, status);

      if (!updatedOrder) {
        return res
          .status(404)
          .json({
            success: false,
            message: 'Order not found or cannot be updated',
          });
      }

      // Notify the user
      await NotificationService.addNotification(
        updatedOrder.user_id,
        `The status of your order has been updated to: ${status}.`
      );

      res.status(200).json({
        success: true,
        message: 'Order status updated successfully',
        data: updatedOrder,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Cancel order (user)
  async cancelOrder(req, res) {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!req.params.id || !mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'A valid order ID is required',
      });
    }

    try {
      const cancelledOrder = await OrderService.cancelOrder(userId, id);

      if (!cancelledOrder) {
        return res
          .status(404)
          .json({
            success: false,
            message: 'Order not found or cannot be cancelled',
          });
      }

      // Notify the user
      await NotificationService.addNotification(
        userId,
        'Your order has been cancelled successfully.'
      );

      res.status(200).json({
        success: true,
        message: 'Order cancelled successfully',
        data: cancelledOrder,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Delete order (admin)
  async deleteOrder(req, res) {
    const { id } = req.params;

    if (!req.params.id || !mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'A valid order ID is required',
      });
    }

    try {
      const deleted = await OrderService.deleteOrder(id);

      if (!deleted) {
        return res
          .status(404)
          .json({
            success: false,
            message: 'Order not found or already deleted',
          });
      }

      res.status(200).json({
        success: true,
        message: 'Order deleted successfully',
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new OrderController();
