const contactCreateSchema = {
  description: 'Create a new contact',
  tags: ['contact'],
  summary: 'Create a new contact record',
  schema: {
    body: {
      type: 'object',
      required: ['name', 'email', 'subject', 'message'],
      properties: {
        name: { type: 'string', minLength: 2 },
        email: { type: 'string', format: 'email' },
        phone: { type: 'string' },
        subject: { type: 'string', minLength: 3 },
        message: { type: 'string', minLength: 10 }
      },
      additionalProperties: false
    },
    response: {
      201: {
        type: 'object',
        properties: {
          statusCode: { type: 'number' },
          message: { type: 'string' },
          data: {
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
          message: 'Invalid request body'
        }
      }
    }
  }
};

module.exports = contactCreateSchema;