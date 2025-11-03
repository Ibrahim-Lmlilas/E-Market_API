const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const {
  protect,
  adminOnly,
  sellerOrAdminRole,
  sellerOrAdmin,
} = require('../middlewares/auth');
const validator = require('../middlewares/validationMiddleware');
const { uploadImageMiddleware } = require('../middlewares/upload');
const { productSchema } = require('../utils/validationSchema');
const { cache } = require('../middlewares/CachingMiddleware');

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all published products (Public) with pagination
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category ID
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by product title
 *     responses:
 *       200:
 *         description: List of all published products
 */
router.get('/v1', productController.getAllProducts);

/**
 * @swagger
 * /api/products/admin/all:
 *   get:
 *     summary: Get ALL products including drafts (Admin only) with pagination
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published, inactive, pending_approval]
 *       - in: query
 *         name: includeDeleted
 *         schema:
 *           type: string
 *           enum: [true, false]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of all products (admin view)
 */
router.get(
  '/v1/admin/all',
  protect,
  adminOnly,
  productController.getAllProductsAdmin
);

/**
 * @swagger
 * /api/products/my-products:
 *   get:
 *     summary: Get seller's own products with pagination
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of seller's products
 */
router.get(
  '/v1/my-products',
  protect,
  sellerOrAdminRole,
  productController.getMyProducts
);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product found
 *       404:
 *         description: Product not found
 */
router.get(
  '/v1/:id',
  cache((req) => `product_${req.params.id}`),
  productController.getProductById
);

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product (Seller or Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductInput'
 *     responses:
 *       201:
 *         description: Product created successfully
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
 *                   example: Product created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not seller or admin)
 */
router.post(
  '/v1',
  protect,
  sellerOrAdminRole,
  uploadImageMiddleware,
  validator.validate(productSchema),
  productController.createProduct
);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update product (Seller of the product or Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductInput'
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not the seller or admin)
 *       404:
 *         description: Product not found
 */
router.put(
  '/v1/:id',
  protect,
  sellerOrAdmin,
  uploadImageMiddleware,
  validator.validate(productSchema),
  productController.updateProduct
);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete product (Seller of the product or Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not the seller or admin)
 *       404:
 *         description: Product not found
 */
router.delete(
  '/v1/:id',
  protect,
  sellerOrAdmin,
  productController.deleteProduct
);

router.get('/search/:column/:value', productController.searchProduct);

module.exports = router;
