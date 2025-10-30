const User = require('../models/User');
const bcrypt = require('bcryptjs');
class ProfileController {
  async editProfile(req, res) {
    try {
      const { firstName, lastName, nickname, email } = req.body;

      const user = await User.findById(req.user._id);

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: 'User not found' });
      }

      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      if (nickname) user.nickname = nickname;
      if (email) user.email = email;
      const updatedUser = await user.save();

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully ',
        user: {
          id: updatedUser._id,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          nickname: updatedUser.nickname,
          email: updatedUser.email,
        },
      });
    } catch (error) {
      console.error(' Error updating profile:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Server Error',
      });
    }
  }

  async changePassword(req, res) {
    try {
      const { oldPassword, newPassword, confirmPassword } = req.body;

      if (!oldPassword || !newPassword || !confirmPassword) {
        return res
          .status(400)
          .json({
            success: false,
            message: 'Please provide old, new, and confirm password',
          });
      }

      if (newPassword !== confirmPassword) {
        return res
          .status(400)
          .json({
            success: false,
            message: 'New password and confirm password do not match',
          });
      }

      const user = await User.findById(req.user._id);
      if (!user)
        return res
          .status(404)
          .json({ success: false, message: 'User not found' });

      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res
          .status(401)
          .json({ success: false, message: 'Old password is incorrect' });
      }

      user.password = newPassword;

      await user.save();

      return res
        .status(200)
        .json({ success: true, message: 'Password updated successfully ✅' });
    } catch (error) {
      console.error('Error changing password:', error);
      return res
        .status(500)
        .json({ success: false, message: error.message || 'Server Error' });
    }
  }

  async getProfile(req, res) {
    try {
      const user = await User.findById(req.user._id).populate('role', 'name');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Profile fetched successfully ✅',
        user: {
          id: user._id,
          uuid: user.uuid,
          firstName: user.firstName,
          lastName: user.lastName,
          nickname: user.nickname,
          email: user.email,
          role: user.role?.name,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Server Error',
      });
    }
  }
}

module.exports = ProfileController;
