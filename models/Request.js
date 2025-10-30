const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const requestSchema = new mongoose.Schema(
  {
    uuid: {
      type: String,
      default: () => uuidv4(),
      unique: true,
      immutable: true,
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    currentRole: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
      required: true,
    },

    requestedRole: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
      required: true,
    },

    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
    },

    handledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // admin li qbel/reject request
    },

    handledAt: {
      type: Date,
      default: null,
    },

    isDirectChange: {
      type: Boolean,
      default: false, // ila admin bddl role direct
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Method to approve request
requestSchema.methods.approve = async function (adminUser) {
  const User = require('./User');

  this.status = 'APPROVED';
  this.handledBy = adminUser._id;
  this.handledAt = new Date();

  const user = await User.findById(this.user);
  if (!user) throw new Error('User not found');

  user.role = this.requestedRole;
  await user.save();

  return this.save();
};

// Method to reject request
requestSchema.methods.reject = async function (adminUser) {
  this.status = 'REJECTED';
  this.handledBy = adminUser._id;
  this.handledAt = new Date();
  return this.save();
};

// Method for admin direct change (without request)
requestSchema.statics.directChangeRole = async function (
  userId,
  newRoleId,
  adminUser
) {
  const User = require('./User');

  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  await this.create({
    user: user._id,
    currentRole: user.role,
    requestedRole: newRoleId,
    status: 'APPROVED',
    handledBy: adminUser._id,
    handledAt: new Date(),
    isDirectChange: true,
  });

  user.role = newRoleId;
  await user.save();
  return user;
};

requestSchema.statics.remove = async function (id) {
  return this.deleteOne({ _id: id });
};

const Request = mongoose.model('Request', requestSchema);
module.exports = Request;
