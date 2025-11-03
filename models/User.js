const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    uuid: {
      type: String,
      default: () => uuidv4(),
      unique: true,
      immutable: true, // Cannot be changed after creation
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      minlength: [2, 'First name must be at least 2 characters long'],
      maxlength: [25, 'First name cannot exceed 25 characters'],
      validate: {
        validator: function (name) {
          return /^[a-zA-ZÀ-ÿ\u0600-\u06FF\s]+$/.test(name);
        },
        message: 'First name can only contain letters and spaces',
      },
    },

    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      minlength: [2, 'Last name must be at least 2 characters long'],
      maxlength: [25, 'Last name cannot exceed 25 characters'],
      validate: {
        validator: function (name) {
          return /^[a-zA-ZÀ-ÿ\u0600-\u06FF\s]+$/.test(name);
        },
        message: 'Last name can only contain letters and spaces',
      },
    },

    nickname: {
      type: String,
      trim: true,
      minlength: [2, 'Nickname must be at least 2 characters long'],
      maxlength: [20, 'Nickname cannot exceed 20 characters'],
      validate: {
        validator: function (nickname) {
          if (!nickname) return true;
          return /^[a-zA-Z0-9_]+$/.test(nickname);
        },
        message: 'Nickname can only contain letters, numbers and underscore',
      },
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (email) {
          return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);
        },
        message: 'Please provide a valid email address',
      },
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      maxlength: [100, 'Password cannot exceed 100 characters'],
    },

    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
      required: [true, 'User role is required'],
      validate: {
        validator: async function (roleId) {
          const Role = mongoose.model('Role');
          const role = await Role.findById(roleId);
          return role && role.isActive && !role.isDeleted;
        },
        message: 'Please provide a valid active role',
      },
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

// Index for performance (unique already defined in schema)
userSchema.index({ role: 1 });
userSchema.index({ nickname: 1 });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.getFullName = function () {
  return this.firstName + ' ' + this.lastName;
};

userSchema.methods.getDisplayName = function () {
  return this.nickname || this.firstName;
};

userSchema.methods.getInitials = function () {
  return (this.firstName.charAt(0) + this.lastName.charAt(0)).toUpperCase();
};

userSchema.methods.isAdmin = function () {
  // No need to populate again, role is already populated in protect middleware
  return this.role && this.role.name === 'ADMIN';
};

userSchema.methods.softDelete = function () {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

userSchema.statics.findByUuid = function (uuid) {
  return this.findOne({ uuid: uuid });
};

userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email });
};

userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
