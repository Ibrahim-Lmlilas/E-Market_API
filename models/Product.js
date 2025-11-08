const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const productSchema = new mongoose.Schema(
  {
    uuid: {
      type: String,
      default: () => uuidv4(),
      unique: true,
      immutable: true
    },
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
      minlength: [2, 'Title must be at least 2 characters long'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },

    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters long'],
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },

    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative'],
      validate: {
        validator: function (value) {
          return value > 0;
        },
        message: 'Price must be greater than 0',
      },
    },

    stock: {
      type: Number,
      required: [true, 'Product stock is required'],
      min: [0, 'Stock cannot be negative'],
      validate: {
        validator: Number.isInteger,
        message: 'Stock must be a whole number',
      },
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Product category is required'],
      validate: {
        validator: async function (categoryId) {
          const Category = mongoose.model('Category');
          const category = await Category.findById(categoryId);
          return category && category.isActive && !category.isDeleted;
        },
        message: 'Please provide a valid active category',
      },
    },

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Product must have a seller'],
      validate: {
        validator: async function (sellerId) {
          const User = mongoose.model('User');
          const seller = await User.findById(sellerId);
          return seller && !seller.isDeleted;
        },
        message: 'Please provide a valid seller',
      },
    },

    images: {
      type: [
        {
          url: {
            type: String,
            required: true,
            trim: true,
            validate: {
              validator: function (url) {
                // Accept both uploaded paths (/uploads/...) and external URLs (http://...)
                return /^(\/uploads\/|https?:\/\/).+/i.test(url);
              },
              message: 'Please provide a valid image URL or upload path',
            },
          },
          isMain: {
            type: Boolean,
            default: false,
          },
          filename: String, // For uploaded files
          originalName: String, // Original filename
          size: Number, // File size in bytes
          mimetype: String, // File MIME type
        },
      ],
      required: [true, 'At least one image is required'],
      validate: {
        validator: function (images) {
          // At least 1 image required, max 7 images
          return images && images.length >= 1 && images.length <= 7;
        },
        message: 'Product must have between 1 and 7 images',
      },
    },

    promotion: {
      isActive: {
        type: Boolean,
        default: false,
      },
      discountType: {
        type: String,
        enum: ['percentage', 'fixed'],
        default: 'percentage',
      },
      discountValue: {
        type: Number,
        default: 0,
        min: [0, 'Discount value cannot be negative'],
        validate: {
          validator: function (value) {
            if (this.promotion.discountType === 'percentage') {
              return value >= 0 && value <= 100;
            }
            return value >= 0;
          },
          message: 'Invalid discount value',
        },
      },
      startDate: {
        type: Date,
        default: null,
      },
      endDate: {
        type: Date,
        default: null,
        validate: {
          validator: function (endDate) {
            if (!endDate || !this.promotion.startDate) return true;
            return endDate > this.promotion.startDate;
          },
          message: 'End date must be after start date',
        },
      },
    },

    status: {
      type: String,
      enum: ['draft', 'published', 'inactive', 'pending_approval'],
      default: 'draft',
    },

    isVisible: {
      type: Boolean,
      default: false,
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

// Performance indexes (uuid unique already defined in schema)
productSchema.index({ category: 1 });
productSchema.index({ seller: 1 });
productSchema.index({ status: 1 });
productSchema.index({ isVisible: 1 });
productSchema.index({ price: 1 });
productSchema.index({ 'promotion.isActive': 1 });
productSchema.index({ 'promotion.endDate': 1 });

productSchema.methods.isInStock = function () {
  return this.stock > 0;
};

productSchema.methods.getFormattedPrice = function () {
  return this.price.toFixed(2) + ' DH';
};

productSchema.methods.isOnPromotion = function () {
  if (!this.promotion.isActive) return false;

  const now = new Date();
  const startDate = this.promotion.startDate;
  const endDate = this.promotion.endDate;

  if (startDate && now < startDate) return false;
  if (endDate && now > endDate) return false;

  return true;
};

productSchema.methods.getDiscountAmount = function () {
  if (!this.isOnPromotion()) return 0;

  if (this.promotion.discountType === 'percentage') {
    return (this.price * this.promotion.discountValue) / 100;
  } else {
    return Math.min(this.promotion.discountValue, this.price);
  }
};

productSchema.methods.getFinalPrice = function () {
  return this.price - this.getDiscountAmount();
};

productSchema.methods.getFormattedFinalPrice = function () {
  return this.getFinalPrice().toFixed(2) + ' DH';
};

productSchema.methods.getDiscountPercentage = function () {
  if (!this.isOnPromotion()) return 0;

  if (this.promotion.discountType === 'percentage') {
    return this.promotion.discountValue;
  } else {
    return ((this.getDiscountAmount() / this.price) * 100).toFixed(1);
  }
};

productSchema.methods.setPromotion = function (
  discountType,
  discountValue,
  startDate = null,
  endDate = null
) {
  this.promotion = {
    isActive: true,
    discountType: discountType,
    discountValue: discountValue,
    startDate: startDate,
    endDate: endDate,
  };
  return this.save();
};

productSchema.methods.removePromotion = function () {
  this.promotion.isActive = false;
  return this.save();
};

productSchema.methods.softDelete = function () {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

// Get main image (first image or first marked as main)
productSchema.methods.getMainImage = function () {
  if (!this.images || this.images.length === 0) return null;

  // Find image marked as main
  const mainImage = this.images.find((img) => img.isMain);
  if (mainImage) return mainImage;

  // Return first image as default main
  return this.images[0];
};

// Get full URLs for all images
productSchema.methods.getImageUrls = function () {
  if (!this.images || this.images.length === 0) return [];

  return this.images.map((img) => {
    if (img.url.startsWith('/uploads/')) {
      return `${process.env.BASE_URL || 'http://localhost:3000'}${img.url}`;
    }
    return img.url;
  });
};

// Check if product has images
productSchema.methods.hasImages = function () {
  return this.images && this.images.length > 0;
};

// Simple static methods
productSchema.statics.findByUuid = function (uuid) {
  return this.findOne({ uuid: uuid });
};

productSchema.statics.findByCategory = function (categoryId) {
  return this.find({ category: categoryId });
};

productSchema.statics.findOnPromotion = function () {
  const now = new Date();
  return this.find({
    'promotion.isActive': true,
    $or: [
      { 'promotion.startDate': null },
      { 'promotion.startDate': { $lte: now } },
      { 'promotion.endDate': null },
      { 'promotion.endDate': { $gte: now } },
    ],
    isDeleted: false,
  });
};

productSchema.methods.toJSON = function () {
  const product = this.toObject();

  product.isOnPromotion = this.isOnPromotion();
  if (product.isOnPromotion) {
    product.finalPrice = this.getFinalPrice();
    product.discountAmount = this.getDiscountAmount();
    product.discountPercentage = this.getDiscountPercentage();
    product.formattedFinalPrice = this.getFormattedFinalPrice();
  }

  // Add main image info
  if (this.hasImages()) {
    product.mainImage = this.getMainImage();
    product.imageUrls = this.getImageUrls();
  }

  return product;
};

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
