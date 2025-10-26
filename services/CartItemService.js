const CartItem = require('../models/cartItem');

class CartItemService {
    
    async getCartItemsByCartId(cartId) {
        const cartItems = await CartItem.find({ cart_id: cartId }).populate('product_id');
        if (!cartItems) {
            return false;
        }
        return cartItems;
    }

    async checkProductExistsInCart(cartId, productId) {
        const cartItem = await CartItem.findOne({ cart_id: cartId, product_id: productId });
        return cartItem ? cartItem : false;
    }

    async createCartItem(cart_id, product_id, quantity, price) {
        const cartItem = new CartItem({
            cart_id,
            product_id,
            quantity,
            price
        });
        await cartItem.save();
        return cartItem;
    }

    async updateCartItem(cartItemId, quantity) {
        try {
            const cartItem = await CartItem.findById(cartItemId).populate('product_id');
            if (!cartItem) return null;

            cartItem.quantity = quantity;
            cartItem.price = cartItem.product_id.price * quantity;

            await cartItem.save();
            return cartItem;
        } catch (error) {
            return false;
        }
    }

    async deleteCartItem(cartItemId) {
        try {
            const cartItem = await CartItem.findByIdAndDelete(cartItemId);
            return cartItem;
        } catch (error) {
            return null;
        }
    }

    async clearCart (cartId) {
        try {
            const cartItems = await CartItem.deleteMany({ cart_id: cartId });
            return true;
        } catch (error) {
            return false;
        }
    }
}

module.exports = new CartItemService();