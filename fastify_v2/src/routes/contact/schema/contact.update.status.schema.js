const contactUpdateStatusSchema = {
  description: 'Update contact status',
  tags: ['contact'],
  summary: 'Update the status of a contact by ID',
  schema: {
    params: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string' }
      }
    },
    body: {
      type: 'object',
      required: ['status'],
      properties: {
        status: { 
          type: 'string',
          enum: ['new', 'read', 'replied', 'archived']
        }
      },
      additionalProperties: false
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
          message: 'Invalid status value'
        }
      }
    }
  }
};

module.exports = contactUpdateStatusSchema;