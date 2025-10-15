const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const requestSchema = new mongoose.Schema({
  uuid: {
    type: String,
    default: () => uuidv4(),
    unique: true,
    immutable: true,
    index: true
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  currentRole: {
    type: String,
    required: true,
    enum: ['ADMIN', 'USER', 'MODERATOR', 'SUPER_ADMIN', 'SELLER']
  },

  requestedRole: {
    type: String,
    required: true,
    enum: ['USER', 'SELLER']
  },

  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING'
  },

  handledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },

  handledAt: {
    type: Date,
    default: null
  },

  isDirectChange: {
    type: Boolean,
    default: false
  }

}, {
  timestamps: true,
  versionKey: false
});

requestSchema.methods.approve = async function(adminUser) {
  this.status = 'APPROVED';
  this.handledBy = adminUser._id;
  this.handledAt = new Date();

  const User = require('./User');
  const user = await User.findById(this.user);
  user.role = this.requestedRole;
  await user.save();

  return this.save();
};

requestSchema.methods.reject = async function(adminUser) {
  this.status = 'REJECTED';
  this.handledBy = adminUser._id;
  this.handledAt = new Date();
  return this.save();
};

requestSchema.statics.directChangeRole = async function(userId, newRole, adminUser) {
  const User = require('./User');
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  await this.create({
    user: user._id,
    currentRole: user.role,
    requestedRole: newRole,
    status: 'APPROVED',
    handledBy: adminUser._id,
    handledAt: new Date(),
    isDirectChange: true
  });

  user.role = newRole;
  await user.save();
  return user;
};

const Request = mongoose.model('Request', requestSchema);

module.exports = Request;
