const searchProductsSchema = {
  description: 'Search and filter products',
  tags: ['product'],
  summary: 'Search products with filters',
  querystring: {
    type: 'object',
    properties: {
      name: { type: 'string', description: 'Product name to search for' },
      minPrice: { type: 'string', description: 'Minimum price' },
      maxPrice: { type: 'string', description: 'Maximum price' },
      category: { type: 'string', description: 'Category ID' },
      brand: { type: 'string', description: 'Brand ID' },
      size: { type: 'string', description: 'Size value to filter' },
      color: { type: 'string', description: 'Color value to filter' },
      sort: { 
        type: 'string', 
        description: 'Field to sort by with direction (e.g. price:asc, name:desc)'
      },
      page: { type: 'integer', description: 'Page number for pagination', default: 1 },
      limit: { type: 'integer', description: 'Number of items per page', default: 10 }
    }
  },
  response: {
    200: {
      description: 'Successful response',
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { 
          type: 'array',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              name: { type: 'string' },
              description: { type: 'string' },
              detail: { type: 'string' }, // Chi tiết sản phẩm
              price: { type: 'number' },
              stock: { type: 'number' },
              category_id: { type: 'string' },
              brand_id: { type: 'string' },
              size: { type: 'string' }, // Kích thước sản phẩm
              color: { type: 'string' }, // Màu sắc sản phẩm
              colors: { 
                type: 'array', 
                items: { type: 'string' } 
              },
              images: { 
                type: 'array', 
                items: { type: 'string' } 
              },
              variants: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    color: { type: 'string' },
                    size: { type: 'string' },
                    stock: { type: 'number' }
                  }
                }
              },
              status: { type: 'boolean' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' }
            }
          }
        },
        pagination: {
          type: 'object',
          properties: {
            total: { type: 'integer' },
            page: { type: 'integer' },
            limit: { type: 'integer' },
            pages: { type: 'integer' }
          }
        }
      }
    },
    500: {
      description: 'Error response',
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        error: { type: 'string' },
        message: { type: 'string' }
      }
    }
  }
};

module.exports = searchProductsSchema;