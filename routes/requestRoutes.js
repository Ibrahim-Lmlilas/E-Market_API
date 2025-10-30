const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const { protect, adminOnly } = require('../middlewares/auth');

/**
 * @swagger
 * tags:
 *   name: Requests
 *   description: Role change requests management (User ↔ Seller)
 */

/**
 * @swagger
 * /api/request/request-role-change:
 *   post:
 *     summary: Create a role change request (User → Seller)
 *     description: Allows a regular user to send a request to become a seller.
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Role change request created successfully.
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
 *                   example: "Your request has been submitted successfully."
 *       400:
 *         description: Request already exists or invalid data.
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Server error.
 */
router.post(
  '/v2/request-role-change',
  protect,
  requestController.createRequest
);

/**
 * @swagger
 * /api/request:
 *   get:
 *     summary: Get all role change requests (Admin only)
 *     description: Allows admin to view all user requests to change roles.
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved all requests.
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
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "6712f9e5c2b7a6c73c51c21a"
 *                       user:
 *                         type: string
 *                         example: "6712f9e5c2b7a6c73c51c210"
 *                       status:
 *                         type: string
 *                         example: "pending"
 *                       createdAt:
 *                         type: string
 *                         example: "2025-10-20T12:00:00Z"
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden (Admin only).
 */
router.get('/v2', protect, adminOnly, requestController.getAllRequests);

/**
 * @swagger
 * /api/request/{id}/approve:
 *   post:
 *     summary: Approve role change request (Admin only)
 *     description: Allows admin to approve a user's role change request.
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Request ID
 *     responses:
 *       200:
 *         description: Request approved successfully.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden (Admin only).
 *       404:
 *         description: Request not found.
 */
router.post(
  '/v2/:id/approve',
  protect,
  adminOnly,
  requestController.approveRequest
);

/**
 * @swagger
 * /api/request/{id}/reject:
 *   post:
 *     summary: Reject role change request (Admin only)
 *     description: Allows admin to reject a user's role change request.
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Request ID
 *     responses:
 *       200:
 *         description: Request rejected successfully.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden (Admin only).
 *       404:
 *         description: Request not found.
 */
router.post(
  '/v2/:id/reject',
  protect,
  adminOnly,
  requestController.rejectRequest
);

/**
 * @swagger
 * /api/request/{id}/change-role:
 *   post:
 *     summary: Change user role directly (Admin only)
 *     description: Allows admin to directly change a user's role (User ↔ Seller) without a request.
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newRole:
 *                 type: string
 *                 enum: [user, seller]
 *                 example: seller
 *     responses:
 *       200:
 *         description: User role changed successfully.
 *       400:
 *         description: Invalid role.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden (Admin only).
 *       404:
 *         description: User not found.
 */
router.post(
  '/v2/:id/change-role',
  protect,
  adminOnly,
  requestController.directChangeRole
);

module.exports = router;
