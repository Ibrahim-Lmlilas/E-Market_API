const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const { protect, adminOnly } = require('../middlewares/auth');

// ----------------------------
// User routes
// ----------------------------

/**
 * @swagger
 * /api/request/:
 */

// User creates a role change request (USER -> SELLER)
router.post('/request-role-change', protect, requestController.createRequest);

// ----------------------------
// Admin routes
// ----------------------------

// Admin views all role change requests
router.get('/', protect, adminOnly, requestController.getAllRequests);

// Admin approves a request
router.post('/:id/approve', protect, adminOnly, requestController.approveRequest);

// Admin rejects a request
router.post('/:id/reject', protect, adminOnly, requestController.rejectRequest);

// Admin changes role directly (user <-> seller)
router.post('/:id/change-role', protect, adminOnly, requestController.directChangeRole);

module.exports = router;
