const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const orderSchema = new mongoose.Schema(
  {
    uuid: {
      type: String,
      default: () => uuidv4(),
      unique: true,
      immutable: true,
      index: true,
    },

    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    cart_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cart',
      required: true,
    },

    totalPrice: {
      type: Number,
      required: true,
    },

    discountApplied: {
      type: Number,
      default: 0,
    },

    couponCode: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      enum: ['Pending', 'Validated', 'Cancelled'],
      default: 'Pending',
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

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
