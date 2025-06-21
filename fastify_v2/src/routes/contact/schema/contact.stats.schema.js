const contactStatsSchema = {
  description: 'Get contact statistics',
  tags: ['contact'],
  summary: 'Get statistics for contacts by status',
  schema: {
    response: {
      200: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            count: { type: 'number' }
          }
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
          message: 'Invalid request'
        }
      }
    }
  }
};

module.exports = contactStatsSchema;