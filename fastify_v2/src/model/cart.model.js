// filepath: /home/hoangsonsdk/Downloads/fastify_v2/src/model/cart.model.js
const mongoose = require('mongoose');

// Schema for cart items - products added to cart
const cartItemSchema = new mongoose.Schema({
  product: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true 
  },
  quantity: { 
    type: Number, 
    required: true, 
    min: 1,
    default: 1
  },
  name: { type: String, required: true },   // Product name for quick reference
  price: { type: Number, required: true },  // Current price when added
  imageUrl: { type: String }                // Product image
});

// Main cart schema
const cartSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  totalAmount: { 
    type: Number, 
    default: 0 
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Create a virtual property 'id' that aliases '_id'
cartSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Ensure virtual fields are included when converting to JSON
cartSchema.set('toJSON', {
  virtuals: true
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;