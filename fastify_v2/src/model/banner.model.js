const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },                          // Banner title/name
  image: { 
    type: String, 
    required: true 
  },                         // URL to the banner image
  link_url: { 
    type: String 
  },                         // URL where banner redirects when clicked
  position: { 
    type: Number, 
    required: true, 
    default: 0 
  },                        // Position/order of the banner (for sorting)                      // When the banner stops being displayed
  status: { 
    type: Number, 
    required: true, 
    default: 1 
  },                        // Status (1 - active, 0 - inactive)
  created_at: { 
    type: Date, 
    default: Date.now 
  },                       // Creation timestamp
  updated_at: { 
    type: Date, 
    default: Date.now 
  }                         // Last update timestamp
});

// Create a virtual property 'id' that aliases '_id'
bannerSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Ensure virtual fields are included when converting to JSON
bannerSchema.set('toJSON', {
  virtuals: true,
});

const Banner = mongoose.model('Banner', bannerSchema);

module.exports = Banner;