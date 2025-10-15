const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

// ----------------------------
// User routes
// ----------------------------

// User creates a role change request (USER -> SELLER)
router.post('/request-role-change', protect, requestController.createRequest);

// ----------------------------
// Admin routes
// ----------------------------

// Admin views all role change requests
router.get('/requests', protect, adminOnly, requestController.getAllRequests);

// Admin approves a request
router.post('/requests/:id/approve', protect, adminOnly, requestController.approveRequest);

// Admin rejects a request
router.post('/requests/:id/reject', protect, adminOnly, requestController.rejectRequest);

// Admin changes role directly (user <-> seller)
router.post('/users/:id/change-role', protect, adminOnly, requestController.directChangeRole);

module.exports = router;
