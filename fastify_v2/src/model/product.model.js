const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },                // Tên sản phẩm
  description: { type: String, required: true },         // Mô tả sản phẩm
  detail: { type: String, default: null },                  // Chi tiết sản phẩm (mới thêm)
  price: { type: Number, required: true },               // Giá sản phẩm
  sale_price: { type: Number, default: null },           // Giá khuyến mãi (mới thêm)
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' },
  image: { type: String },
  status: { type: Number, required: true, default: 1 },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  variants: [
    {
      color: { type: String, required: true },
      size: { type: String, required: true },
      stock: { type: Number, required: true, default: 0 }
    }
  ]
});

productSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

productSchema.set('toJSON', { virtuals: true });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
