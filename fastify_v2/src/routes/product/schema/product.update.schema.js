const updateProductSchema = {
  description: 'Update one product',
  tags: ['product'],
  summary: 'Update one product',
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string', pattern: '^[0-9a-fA-F]{24}$' }
    }
  },
  // Bỏ phần validate body do multipart/form-data không tương thích
  responses: {
    200: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string' },
        detail: { type: 'string' },
        price: { type: 'number' },
        sale_price: { type: 'number' },
        category: { type: 'string' },
        brand: { type: 'string' },
        image: { type: 'string' },
        status: { type: 'number' },
        variants: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              color: { type: 'string' },
              size: { type: 'string' },
              stock: { type: 'number' }
            },
            required: ['color', 'size', 'stock']
          }
        },
        updated_at: { type: 'string', format: 'date-time' }
      }
    },
        400: {
            type: 'object',
            properties: {
                statusCode: { type: 'number' },
                error: { type: 'string' },
                message: { type: 'string' }
            },
            example: {
                statusCode: 400,
                error: 'Bad Request',
                message: 'Invalid query parameters'
            }
        },
        403: {
            type: 'object',
            properties: {
                statusCode: { type: 'number' },
                error: { type: 'string' },
                message: { type: 'string' }
            },
            example: {
                statusCode: 403,
                error: 'Forbidden',
                message: 'Access denied'
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
                message: 'Internal server error'
            }
        }
    }
};

module.exports = updateProductSchema;
