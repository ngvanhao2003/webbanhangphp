module.exports = {
  contactCreateSchema: {
    schema: {
      body: {
        type: 'object',
        required: ['name', 'email', 'subject', 'message'],
        properties: {
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string' },
          subject: { type: 'string' },
          message: { type: 'string' }
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
            createdAt: { type: 'string' },
            updatedAt: { type: 'string' }
          }
        }
      }
    }
  },
  contactGetAllSchema: {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          status: { type: 'string' },
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' }
        }
      },
      response: {
        200: {
          type: 'array',
          items: { type: 'object' }
        }
      }
    }
  },
  contactGetOneSchema: {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      },
      response: {
        200: { type: 'object' }
      }
    }
  },
  contactUpdateStatusSchema: {
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
          status: { type: 'string', enum: ['new', 'read', 'replied', 'archived'] }
        }
      },
      response: {
        200: { type: 'object' }
      }
    }
  },
  contactDeleteSchema: {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      },
      response: {
        200: { type: 'object' }
      }
    }
  },
  contactStatsSchema: {
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
        }
      }
    }
  }
};
