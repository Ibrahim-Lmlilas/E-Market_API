const User = require('../models/User');
const Role = require('../models/Role');
const mongoose = require('mongoose');

class UserController {
  // Get all users
  async getAllUsers(req, res) {
    try {
      const users = await User.find()
        .populate('role', 'name')
        .select('-password');

      res.status(200).json({
        success: true,
        count: users.length,
        data: users,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message,
      });
    }
  }

  // Get user by ID
  async getUserById(req, res) {
    if (!req.params.id || !mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'A valid user ID is required',
      });
    }

    try {
      const user = await User.findById(req.params.id)
        .populate('role', 'name')
        .select('-password');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message,
      });
    }
  }

  // Create new user
  async createUser(req, res) {
    try {
      const { firstName, lastName, email, password, phoneNumber } = req.body;

      // Check if email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists',
        });
      }

      // Get default role (USER)
      const userRole = await Role.findByName('USER');
      if (!userRole) {
        return res.status(500).json({
          success: false,
          message: 'Default role not found. Please run setup-roles script.',
        });
      }

      // Create new user
      const user = new User({
        firstName,
        lastName,
        email,
        password,
        phoneNumber,
        role: userRole._id,
      });

      await user.save();

      // Remove password from response
      const userResponse = user.toObject();
      delete userResponse.password;

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: userResponse,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message,
      });
    }
  }

  // Update user
  async updateUser(req, res) {
    try {
      const { firstName, lastName, email, phoneNumber } = req.body;

      if (!req.params.id || !mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
          success: false,
          message: 'A valid user ID is required',
        });
      }

      // Check if email exists for another user
      if (email) {
        const existingUser = await User.findOne({
          email,
          _id: { $ne: req.params.id },
        });

        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: 'Email already exists',
          });
        }
      }

      const user = await User.findByIdAndUpdate(
        req.params.id,
        { firstName, lastName, email, phoneNumber },
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: user,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message,
      });
    }
  }

  // Delete user
  async deleteUser(req, res) {
    if (!req.params.id || !mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'A valid user ID is required',
      });
    }

    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      await user.deleteOne();

      res.status(200).json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message,
      });
    }
  }
}

module.exports = new UserController();
