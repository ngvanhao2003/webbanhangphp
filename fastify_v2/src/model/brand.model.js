const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    unique: true 
  },                        // Brand name (e.g., Apple, Samsung)
  slug: { 
    type: String, 
    required: true, 
    unique: true 
  },                        // URL-friendly version of the name
  description: { 
    type: String 
  },                        // Brand description
  logo: { 
    type: String 
  },                        // URL to brand logo image
  website: { 
    type: String 
  },                        // Brand's official website
  country_of_origin: { 
    type: String 
  },                        // Country where the brand originated
  founded_year: { 
    type: Number 
  },                        // Year the brand was founded
  status: { 
    type: Number, 
    required: true, 
    default: 1 
  },                        // Status (1 - active, 0 - inactive)
  created_at: { 
    type: Date, 
    default: Date.now 
  },                        // Creation timestamp
  updated_at: { 
    type: Date, 
    default: Date.now 
  }                         // Last update timestamp
});

// Create a virtual property 'id' that aliases '_id'
brandSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Ensure virtual fields are included when converting to JSON
brandSchema.set('toJSON', {
  virtuals: true,
});

const Brand = mongoose.model('Brand', brandSchema);

module.exports = Brand;