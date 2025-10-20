const Comment = require('../models/Comment');
const Product = require('../models/Product');

class CommentController {
  
  // 🟢 Create a new comment
  async createComment(req, res) {
    try {
      const { productId, text } = req.body;

      if (!text) {
        return res.status(400).json({ success: false, message: 'Comment text is required' });
      }

      //
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      //
      const existing = await Comment.findOne({ user: req.user._id, product: productId });
      if (existing) {
        return res.status(400).json({ success: false, message: 'You already commented on this product' });
      }

      const comment = await Comment.create({
        user: req.user._id,
        product: productId,
        text,
      });

      res.status(201).json({ success: true, message: 'Comment added successfully', data: comment });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // 🟡 Get all comments for a product
  async getCommentsByProduct(req, res) {
    try {
      const comments = await Comment.find({ product: req.params.productId })
        .populate('user', 'firstName lastName email')
        .sort({ createdAt: -1 });

      res.status(200).json({ success: true, count: comments.length, data: comments });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // 🔵 Update user comment
  async updateComment(req, res) {
    try {
      const comment = await Comment.findById(req.params.id);

      if (!comment) {
        return res.status(404).json({ success: false, message: 'Comment not found' });
      }

      // 
      if (comment.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'You are not authorized to edit this comment' });
      }

      comment.text = req.body.text || comment.text;
      await comment.save();

      res.status(200).json({ success: true, message: 'Comment updated successfully', data: comment });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // 🔴 Delete comment (User or Admin)
  async deleteComment(req, res) {
    try {
      const comment = await Comment.findById(req.params.id);

      if (!comment) {
        return res.status(404).json({ success: false, message: 'Comment not found' });
      }

      // 
      if (
        comment.user.toString() !== req.user._id.toString() &&
        req.user.role.name !== 'admin'
      ) {
        return res.status(403).json({ success: false, message: 'Not authorized to delete this comment' });
      }

      await comment.deleteOne();
      res.status(200).json({ success: true, message: 'Comment deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // 🟣 Seller: get comments on his products
  async getSellerProductComments(req, res) {
    try {
      // 
      const products = await Product.find({ seller: req.user._id }).select('_id');

      const productIds = products.map((p) => p._id);

      const comments = await Comment.find({ product: { $in: productIds } })
        .populate('user', 'firstName lastName email')
        .populate('product', 'name');

      res.status(200).json({ success: true, count: comments.length, data: comments });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // 🟠 Admin: get all comments
  async getAllComments(req, res) {
    try {
      const comments = await Comment.find()
        .populate('user', 'firstName lastName email')
        .populate('product', 'name');

      res.status(200).json({ success: true, count: comments.length, data: comments });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new CommentController();
