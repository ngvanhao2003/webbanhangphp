const mongoose = require('mongoose');

// Item trong đơn hàng
const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true }, // Giá tại thời điểm mua
  name: { type: String, required: true },  // Tên sản phẩm tại thời điểm mua
  size: { type: String, required: true }, // Kích thước sản phẩm
});

// Đơn hàng
const orderSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // <-- Liên kết tới User
  customer: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true }
  },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  status: { 
    type: String, 
    required: true, 
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: { 
    type: String, 
    required: true,
    enum: ['cash', 'credit_card', 'bank_transfer', 'momo', 'vnpay']
  },
  paymentStatus: { 
    type: String, 
    required: true,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  shippingMethod: { type: String },
  trackingNumber: { type: String },
  notes: { type: String },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Middleware cập nhật updated_at khi save/update
orderSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});
orderSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updated_at: Date.now() });
  next();
});

// Tạo virtual property 'id' cho _id
orderSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Đảm bảo khi chuyển sang JSON vẫn có trường virtual
orderSchema.set('toJSON', { virtuals: true });

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
