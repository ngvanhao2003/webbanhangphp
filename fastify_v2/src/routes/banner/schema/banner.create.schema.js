const createBannerSchema = {
  description: 'Create a new banner with image upload',
  tags: ['banner'],
  summary: 'Create a new banner',
  consumes: ['multipart/form-data'], // <-- Cực kỳ quan trọng
  // body: {
  //   type: 'object',
  //   required: ['title', 'image', 'position', 'status'],
  //   properties: {
  //     title: { type: 'string', description: 'Banner title', minLength: 1 },
  //     link_url: { type: 'string', description: 'Link URL', minLength: 0 },
  //     position: { type: 'number', description: 'Position/order', minimum: 0 },
  //     status: { type: 'number', enum: [0, 1], description: 'Status (1-active, 0-inactive)' },
  //     image: {
  //       type: 'string',
  //       format: 'binary', // <--- BẮT BUỘC để Swagger hiện input file
  //       description: 'Banner image file'
  //     }
  //   },
  //   additionalProperties: false
  // },
  response: {
    201: {
      description: 'Banner created successfully',
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            image: { type: 'string' },
            link_url: { type: 'string' },
            position: { type: 'number' },
            status: { type: 'number' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          },
          required: ['id', 'title', 'image', 'status', 'created_at', 'updated_at']
        }
      },
      required: ['success', 'data']
    },
    400: {
      description: 'Bad Request',
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        error: { type: 'string', example: 'Bad Request' },
        message: { type: 'string', example: 'Missing required fields or invalid input' }
      }
    },
    500: {
      description: 'Internal Server Error',
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 500 },
        error: { type: 'string', example: 'Internal Server Error' },
        message: { type: 'string', example: 'An unexpected error occurred' }
      }
    }
  }
};

module.exports = createBannerSchema;
