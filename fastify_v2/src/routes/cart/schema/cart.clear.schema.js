// filepath: /home/hoangsonsdk/Downloads/fastify_v2/src/routes/cart/schema/cart.clear.schema.js
const clearCartSchema = {
  description: 'Clear cart',
  tags: ['cart'],
  summary: 'Remove all items from the cart',
  security: [{ bearerAuth: [] }],
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        cart: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            user: { type: 'string' },
            items: { type: 'array', items: {} },
            totalAmount: { type: 'number' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        }
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

module.exports = clearCartSchema;