// filepath: /home/hoangsonsdk/Downloads/fastify_v2/src/routes/cart/schema/cart.getall.schema.js
const getCartSchema = {
  description: 'Get user cart',
  tags: ['cart'],
  summary: 'Get the current user\'s shopping cart',
  security: [{ bearerAuth: [] }],
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
      },
      example: {
        statusCode: 401,
        error: 'Unauthorized',
        message: 'No token provided'
      }
    },
    500: {
      type: 'object',
      properties: {
        statusCode: { type: 'number' },
        error: { type: 'string' },
        message: { type: 'string' }
      },
      example: {
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'An unexpected error occurred'
      }
    }
  }
};

module.exports = getCartSchema;