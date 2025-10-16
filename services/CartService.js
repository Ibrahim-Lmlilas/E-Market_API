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

    async applyCoupon(code, cartId) {
        const cart = await Cart.findOne({ _id: cartId });
        if (cart) {
            
            if (cart.coupon) {
                cart.coupon = cart.coupon + ',' + code;
            } else {
                cart.coupon = code;
            }

            await cart.save();
            return cart;
        }
    }

    async getApliedCoupons(cardId) {
        const cart = await Cart.findOne({ _id: cardId, isDeleted: false });
        if(!cart){
            return null;
        }
        let allCoupons = cart.coupon.split(',');
        return allCoupons;
    }
}

module.exports = new CartService();