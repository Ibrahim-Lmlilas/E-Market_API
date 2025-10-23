const CartService = require('../services/CartService');
const CartItemService = require('../services/CartItemService');
const Product = require('../models/Product');
const User = require('../models/User');

class CartController {
    async createCart(req, res) {
        const { userId } = req.body;
        try {
            const exist = await CartService.getCartByUserId(userId);
            if (exist) {
                return res.status(400).json({ success: false, message: 'Cart already exists', data: exist });
            }

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
            if (!cart) {
                return res.status(404).json({ success: false, message: 'Cart not found, make sure your User ID is valid' });
            }
            res.status(200).json({ success: true, data: cart });
        } catch (error) {
            res.status(500).json({ success: false, message: 'error getting cart' });
        }
    }

    async getCartByLoggedInUser(req, res) {
        const userId = req.user._id;
        
        try {
            const cart = await CartService.getCartByUserId(userId);
            if (!cart) {
                return res.status(404).json({ success: false, message: 'Cart not found, make sure your User ID is valid' });
            }
            res.status(200).json({ success: true, data: cart });
        } catch (error) {
            res.status(500).json({ success: false, message: 'error getting cart', user: userId });
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
            if (!cartItems) {
                return res.status(404).json({ success: false, message: 'Cart is empty or does not exist' });
            }
            res.status(200).json({ success: true, data: cartItems });
        } catch (error) {
            res.status(500).json({ success: false, message: 'error getting cart items' });
        }
    }

    async getCartItemsByLoggedUser(req, res) {
        const userId = req.user._id;
        
        // return res.status(200).json({ success: true, message: 'Cart items retrieved successfully', data: userId });

        try {
            const cart = await CartService.getCartByUserId(userId);
            if (!cart) {
                return res.status(404).json({ success: false, message: 'Cart not found' });
            }
            const cartItems = await CartItemService.getCartItemsByCartId(cart._id);
            if (cartItems.length === 0) {
                return res.status(200).json({ success: true, message: 'Cart is empty' });
            }
            res.status(200).json({ success: true, data: cartItems });
        } catch (error) {
            res.status(500).json({ success: false, message: 'error getting cart items' });
        }
    }

    async addCartItem(req, res) {
        const { cart_id, product_id, quantity } = req.body;

        try {
            const cart = await CartService.cartNotOrder(cart_id);
            if (!cart) {
                return res.status(404).json({ success: false, message: 'Cart not found' });
            }

            const product = await Product.findById(product_id);
            if (!product) {
                return res.status(404).json({ success: false, message: 'Product not found' });
            }

            const existingCartItem = await CartItemService.checkProductExistsInCart(cart_id, product_id);
            let cartItem;

            if (existingCartItem) {
                cartItem = await CartItemService.updateCartItem(existingCartItem._id, quantity);
            } else {
                const price = product.price * quantity;
                cartItem = await CartItemService.createCartItem(cart_id, product_id, quantity, price);
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

    async deleteCartItem(req, res) {
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