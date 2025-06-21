// Schema cho API đánh giá sản phẩm
const reviewSchema = {
  // Schema cho API lấy tất cả đánh giá của một sản phẩm
  getProductReviews: {
    description: 'Lấy tất cả đánh giá của một sản phẩm',
    tags: ['Reviews'],
    summary: 'Trả về tất cả đánh giá cho một sản phẩm',
    params: {
      type: 'object',
      properties: {
        productId: { type: 'string', description: 'ID sản phẩm' }
      },
      required: ['productId']
    },
    querystring: {
      type: 'object',
      properties: {
        status: { 
          type: 'string', 
          enum: ['pending', 'approved', 'rejected'],
          description: 'Lọc theo trạng thái đánh giá (chỉ dành cho admin)'
        },
        page: { type: 'integer', description: 'Số trang', default: 1 },
        limit: { type: 'integer', description: 'Số lượng đánh giá mỗi trang', default: 10 }
      }
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                _id: { type: 'string' },
                product_id: { type: 'string' },
                user_id: {
                  type: 'object',
                  properties: {
                    _id: { type: 'string' },
                    username: { type: 'string' },
                    avatar: { type: 'string' }
                  }
                },
                rating: { type: 'number' },
                comment: { type: 'string' },
                status: { type: 'string' },
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
      }
    }
  },

  // Schema cho API tạo đánh giá mới
  createReview: {
    description: 'Tạo đánh giá sản phẩm mới',
    tags: ['Reviews'],
    summary: 'Tạo một đánh giá mới cho sản phẩm',
    security: [{ bearerAuth: [] }],
    body: {
      type: 'object',
      properties: {
        productId: { type: 'string' },
        rating: { type: 'number', minimum: 1, maximum: 5 },
        comment: { type: 'string', minLength: 5 }
      },
      required: ['productId', 'rating', 'comment']
    },
    response: {
      201: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              product_id: { type: 'string' },
              user_id: { type: 'string' },
              rating: { type: 'number' },
              comment: { type: 'string' },
              status: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' }
            }
          },
          message: { type: 'string' }
        }
      },
      400: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          error: { type: 'string' },
          message: { type: 'string' }
        }
      }
    }
  },

  // Schema cho API cập nhật đánh giá
  updateReview: {
    description: 'Cập nhật đánh giá hiện có',
    tags: ['Reviews'],
    summary: 'Cập nhật đánh giá sản phẩm đã tồn tại',
    security: [{ bearerAuth: [] }],
    params: {
      type: 'object',
      properties: {
        reviewId: { type: 'string', description: 'ID đánh giá' }
      },
      required: ['reviewId']
    },
    body: {
      type: 'object',
      properties: {
        rating: { type: 'number', minimum: 1, maximum: 5 },
        comment: { type: 'string', minLength: 5 }
      },
      required: ['rating', 'comment']
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              product_id: { type: 'string' },
              user_id: { type: 'string' },
              rating: { type: 'number' },
              comment: { type: 'string' },
              status: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' }
            }
          },
          message: { type: 'string' }
        }
      },
      400: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          error: { type: 'string' },
          message: { type: 'string' }
        }
      },
      403: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          error: { type: 'string' },
          message: { type: 'string' }
        }
      }
    }
  },

  // Schema cho API xóa đánh giá
  deleteReview: {
    description: 'Xóa đánh giá',
    tags: ['Reviews'],
    summary: 'Xóa một đánh giá sản phẩm',
    security: [{ bearerAuth: [] }],
    params: {
      type: 'object',
      properties: {
        reviewId: { type: 'string', description: 'ID đánh giá' }
      },
      required: ['reviewId']
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' }
        }
      },
      400: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          error: { type: 'string' },
          message: { type: 'string' }
        }
      },
      403: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          error: { type: 'string' },
          message: { type: 'string' }
        }
      }
    }
  },

  // Schema cho API lấy điểm đánh giá trung bình của sản phẩm
  getProductRating: {
    description: 'Lấy điểm đánh giá trung bình cho sản phẩm',
    tags: ['Reviews'],
    summary: 'Lấy điểm đánh giá trung bình và số lượng đánh giá cho sản phẩm',
    params: {
      type: 'object',
      properties: {
        productId: { type: 'string', description: 'ID sản phẩm' }
      },
      required: ['productId']
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: {
            type: 'object',
            properties: {
              averageRating: { type: 'number' },
              count: { type: 'integer' }
            }
          }
        }
      }
    }
  },

  // Schema cho API admin lấy tất cả đánh giá
  getAllReviews: {
    description: 'Lấy tất cả đánh giá (chỉ dành cho admin)',
    tags: ['Reviews'],
    summary: 'API Admin để lấy tất cả đánh giá với các bộ lọc',
    security: [{ bearerAuth: [] }],
    querystring: {
      type: 'object',
      properties: {
        status: { 
          type: 'string', 
          enum: ['pending', 'approved', 'rejected'],
          description: 'Lọc theo trạng thái đánh giá'
        },
        productId: { type: 'string', description: 'Lọc theo ID sản phẩm' },
        userId: { type: 'string', description: 'Lọc theo ID người dùng' },
        page: { type: 'integer', description: 'Số trang', default: 1 },
        limit: { type: 'integer', description: 'Số lượng đánh giá mỗi trang', default: 10 }
      }
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                _id: { type: 'string' },
                product_id: { 
                  type: 'object',
                  properties: {
                    _id: { type: 'string' },
                    name: { type: 'string' },
                    images: { 
                      type: 'array', 
                      items: { type: 'string' } 
                    }
                  }
                },
                user_id: {
                  type: 'object',
                  properties: {
                    _id: { type: 'string' },
                    username: { type: 'string' },
                    avatar: { type: 'string' }
                  }
                },
                rating: { type: 'number' },
                comment: { type: 'string' },
                status: { type: 'string' },
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
      }
    }
  },

  // Schema cho API admin cập nhật trạng thái đánh giá
  updateReviewStatus: {
    description: 'Cập nhật trạng thái đánh giá (chỉ dành cho admin)',
    tags: ['Reviews'],
    summary: 'API Admin để cập nhật trạng thái đánh giá',
    security: [{ bearerAuth: [] }],
    params: {
      type: 'object',
      properties: {
        reviewId: { type: 'string', description: 'ID đánh giá' }
      },
      required: ['reviewId']
    },
    body: {
      type: 'object',
      properties: {
        status: { 
          type: 'string', 
          enum: ['pending', 'approved', 'rejected'],
          description: 'Trạng thái mới cho đánh giá'
        }
      },
      required: ['status']
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              product_id: { type: 'string' },
              user_id: { type: 'string' },
              rating: { type: 'number' },
              comment: { type: 'string' },
              status: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' }
            }
          },
          message: { type: 'string' }
        }
      },
      400: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          error: { type: 'string' },
          message: { type: 'string' }
        }
      }
    }
  }
};

module.exports = reviewSchema;