const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const CartItem = require('./cartItem');

const cartSchema = new mongoose.Schema(
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
      required: [true, 'User ID is required']
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    coupon: {
      type: String,
      default: null,
    },

    type: {
      type: String,
      enum: ['Cart', 'Order'],
      default: 'Cart',
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

cartSchema.index({ user_id: 1 });

cartSchema.pre('findOneAndDelete', async function (next) {
  const cartId = this.getQuery()['_id'];
  await CartItem.deleteMany({ cart_id: cartId });
  next();
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
