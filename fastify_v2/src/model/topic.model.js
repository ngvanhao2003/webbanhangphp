const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  slug: { 
    type: String, 
    required: true,
    unique: true 
  },
  content: { 
    type: String,
    required: true
  },
  featuredImage: { 
    type: String 
  },
  author: { 
    type: String,
    required: true
  },
  tags: [{ 
    type: String 
  }],
  category: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category' 
  },
  status: { 
    type: Number, 
    required: true, 
    default: 1 
  }, // 1 - published, 0 - draft
  viewCount: {
    type: Number,
    default: 0
  },
  created_at: { 
    type: Date, 
    default: Date.now 
  },
  updated_at: { 
    type: Date, 
    default: Date.now 
  }
});

// Create a virtual property 'id' that aliases '_id'
topicSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Ensure virtual fields are included when converting to JSON
topicSchema.set('toJSON', {
  virtuals: true,
});

const Topic = mongoose.model('Topic', topicSchema);

module.exports = Topic;