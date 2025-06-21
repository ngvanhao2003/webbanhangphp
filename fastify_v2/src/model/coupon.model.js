const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['percentage', 'fixed'],
    default: 'percentage'
  },
  value: {
    type: Number,
    required: true
  },
  minOrderValue: {
    type: Number,
    default: 0
  },
  maxDiscountValue: {
    type: Number,
    default: null
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  usageLimit: {
    type: Number,
    default: null
  },
  usedCount: {
    type: Number,
    default: 0
  },
  perUserLimit: {
    type: Number,
    default: 1
  },
  userUsage: [{
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    usedCount: {
      type: Number,
      default: 1
    }
  }],
  applicableProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  applicableCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Tạo index cho các trường thường dùng để truy vấn
couponSchema.index({ code: 1 });
couponSchema.index({ isActive: 1 });
couponSchema.index({ startDate: 1, endDate: 1 });

module.exports = mongoose.model('Coupon', couponSchema);