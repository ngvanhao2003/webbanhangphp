// filepath: /home/hoangsonsdk/Downloads/fastify_v2/src/routes/cart/schema/cart.checkout.schema.js
const checkoutSchema = {
  description: 'Checkout and create order from cart',
  tags: ['cart'],
  summary: 'Convert cart to order and process checkout',
  security: [{ bearerAuth: [] }],
  body: {
    type: 'object',
    required: ['customer', 'paymentMethod'],
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
      paymentMethod: { 
        type: 'string', 
        enum: ['cash', 'credit_card', 'bank_transfer'] 
      },
      shippingMethod: { type: 'string' },
      notes: { type: 'string' }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        order: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            customer: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                email: { type: 'string' },
                phone: { type: 'string' },
                address: { type: 'string' }
              }
            },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  product: { type: 'string' },
                  quantity: { type: 'number' },
                  price: { type: 'number' },
                  name: { type: 'string' }
                }
              }
            },
            totalAmount: { type: 'number' },
            status: { type: 'string' },
            paymentMethod: { type: 'string' },
            paymentStatus: { type: 'string' }
          }
        }
      }
    },
    400: {
      type: 'object',
      properties: {
        statusCode: { type: 'number' },
        error: { type: 'string' },
        message: { type: 'string' }
      }
    },
    401: {
      type: 'object',
      properties: {
        statusCode: { type: 'number' },
        error: { type: 'string' },
        message: { type: 'string' }
      }
    },
    500: {
      type: 'object',
      properties: {
        statusCode: { type: 'number' },
        error: { type: 'string' },
        message: { type: 'string' }
      }
    }
  }
};

module.exports = checkoutSchema;