const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const roleSchema = new mongoose.Schema(
  {
    uuid: {
      type: String,
      default: () => uuidv4(),
      unique: true,
      immutable: true,
      index: true,
    },

    name: {
      type: String,
      required: [true, 'Role name is required'],
      unique: true,
      trim: true,
      uppercase: true,
      enum: ['ADMIN', 'USER', 'MODERATOR', 'SUPER_ADMIN', 'SELLER'],
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes already defined as unique in schema fields

roleSchema.methods.softDelete = function () {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

roleSchema.statics.findByUuid = function (uuid) {
  return this.findOne({ uuid: uuid });
};

roleSchema.statics.findByName = function (name) {
  return this.findOne({ name: name });
};

roleSchema.methods.toJSON = function () {
  const role = this.toObject();
  delete role._id;
  return role;
};

const Role = mongoose.model('Role', roleSchema);

module.exports = Role;
