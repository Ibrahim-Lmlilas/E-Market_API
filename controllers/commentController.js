const Comment = require('../models/Comment');
const Product = require('../models/Product');
const redisClient = require('../config/redisClient');
const NotificationService = require('../services/NotificationService');
const mongoose = require('mongoose');

class CommentController {
  //  Create a new comment
  async createComment(req, res) {
    try {
      const { productId, commentaire } = req.body;

      if (!commentaire) {
        return res
          .status(400)
          .json({ success: false, message: 'Comment text is required' });
      }

      const product = await Product.findById(productId);
      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: 'Product not found' });
      }

      const existing = await Comment.findOne({
        user: req.user._id,
        product: productId,
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'You already commented on this product',
        });
      }

      const comment = await Comment.create({
        user_id: req.user._id,
        product_id: productId,
        commentaire,
      });

      // Notify the seller of the product
      if (product.seller) {
        await NotificationService.addNotification(
          product.seller,
          `A new comment has been added to your product: "${product.name}".`
        );
      }

      // Invalidate cache
      await redisClient.del(`comments_product_${productId}`);
      await redisClient.del('comments_all');
      await redisClient.del(`comments_seller_${req.user._id}`);

      res.status(201).json({
        success: true,
        message: 'Comment added successfully',
        data: comment,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  //  Get all comments for a product
  async getCommentsByProduct(req, res) {
    if (
      !req.params.productId ||
      !mongoose.Types.ObjectId.isValid(req.params.productId)
    ) {
      return res.status(400).json({
        success: false,
        message: 'A valid product ID is required',
      });
    }

    try {
      const cacheKey = `comments_product_${req.params.productId}`;
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return res.status(200).json(JSON.parse(cached));
      }

      const comments = await Comment.find({ product: req.params.productId })
        .populate('user', 'firstName lastName email')
        .sort({ createdAt: -1 });
      const response = {
        success: true,
        count: comments.length,
        data: comments,
      };
      // Cache result
      await redisClient.set(cacheKey, JSON.stringify(response));
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  //  Update user comment
  async updateComment(req, res) {
    if (!req.params.id || !mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'A valid comment ID is required',
      });
    }

    try {
      const comment = await Comment.findById(req.params.id);

      if (!comment) {
        return res
          .status(404)
          .json({ success: false, message: 'Comment not found' });
      }

      //
      if (comment.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to edit this comment',
        });
      }

      comment.commentaire = req.body.commentaire || comment.commentaire;
      await comment.save();
      // Invalidate cache
      await redisClient.del(`comments_product_${comment.product}`);
      await redisClient.del('comments_all');
      await redisClient.del(`comments_seller_${req.user._id}`);

      res.status(200).json({
        success: true,
        message: 'Comment updated successfully',
        data: comment,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  //  Delete comment (User or Admin)
  async deleteComment(req, res) {
    if (!req.params.id || !mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'A valid comment ID is required',
      });
    }

    try {
      const comment = await Comment.findById(req.params.id);

      if (!comment) {
        return res
          .status(404)
          .json({ success: false, message: 'Comment not found' });
      }

      //
      if (
        comment.user.toString() !== req.user._id.toString() &&
        req.user.role.name !== 'admin'
      ) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to delete this comment',
        });
      }

      await comment.deleteOne();
      // Invalidate cache
      await redisClient.del(`comments_product_${comment.product}`);
      await redisClient.del('comments_all');
      await redisClient.del(`comments_seller_${req.user._id}`);
      res
        .status(200)
        .json({ success: true, message: 'Comment deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Seller: get comments on his products
  async getSellerProductComments(req, res) {
    try {
      const cacheKey = `comments_seller_${req.user._id}`;
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return res.status(200).json(JSON.parse(cached));
      }
      //
      const products = await Product.find({ seller: req.user._id }).select(
        '_id'
      );

      const productIds = products.map((p) => p._id);

      const comments = await Comment.find({ product: { $in: productIds } })
        .populate('user', 'firstName lastName email')
        .populate('product', 'name');

      const response = {
        success: true,
        count: comments.length,
        data: comments,
      };

      // Cache result
      await redisClient.set(cacheKey, JSON.stringify(response));
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  //  Admin: get all comments
  async getAllComments(req, res) {
    try {
      const cacheKey = 'comments_all';
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return res.status(200).json(JSON.parse(cached));
      }

      const comments = await Comment.find()
        .populate('user', 'firstName lastName email')
        .populate('product', 'name');

      const response = {
        success: true,
        count: comments.length,
        data: comments,
      };

      // Cache result
      await redisClient.set(cacheKey, JSON.stringify(response));

      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new CommentController();
