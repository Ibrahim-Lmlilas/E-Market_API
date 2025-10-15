const Cart = require('../models/cart');

class CartService {
    
    async createCart(userId) {
        const cart = new Cart({ user_id: userId });
        await cart.save();
        return cart;
    }

    async getCartByUserId(userId) {
        const cart = await Cart.findOne({ user_id: userId });
        return cart;
    }
}

module.exports = new CartService();