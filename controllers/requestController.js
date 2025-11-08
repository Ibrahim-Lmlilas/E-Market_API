const Request = require('../models/Request');
const User = require('../models/User');
const Role = require('../models/Role');
const NotificationService = require('../services/NotificationService');

// User creates role change request (USER -> SELLER)
exports.createRequest = async (req, res) => {
  try {
    const { requestedRoleName } = req.body;

    const user = await User.findById(req.user._id).populate('role');
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    const requestedRole = await Role.findOne({ name: requestedRoleName });
    if (!requestedRole || !requestedRole.isActive || requestedRole.isDeleted) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid role request' });
    }

    if (user.role.name === requestedRoleName) {
      return res
        .status(400)
        .json({ success: false, message: 'You already have this role' });
    }

    const existingRequest = await Request.findOne({
      user: user._id,
      status: 'PENDING',
    });
    if (existingRequest) {
      return res
        .status(400)
        .json({
          success: false,
          message: 'You already have a pending request',
        });
    }

    const request = await Request.create({
      user: user._id,
      currentRole: user.role._id,
      requestedRole: requestedRole._id,
    });

    // Notify admins about the new request
    const admins = await User.find({ 'role.name': { $regex: /^admin$/i } });
    for (const admin of admins) {
      await NotificationService.addNotification(
        admin._id,
        `User "${user.firstName} ${user.lastName}" has requested a role change to "${requestedRoleName}".`
      );
    }

    res.status(201).json({ success: true, data: request });
  } catch (error) {
    console.error('Error in createRequest:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin views all requests
exports.getAllRequests = async (req, res) => {
  try {
    const requests = await Request.find({ status: 'PENDING' })
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
    const request = await Request.findById(req.params.id)
      .populate('user')
      .populate('requestedRole');
    if (!request)
      return res
        .status(404)
        .json({ success: false, message: 'Request not found' });

    await request.approve(req.user);
    await request.remove(req.params.id);

    // Notify the user about the approval
    await NotificationService.addNotification(
      request.user._id,
      `Your role change request to "${request.requestedRole.name}" has been approved.`
    );

    res.status(200).json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin rejects request
exports.rejectRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('user')
      .populate('requestedRole');
    if (!request)
      return res
        .status(404)
        .json({ success: false, message: 'Request not found' });

    await request.reject(req.user);
    await request.remove(req.params.id);

    // Notify the user about the rejection
    await NotificationService.addNotification(
      request.user._id,
      `Your role change request to "${request.requestedRole.name}" has been rejected.`
    );

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

    const user = await Request.directChangeRole(
      req.params.id,
      newRole._id,
      req.user
    );

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
