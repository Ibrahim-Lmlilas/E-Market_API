const User = require('../models/User');
const Role = require('../models/Role');
const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
   // Add token JWT | 
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

class AuthController {
  
  async register(req, res) {
    try {
      // kanextractiw lastName, email, password
      const { firstName, lastName, email, password } = req.body;
      
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
      
      const userCount = await User.countDocuments();
      const roleName = userCount === 0 ? 'ADMIN' : 'USER';
      
      // kandir retrieve l-role mn db b l-name
      const userRole = await Role.findByName(roleName);
      
      const user = new User({
        firstName,
        lastName,
        email,
        password,
        role: userRole._id
      });
      
      await user.save();
      
      const token = generateToken(user._id);
      
      res.status(201).json({
        success: true,
        message: `User registered as ${roleName}`,
        token: token,
        data: {
          id: user._id,
          uuid: user.uuid,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: roleName
        }
      });
      
    } catch (error) {
      // ila t9at error f ay step kandirw catch w nrdou error 500
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      
      const user = await User.findOne({ email }).populate('role', 'name');
      
      // ila makanch user f db kandir return 401 Unauthorized
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }
      
      const isPasswordCorrect = await user.comparePassword(password);
      
      if (!isPasswordCorrect) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }
      
      const token = generateToken(user._id);
      
      res.status(200).json({
        success: true,
        message: 'Login successful',
        token: token,
        data: {
          id: user._id,
          uuid: user.uuid,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role.name
        }
      });
      
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  

  async logout(req, res) {
    try {
      res.status(200).json({
        success: true,
        message: 'Logged out successfully. Please remove the token from client.' // l client ygla token
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
  
}

module.exports = new AuthController();
