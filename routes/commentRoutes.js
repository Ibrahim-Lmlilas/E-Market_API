const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { protect, adminOnly } = require('../middlewares/auth');
const { isSeller } = require('../middlewares/roleMiddleware');
const validator = require('../middlewares/validationMiddleware');
const { CommentSchema } = require('../utils/validationSchema');
const { cache } = require('../middlewares/CachingMiddleware');
/**
 * @swagger
 * /api/comment:
 *   get:
 *     summary: Get all comments (Admin only)
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all comments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 10
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Comment'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not admin)
 */
router.get(
  '/v2',
  protect,
  adminOnly,
  cache('comments_all'),
  commentController.getAllComments
);

/**
 * @swagger
 * /api/comment/product/{productId}:
 *   get:
 *     summary: Get all comments for a specific product
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Comments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 3
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Comment'
 *       404:
 *         description: Product not found
 */
router.get(
  '/v2/product/:productId',
  cache((req) => `comments_product_${req.params.productId}`),
  commentController.getCommentsByProduct
);

/**
 * @swagger
 * /api/comment:
 *   post:
 *     summary: Create a new comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CommentInput'
 *     responses:
 *       201:
 *         description: Comment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Comment created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Comment'
 *       401:
 *         description: Unauthorized
 */
router.post('/v2', protect, commentController.createComment);

/**
 * @swagger
 * /api/comment/{id}:
 *   put:
 *     summary: Update a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CommentInput'
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Comment not found
 */
router.put(
  '/v2/:id',
  protect,
  validator.validate(CommentSchema),
  commentController.updateComment
);

/**
 * @swagger
 * /api/comment/{id}:
 *   delete:
 *     summary: Delete a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Comment not found
 */
router.delete('/v2/:id', protect, commentController.deleteComment);

/**
 * @swagger
 * /api/comment/seller/my-products:
 *   get:
 *     summary: Get comments for all products owned by the seller
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Seller comments retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not seller)
 */
router.get(
  '/v2/seller/my-products',
  protect,
  isSeller,
  cache((req) => `comments_seller_${req.user._id}`),
  commentController.getSellerProductComments
);

module.exports = router;
