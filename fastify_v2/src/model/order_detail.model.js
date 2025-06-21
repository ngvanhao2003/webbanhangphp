const mongoose = require('mongoose');

// Định nghĩa schema cho OrderDetail
const orderDetailSchema = new mongoose.Schema({
  order: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Order', 
    required: true 
  },
  product: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true 
  },
  quantity: { 
    type: Number, 
    required: true, 
    min: 1 
  },
  price: { 
    type: Number, 
    required: true 
  }, // Giá tại thời điểm mua
  name: { 
    type: String, 
    required: true 
  },   // Tên sản phẩm tại thời điểm mua
  subtotal: { 
    type: Number,
    required: true
  },
  size: {  
    type: String,
    required: true  // Có thể thay đổi thành 'false' nếu size là tùy chọn
  },
  paymentMethod: {   
    type: String,
    enum: ['cash', 'momo', 'vnpay', 'credit_card'],
    required: true
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Tạo virtual property 'id' cho _id
orderDetailSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Đảm bảo khi chuyển sang JSON vẫn có trường virtual
orderDetailSchema.set('toJSON', { virtuals: true });

const OrderDetail = mongoose.model('OrderDetail', orderDetailSchema);

module.exports = OrderDetail;
