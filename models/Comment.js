const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    commentaire: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

//
commentSchema.index({ user_id: 1, product_id: 1 }, { unique: true });
commentSchema.index({ product_id: 1 });
commentSchema.index({ user_id: 1 });


module.exports = mongoose.model('Comment', commentSchema);
