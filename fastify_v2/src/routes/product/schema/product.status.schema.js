module.exports = {
  description: 'Cập nhật trạng thái sản phẩm',
  tags: ['product'],
  summary: 'Cập nhật status sản phẩm',
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
      status: { type: 'number', enum: [0, 1] }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' }
      }
    },
    400: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        error: { type: 'string' }
      }
    }
  }
};
