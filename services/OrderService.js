const Cart = require('../models/cart');
const CartItem = require('../models/cartItem');
const Coupon = require('../models/Coupon');
const Order = require('../models/Order');
const CartService = require('./CartService');

class OrderService {
	async validateOrder(cartId, couponCodes) {
		const cart = await Cart.findById(cartId).populate({
			path: 'user_id',
			select: '_id',
		});

		if (!cart || cart.type !== 'Cart') {
			throw new Error('Invalid or already validated cart');
		}

		const cartItems = await CartItem.find({ cart_id: cartId }).populate({
			path: 'product_id',
			select: 'price stock category',
		});

		if (!cartItems.length) {
			throw new Error('Cart is empty');
		}

		await this.verifyStockAvailability(cartItems);

		const { total, discountApplied, couponCodeString} = await this.calculateTotalWithCoupons(cart, couponCodes);

		await this.updateProductStock(cartItems);

		const order = await Order.create({
			user_id: cart.user_id,
			cart_id: cart._id,
			totalPrice: total - discountApplied,
			discountApplied,
			couponCode: couponCodeString || null,
			status: 'Pending',
		});

		cart.type = 'Order';
		cart.coupon = couponCodeString || null;
		cart.price = total - discountApplied;

		await cart.save();

		await CartService.createCart(cart.user_id);

		return order;
	}

	async verifyStockAvailability(cartItems) {
		for (const item of cartItems) {
			if (item.quantity > item.product_id.stock) {
				throw new Error(`Not enough stock for ${item.product_id.name}`);
			}
		}
	}

	async updateProductStock(cartItems) {
		for (const item of cartItems) {
			const product = item.product_id;
			product.stock -= item.quantity;
			await product.save();
		}
	}

	async calculateTotalWithCoupons(cart, couponsCodes) {
		
		const cartItems = await CartItem.find({ cart_id: cart._id }).populate({
			path: 'product_id',
			select: 'price stock category',
		});		
		
		if (!cartItems.length) return { total: 0, discountApplied: 0, couponCodes: [] };

		let total = 0;
		let discountApplied = 0;
		let appliedCoupons = [];

		for (const code of couponsCodes) {

			
			const coupon = await Coupon.findOne({ code: code.trim(), isDeleted: false });
			
			if (!coupon) continue;

			appliedCoupons.push(coupon.code);			

			// Apply coupon to eligible items
			for (const item of cartItems) {

				if (item.product_id.category && item.product_id.category.toString() === coupon.category_id.toString()) {

					let originalPrice = item.product_id.price;

					let discountedPrice;
					if (coupon.type === 'percentage') {
						discountedPrice = originalPrice * (1 - coupon.discount / 100);
					} else {
						discountedPrice = Math.max(originalPrice - coupon.discount, 0);
					}

					// Update the CartItem price
					item.price = Math.round(discountedPrice); // optional rounding
					await item.save();

					discountApplied += originalPrice - item.price;

					// Decrement coupon usage
					await coupon.decrementUse();
				}
			}
		}

		// Calculate total based on updated prices
		total = cartItems.reduce((sum, item) => sum + item.price , 0);

		return { total, discountApplied, couponCodeString: appliedCoupons.join(',') };
	}


	async getOrderById(orderId) {
		return Order.findById(orderId).populate('user_id', 'name email');
	}

	async deleteOrder(orderId) {
		const order = await Order.findById(orderId);
		if (!order) throw new Error('Order not found');
		order.isDeleted = true;
		order.deletedAt = new Date();
		await order.save();
		return order;
	}

	async getUserOrders(userId) {
		const Orders = await Order.find({
			user_id: userId,
			isDeleted: false,
		}).populate('user_id', 'name email');

		if (Orders.length === 0) {
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
