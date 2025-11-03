const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const couponSchema = new mongoose.Schema(
  {
    uuid: {
      type: String,
      default: () => uuidv4(),
      unique: true,
      immutable: true,
    },

    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },

    type: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: [true, 'Coupon type is required'],
      default: 'percentage',
    },

    discount: {
      type: Number,
      required: [true, 'Discount value is required'],
      min: [1, 'Discount must be at least 1'],
    },

    expirationDate: {
      type: Date,
      required: [true, 'Expiration date is required'],
    },

    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category ID is required'],
    },

    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    usesLeft: {
      type: Number,
      required: [true, 'Number of uses is required'],
      min: [0, 'Uses left cannot be negative'],
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

couponSchema.index({ category_id: 1 });
couponSchema.index({ user_id: 1 });

couponSchema.methods.decrementUse = async function () {
  if (this.usesLeft > 0) {
    this.usesLeft -= 1;
    await this.save();
  }
  return this;
};

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
