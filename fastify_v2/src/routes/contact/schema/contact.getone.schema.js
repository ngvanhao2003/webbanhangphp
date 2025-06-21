const contactGetOneSchema = {
  description: 'Get contact by ID',
  tags: ['contact'],
  summary: 'Get a single contact by ID',
  schema: {
    params: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string' }
      }
    },
    response: {
      200: {
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
      },
      404: {
        type: 'object',
        properties: {
          statusCode: { type: 'number' },
          error: { type: 'string' },
          message: { type: 'string' }
        },
        example: {
          statusCode: 404,
          error: 'Not Found',
          message: 'Contact not found'
        }
      }
    }
  }
};

module.exports = contactGetOneSchema;