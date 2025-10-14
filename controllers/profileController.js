const User = require('../models/User');
const Role = require('../models/Role');
const jwt = require('jsonwebtoken');
class ProfileController {
  async editProfile(req, res) {
    try {
      const { firstName, lastName, nickname, email } = req.body;

      
      const user = await User.findById(req.user._id);

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
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
}
module.exports =  ProfileController;