const Cart = require('../models/cart');
const CartItem = require('../models/cartItem');
const Coupon = require('../models/Coupon');
const Product = require('../models/Product');
const Order = require('../models/Order');
const CartService = require('./CartService');
const CouponService = require('./CouponService');

class OrderService {

  // Main entry: validate order (convert cart → order)
  async validateOrder(cartId) {
    const cart = await Cart.findById(cartId).populate({
      path: 'user_id',
      select: '_id'
    });

    if (!cart || cart.type !== 'Cart') {
      throw new Error('Invalid or already validated cart');
    }

    const cartItems = await CartItem.find({ cart_id: cartId }).populate({
      path: 'product_id',
      select: 'price stock category_id'
    });

    if (!cartItems.length) {
      throw new Error('Cart is empty');
    }

    // Step 1: Check stock
    await this.verifyStockAvailability(cartItems);

    // Step 2: Calculate totals and apply coupon
    const { total, discountApplied, couponCode } = await this.calculateTotalWithCoupon(cart);

    // Step 3: Update product stocks
    await this.updateProductStock(cartItems);

    // Step 4: Create order record
    const order = await Order.create({
      user_id: cart.user_id,
      cart_id: cart._id,
      totalPrice: total - discountApplied,
      discountApplied,
      couponCode,
      status: 'Pending'
    });

    // Step 5: Mark cart as finalized (Order)
    cart.type = 'Order';
    await cart.save();

    // Step 6: Create a new empty cart for next use
    await CartService.createCart(cart.user_id);

    return order;
  }

  // Helper: Verify stock
  async verifyStockAvailability(cartItems) {
    for (const item of cartItems) {
      if (item.quantity > item.product_id.stock) {
        throw new Error(`Not enough stock for ${item.product_id.name}`);
      }
    }
  }

  // Helper: Update product stock
  async updateProductStock(cartItems) {
    for (const item of cartItems) {
      const product = item.product_id;
      product.stock -= item.quantity;
      await product.save();
    }
  }

  // Helper: Calculate total and discount
  async calculateTotalWithCoupon(cart) {
    const cartItems = await CartItem.find({ cart_id: cart._id }).populate({
      path: 'product_id',
      select: 'price category_id'
    });

    let total = 0;
    let discountApplied = 0;
    let couponCode = null;

    total = cartItems.reduce((sum, item) => sum + item.product_id.price * item.quantity, 0);

    if (cart.coupon) {
      const coupon = await Coupon.findOne({ code: cart.coupon, isDeleted: false });

      if (coupon) {
        const eligibleItems = cartItems.filter(
          (item) => item.product_id.category_id.toString() === coupon.category_id.toString()
        );

        const eligibleTotal = eligibleItems.reduce(
          (sum, item) => sum + item.product_id.price * item.quantity,
          0
        );

        if (eligibleTotal > 0) {
          if (coupon.type === 'percentage') {
            discountApplied = (eligibleTotal * coupon.discount) / 100;
          } else if (coupon.type === 'fixed') {
            discountApplied = Math.min(coupon.discount, eligibleTotal);
          }

          coupon.decrementUse();
          couponCode = coupon.code;
        }
      }
    }

    return { total, discountApplied, couponCode };
  }

  // Fetch all orders
  async getAllOrders() {
    return Order.find({ isDeleted: false }).populate('user_id', 'name email');
  }

  // Fetch specific order  
  async getOrderById(orderId) {
    return Order.findById(orderId).populate('user_id', 'name email');
  }

  // Soft delete
  async deleteOrder(orderId) {
    const order = await Order.findById(orderId);
    if (!order) throw new Error('Order not found');
    order.isDeleted = true;
    order.deletedAt = new Date();
    await order.save();
    return order;
  }

  async getUserOrders(userId){
    const Orders = await Order.find({ user_id: userId, isDeleted: false }).populate('user_id', 'name email');

    if(Orders.length === 0){
      return false;
    }

    return Orders;
  }

  async updateOrderStatus(orderId, status) {
    const order = await Order.findById(orderId);

    if (!order) {
      return false;
    }

    order.status = status;
    await order.save();
    
    return order;
  }

  async cancelOrder(userId, orderId) {
    
    const order = await Order.findById(orderId);

    if (!order) {
      return false;
    }

    if (order.user_id.toString() !== userId) {
      return false;
    }

    order.status = 'Cancelled';
    await order.save();
    
    return order;
  }
}

module.exports = new OrderService();