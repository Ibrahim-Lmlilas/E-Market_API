const CartService = require('../services/CartService');
const CartItemService = require('../services/CartItemService');
const Product = require('../models/Product');

class CartController {
    async createCart(req, res) {
        const { userId } = req.body;
        try {
            const cart = await CartService.createCart(userId);
            res.status(201).json({ success: true, message: 'Cart created successfully', data: cart });
        } catch (error) {
            res.status(500).json({ success: false, message: 'error Creating Cart' });
        }
    }

    async getCartByUserId(req, res) {
        const { userId } = req.params;
        try {
            const cart = await CartService.getCartByUserId(userId);
            res.status(200).json({ success: true, data: cart });
        } catch (error) {
            res.status(500).json({ success: false, message: 'error getting cart' });
        }
    }

    async clearCart(req, res) {
        const { cartId } = req.params;

        try {
            const cart = await CartItemService.clearCart(cartId);
            res.status(200).json({ success: true, message: 'Cart cleared successfully', data: cart });
        } catch (error) {
            res.status(500).json({ success: false, message: 'error clearing cart' });
        }
    }

    // items in cart

    async getCartItemsByCartId(req, res) {
        const { cartId } = req.params;
        try {
            const cartItems = await CartItemService.getCartItemsByCartId(cartId);
            res.status(200).json({ success: true, data: cartItems });
        } catch (error) {
            res.status(500).json({ success: false, message: 'error getting cart items' });
        }
    }

async addCartItem(req, res) {
    const { cartId, productId, quantity } = req.body;
    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        const existingCartItem = await CartItemService.checkProductExistsInCart(cartId, productId);
        let cartItem;

        if (existingCartItem) {
            cartItem = await CartItemService.updateCartItem(existingCartItem._id, quantity);
        } else {
            const price = product.price * quantity;
            cartItem = await CartItemService.createCartItem(cartId, productId, quantity, price);
        }

        res.status(201).json({
            success: true,
            message: 'Cart item added/updated successfully',
            data: cartItem
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error adding/updating cart item' });
    }
}


    async updateCartItem(req, res) {
        const { cartItemId, quantity } = req.body;
        try {
            const cartItem = await CartItemService.updateCartItem(cartItemId, quantity);
            if (cartItem) {
                res.status(200).json({ success: true, message: 'Cart item updated successfully', data: cartItem });
            } else {
                res.status(404).json({ success: false, message: 'Cart item not found' });
            }
        } catch (error) {
            res.status(500).json({ success: false, message: 'error updating cart item' });
        }
    }

    async deleteCartItem (req, res) {
        const { cartItemId } = req.params;
        try {
            const cartItem = await CartItemService.deleteCartItem(cartItemId);
            if (cartItem) {
                res.status(200).json({ success: true, message: 'Cart item deleted successfully', data: cartItem });
            } else {
                res.status(404).json({ success: false, message: 'Cart item not found' });
            }
        } catch (error) {
            res.status(500).json({ success: false, message: 'error deleting cart item' });
        }
    }
}

module.exports = new CartController();