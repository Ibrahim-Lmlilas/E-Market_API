const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { protect } = require('../middlewares/auth');
const { isAdmin, isSeller } = require('../middlewares/roleMiddleware');

// 🧑‍💻 Users
router.post('/', protect, commentController.createComment);
router.get('/product/:productId', commentController.getCommentsByProduct);
router.put('/:id', protect, commentController.updateComment);
router.delete('/:id', protect, commentController.deleteComment);

// 👨‍🏫 Seller
router.get('/seller/my-products', protect, isSeller, commentController.getSellerProductComments);

// 🧑‍⚖️ Admin
router.get('/admin', protect, isAdmin, commentController.getAllComments);

module.exports = router;
