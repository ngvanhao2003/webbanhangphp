const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PaymentSchema = new Schema({
  order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'VND', enum: ['VND', 'USD', 'EUR'] },
  payment_method: {
    type: String, required: true,
    enum: ['cash', 'credit_card', 'bank_transfer', 'vnpay', 'momo', 'zalopay', 'paypal', 'other']
  },
  payment_status: {
    type: String, required: true,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  transaction_id: { type: String },
  transaction_data: { type: Schema.Types.Mixed },
  payment_date: { type: Date, default: Date.now },
  refund_data: {
    refund_amount: { type: Number, min: 0 },
    refund_reason: { type: String },
    refund_date: { type: Date },
    refund_transaction_id: { type: String }
  },
  note: { type: String },
  vnpay: {
    vnp_TxnRef: { type: String },
    vnp_ResponseCode: { type: String },
    vnp_TransactionNo: { type: String },
    vnp_SecureHash: { type: String },
    vnp_BankCode: { type: String },
    vnp_CardType: { type: String },
    vnp_PayDate: { type: String },
    vnp_OrderInfo: { type: String },
    vnp_Amount: { type: Number },
    vnp_Raw: { type: Schema.Types.Mixed }
  }
}, {
  timestamps: true,
  versionKey: false
});

// Index
PaymentSchema.index({ order_id: 1 });
PaymentSchema.index({ user_id: 1 });
PaymentSchema.index({ payment_status: 1 });
PaymentSchema.index({ payment_method: 1 });
PaymentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Payment', PaymentSchema);
