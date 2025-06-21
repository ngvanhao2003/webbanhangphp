const contactGetAllSchema = {
  description: 'Get all contacts',
  tags: ['contact'],
  summary: 'Get all contacts',
  schema: {
    querystring: {
      type: 'object',
      properties: {
        status: { 
          type: 'string',
          enum: ['new', 'read', 'replied', 'archived']
        },
        startDate: { type: 'string', format: 'date' },
        endDate: { type: 'string', format: 'date' }
      }
    },
    response: {
      200: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
            subject: { type: 'string' },
            message: { type: 'string' },
            status: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        }
      },
      400: {
        type: 'object',
        properties: {
          statusCode: {type: 'number'},
          error: {type: 'string'},
          message: {type: 'string'}
        },
        example: {
          statusCode: 400,
          error: 'Bad Request',
          message: 'Invalid query parameters'
        }
      }
    }
  }
};

module.exports = contactGetAllSchema;