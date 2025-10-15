const Request = require('../models/Request');
const User = require('../models/User');
const Role = require('../models/Role');

// User creates role change request (USER -> SELLER)
exports.createRequest = async (req, res) => {
  try {
    const { requestedRoleName } = req.body;

    // Get Role object
    const requestedRole = await Role.findOne({ name: requestedRoleName });
    if (!requestedRole || !requestedRole.isActive || requestedRole.isDeleted) {
      return res.status(400).json({ success: false, message: 'Invalid role request' });
    }

    // Check if user already has pending request
    const existingRequest = await Request.findOne({ user: req.user._id, status: 'PENDING' });
    if (existingRequest) {
      return res.status(400).json({ success: false, message: 'You already have a pending request' });
    }

    const request = await Request.create({
      user: req.user._id,
      currentRole: req.user.role,
      requestedRole: requestedRole._id
    });

    res.status(201).json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin views all requests
exports.getAllRequests = async (req, res) => {
  try {
    const requests = await Request.find()
      .populate('user', 'firstName lastName email role')
      .populate('currentRole', 'name')
      .populate('requestedRole', 'name')
      .populate('handledBy', 'firstName lastName email');

    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin approves request
exports.approveRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

    await request.approve(req.user);

    res.status(200).json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin rejects request
exports.rejectRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

    await request.reject(req.user);

    res.status(200).json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin changes role directly (user <-> seller)
exports.directChangeRole = async (req, res) => {
  try {
    const { newRoleName } = req.body;

    // Get Role object
    const newRole = await Role.findOne({ name: newRoleName });
    if (!newRole || !newRole.isActive || newRole.isDeleted) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const user = await Request.directChangeRole(req.params.id, newRole._id, req.user);

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
