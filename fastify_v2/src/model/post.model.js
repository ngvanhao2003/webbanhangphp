const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },                          // Post title
  slug: { 
    type: String, 
    required: true,
    unique: true 
  },                          // URL-friendly version of the title
  content: { 
    type: String,
    required: true
  },                          // Main content of the post
  summary: { 
    type: String 
  },                          // Short description or excerpt
  featured_image: { 
    type: String 
  },                          // URL to the featured image
  author: { 
    type: String,
    required: true
  },                          // Name of the author
  categories: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category' 
  }],                         // Array of category references
  tags: [{ 
    type: String 
  }],                         // Array of tag strings
  status: { 
    type: String, 
    required: true, 
    enum: ['draft', 'published', 'archived'],
    default: 'draft' 
  },                          // Publication status
  view_count: {
    type: Number,
    default: 0
  },                          // Number of post views
  is_featured: {
    type: Boolean,
    default: false
  },                          // Whether post is featured on homepage
  published_at: { 
    type: Date 
  },                         // Date when post was published
  created_at: { 
    type: Date, 
    default: Date.now 
  },                         // Creation timestamp
  updated_at: { 
    type: Date, 
    default: Date.now 
  }                          // Last update timestamp
});

// Create a virtual property 'id' that aliases '_id'
postSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Ensure virtual fields are included when converting to JSON
postSchema.set('toJSON', {
  virtuals: true,
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;