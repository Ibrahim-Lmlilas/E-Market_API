const CartService = require('../services/CartService');
const CartItemService = require('../services/CartItemService');
const Product = require('../models/Product');
const NotificationService = require('../services/NotificationService');
const mongoose = require('mongoose');
const CartItem = require('../models/cartItem');

class CartController {
  async createCart(req, res) {
    const { userId } = req.body;
    try {
      const exist = await CartService.getCartByUserId(userId);
      if (exist) {
        return res
          .status(400)
          .json({
            success: false,
            message: 'Cart already exists',
            data: exist,
          });
      }

      const cart = await CartService.createCart(userId);

      // Ajouter une notification pour l'utilisateur
      await NotificationService.addNotification(
        userId,
        'A new cart has been created for your account.'
      );

      res
        .status(201)
        .json({
          success: true,
          message: 'Cart created successfully',
          data: cart,
        });
    } catch (_) {
      res.status(500).json({ success: false, message: 'error Creating Cart' });
    }
  }

  async getCartByUserId(req, res) {
    if (
      !req.params.userId ||
      !mongoose.Types.ObjectId.isValid(req.params.userId)
    ) {
      return res.status(400).json({
        success: false,
        message: 'A valid user ID is required',
      });
    }

    const { userId } = req.params;
    try {
      const cart = await CartService.getCartByUserId(userId);
      if (!cart) {
        return res
          .status(404)
          .json({
            success: false,
            message: 'Cart not found, make sure your User ID is valid',
          });
      }
      res.status(200).json({ success: true, data: cart });
    } catch (_) {
      res.status(500).json({ success: false, message: 'error getting cart' });
    }
  }

  async getCartByLoggedInUser(req, res) {
    const userId = req.user._id;

    try {
      const cart = await CartService.getCartByUserId(userId);
      if (!cart) {
        return res
          .status(404)
          .json({
            success: false,
            message: 'Cart not found, make sure your User ID is valid',
          });
      }
      res.status(200).json({ success: true, data: cart });
    } catch (_) {
      res
        .status(500)
        .json({ success: false, message: 'error getting cart', user: userId });
    }
  }

  async clearCart(req, res) {
    if (
      !req.params.cartId ||
      !mongoose.Types.ObjectId.isValid(req.params.cartId)
    ) {
      return res.status(400).json({
        success: false,
        message: 'A valid cart ID is required',
      });
    }

    const { cartId } = req.params;

    try {
      const cart = await CartItemService.clearCart(cartId);
      res
        .status(200)
        .json({
          success: true,
          message: 'Cart cleared successfully',
          data: cart,
        });
    } catch (_) {
      res.status(500).json({ success: false, message: 'error clearing cart' });
    }
  }

  async getCartItemsByCartId(req, res) {
    if (
      !req.params.cartId ||
      !mongoose.Types.ObjectId.isValid(req.params.cartId)
    ) {
      return res.status(400).json({
        success: false,
        message: 'A valid cart ID is required',
      });
    }

    try {
      const { cartId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = 10;
      const skip = (page - 1) * limit;

      const cartItems = await CartItem.find({ cart_id: cartId })
        .populate('product_id', 'title price image')
        .skip(skip)
        .limit(limit);

      const totalItems = await CartItem.countDocuments({ cart_id: cartId });

      res.status(200).json({
        success: true,
        page,
        totalPages: Math.ceil(totalItems / limit),
        count: cartItems.length,
        data: cartItems,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getCartItemsByLoggedUser(req, res) {
    try {
      const userId = req.user._id;
      const page = parseInt(req.query.page) || 1;
      const limit = 10;
      const skip = (page - 1) * limit;

      const cart = await CartService.getCartByUserId(userId);
      if (!cart) {
        return res.status(404).json({
          success: false,
          message: 'Cart not found',
        });
      }

      const cartItems = await CartItem.find({ cart_id: cart._id })
        .populate('product_id', 'title price image')
        .skip(skip)
        .limit(limit);

      const totalItems = await CartItem.countDocuments({ cart_id: cart._id });

      if (cartItems.length === 0) {
        return res.status(200).json({
          success: true,
          message: 'Cart is empty',
          page,
          totalPages: 0,
          data: [],
        });
      }

      res.status(200).json({
        success: true,
        message: 'Cart items retrieved successfully',
        page,
        totalPages: Math.ceil(totalItems / limit),
        count: cartItems.length,
        data: cartItems,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving cart items',
        error: error.message,
      });
    }
  }

  async addCartItem(req, res) {
    const { cart_id, product_id, quantity } = req.body;

    try {
      const cart = await CartService.cartNotOrder(cart_id);
      if (!cart) {
        return res
          .status(404)
          .json({ success: false, message: 'Cart not found' });
      }

      const product = await Product.findById(product_id);
      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: 'Product not found' });
      }

      const existingCartItem = await CartItemService.checkProductExistsInCart(
        cart_id,
        product_id
      );
      let cartItem;

      if (existingCartItem) {
        cartItem = await CartItemService.updateCartItem(
          existingCartItem._id,
          quantity
        );
        await NotificationService.addNotification(
          req.user._id,
          `The quantity of the product "${product.title}" in your cart has been updated.`
        );
      } else {
        const price = product.price * quantity;
        cartItem = await CartItemService.createCartItem(
          cart_id,
          product_id,
          quantity,
          price
        );
        await NotificationService.addNotification(
          req.user._id,
          `The product "${product.title}" has been added to your cart.`
        );
      }

      res.status(201).json({
        success: true,
        message: 'Cart item added/updated successfully',
        data: cartItem,
      });
    } catch (_) {
      res
        .status(500)
        .json({ success: false, message: 'Error adding/updating cart item' });
    }
  }

  async updateCartItem(req, res) {
    const { cartItemId, quantity } = req.body;
    try {
      const cartItem = await CartItemService.updateCartItem(
        cartItemId,
        quantity
      );
      if (cartItem) {
        res
          .status(200)
          .json({
            success: true,
            message: 'Cart item updated successfully',
            data: cartItem,
          });
      } else {
        res
          .status(404)
          .json({ success: false, message: 'Cart item not found' });
      }
    } catch (_) {
      res
        .status(500)
        .json({ success: false, message: 'error updating cart item' });
    }
  }

  async deleteCartItem(req, res) {
    if (
      !req.params.cartItemId ||
      !mongoose.Types.ObjectId.isValid(req.params.cartItemId)
    ) {
      return res.status(400).json({
        success: false,
        message: 'A valid cart item ID is required',
      });
    }

    const { cartItemId } = req.params;
    try {
      const cartItem = await CartItemService.deleteCartItem(cartItemId);
      if (cartItem) {
        res
          .status(200)
          .json({
            success: true,
            message: 'Cart item deleted successfully',
            data: cartItem,
          });
      } else {
        res
          .status(404)
          .json({ success: false, message: 'Cart item not found' });
      }
    } catch (_) {
      res
        .status(500)
        .json({ success: false, message: 'error deleting cart item' });
    }
  }
}

module.exports = new CartController();
