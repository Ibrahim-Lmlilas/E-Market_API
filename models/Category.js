const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const categorySchema = new mongoose.Schema({
  uuid: {
    type: String,
    default: () => uuidv4(),
    unique: true,
    immutable: true,
    index: true
  },
  
  title: {
    type: String,
    required: [true, 'Category title is required'],
    unique: true,
    trim: true,
    minlength: [2, 'Category title must be at least 2 characters long'],
    maxlength: [50, 'Category title cannot exceed 50 characters']
  },
  
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  isDeleted: {
    type: Boolean,
    default: false
  },
  
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  versionKey: false
});

categorySchema.index({ uuid: 1 }, { unique: true });
categorySchema.index({ title: 1 }, { unique: true });
categorySchema.index({ slug: 1 }, { unique: true });

categorySchema.pre('save', function(next) {
  if (this.isModified('title')) {
    const randomNumbers = Math.floor(1000000 + Math.random() * 9000000); // 7 chiffres aléatoires
    
    const cleanTitle = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    //"My New Article!" → "my-new-article"
    this.slug = randomNumbers + '-' + cleanTitle;
    //1234567-smartphones
  }
  next();
});

categorySchema.methods.softDelete = function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

categorySchema.statics.findByUuid = function(uuid) {
  return this.findOne({ uuid: uuid });
};

categorySchema.statics.findByTitle = function(title) {
  return this.findOne({ title: title });
};

categorySchema.statics.findBySlug = function(slug) {
  return this.findOne({ slug: slug });
};

categorySchema.statics.findActive = function() {
  return this.find({ isDeleted: false });
};

categorySchema.statics.findByIdActive = function(id) {
  return this.findOne({ _id: id, isDeleted: false });
};

// Simple toJSON
categorySchema.methods.toJSON = function() {
  const category = this.toObject();
  return category;
};

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;