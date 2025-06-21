const createOrderSchema = {
  body: {
    type: 'object',
    required: ['customer', 'items', 'totalAmount', 'paymentMethod'],
    properties: {
      customer: {
        type: 'object',
        required: ['name', 'email', 'phone', 'address'],
        properties: {
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string' },
          address: { type: 'string' }
        }
      },
      items: {
        type: 'array',
        items: {
          type: 'object',
          required: ['product', 'quantity', 'price', 'size', 'name'],
          properties: {
            product: { type: 'string' }, // <-- Sửa ở đây, bỏ format: 'objectId'
            quantity: { type: 'integer', minimum: 1 },
            price: { type: 'number', minimum: 0 },
            size: { type: 'string' },
            name: { type: 'string' }
          }
        }
      },
      totalAmount: { type: 'number', minimum: 0 },
      paymentMethod: {
        type: 'string',
        enum: ['cash', 'credit_card', 'bank_transfer', 'vnpay', 'momo', 'zalopay', 'paypal', 'other'] // Đảm bảo có 'momo'
      },
      notes: { type: 'string' }
    }
  }
};

const updateOrderStatusSchema = {
  body: {
    type: 'object',
    required: ['status'],
    properties: {
      status: {
        type: 'string',
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
      }
    }
  }
};

const updatePaymentStatusSchema = {
  body: {
    type: 'object',
    required: ['paymentStatus'],
    properties: {
      paymentStatus: {
        type: 'string',
        enum: ['pending', 'paid', 'failed', 'refunded']
      }
    }
  }
};

module.exports = {
  createOrderSchema,
  updateOrderStatusSchema,
  updatePaymentStatusSchema
};