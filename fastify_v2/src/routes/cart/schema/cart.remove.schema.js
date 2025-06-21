// filepath: /home/hoangsonsdk/Downloads/fastify_v2/src/routes/cart/schema/cart.remove.schema.js
const removeFromCartSchema = {
  description: 'Remove item from cart',
  tags: ['cart'],
  summary: 'Remove a product from the cart',
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['productId'],
    properties: {
      productId: { type: 'string' }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        user: { type: 'string' },
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              product: { type: 'string' },
              name: { type: 'string' },
              quantity: { type: 'number' },
              price: { type: 'number' },
              imageUrl: { type: 'string' }
            }
          }
        },
        totalAmount: { type: 'number' },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' }
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

module.exports = removeFromCartSchema;