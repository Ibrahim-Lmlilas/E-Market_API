const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const roleSchema = new mongoose.Schema({
  uuid: {
    type: String,
    default: () => uuidv4(),
    unique: true,
    immutable: true, // cannot be changed after creation
    index: true
  },
  
  name: {
    type: String,
    required: [true, 'Role name is required'],
    unique: true,
    trim: true,
    uppercase: true,
    enum: ['ADMIN', 'USER', 'MODERATOR', 'SUPER_ADMIN']
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

roleSchema.index({ uuid: 1 }, { unique: true });
roleSchema.index({ name: 1 }, { unique: true });

roleSchema.methods.softDelete = function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

//Méthode Statique findByUuid:
roleSchema.statics.findByUuid = function(uuid) {
  return this.findOne({ uuid: uuid });
};

roleSchema.statics.findByName = function(name) {
  return this.findOne({ name: name });
};

roleSchema.methods.toJSON = function() {
  const role = this.toObject();// Convertit en objet JavaScript
  delete role._id;// Supprime l'ID MongoDB
  return role;// Retourne l'objet nettoyé
};

const Role = mongoose.model('Role', roleSchema);

module.exports = Role;