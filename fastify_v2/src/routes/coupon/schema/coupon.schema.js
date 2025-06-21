const couponSchema = {
  // Schema chung cho thông tin coupon
  couponProperties: {
    _id: { type: 'string' },
    code: { type: 'string' },
    type: { type: 'string', enum: ['percentage', 'fixed'] },
    value: { type: 'number' },
    minOrderValue: { type: 'number' },
    maxDiscountValue: { type: ['number', 'null'] },
    startDate: { type: 'string', format: 'date-time' },
    endDate: { type: 'string', format: 'date-time' },
    usageLimit: { type: ['number', 'null'] },
    usedCount: { type: 'number' },
    perUserLimit: { type: 'number' },
    userUsage: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          user_id: { type: 'string' },
          usedCount: { type: 'number' }
        }
      }
    },
    applicableProducts: {
      type: 'array',
      items: { type: 'string' }
    },
    applicableCategories: {
      type: 'array',
      items: { type: 'string' }
    },
    isActive: { type: 'boolean' },
    description: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
  },

  // Schema cho API lấy tất cả mã giảm giá
  getAllCoupons: {
    description: 'Get all coupons',
    tags: ['Coupons'],
    summary: 'Get all coupons with pagination and filters',
    security: [{ bearerAuth: [] }],
    querystring: {
      type: 'object',
      properties: {
        isActive: { type: 'string', description: 'Filter by active status (true/false)' },
        code: { type: 'string', description: 'Filter by coupon code' },
        type: { type: 'string', enum: ['percentage', 'fixed'], description: 'Filter by coupon type' },
        startDate: { type: 'string', format: 'date', description: 'Filter coupons valid after this date' },
        endDate: { type: 'string', format: 'date', description: 'Filter coupons valid before this date' },
        page: { type: 'integer', description: 'Page number', default: 1 },
        limit: { type: 'integer', description: 'Items per page', default: 10 },
        sortField: { type: 'string', description: 'Field to sort by', default: 'createdAt' },
        sortOrder: { type: 'string', enum: ['asc', 'desc'], description: 'Sort direction', default: 'desc' }
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
                code: { type: 'string' },
                type: { type: 'string' },
                value: { type: 'number' },
                minOrderValue: { type: 'number' },
                maxDiscountValue: { type: ['number', 'null'] },
                startDate: { type: 'string', format: 'date-time' },
                endDate: { type: 'string', format: 'date-time' },
                usageLimit: { type: ['number', 'null'] },
                usedCount: { type: 'number' },
                isActive: { type: 'boolean' },
                description: { type: 'string' },
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
      401: {
        type: 'object',
        properties: {
          statusCode: { type: 'number' },
          error: { type: 'string' },
          message: { type: 'string' }
        }
      },
      500: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          error: { type: 'string' },
          message: { type: 'string' }
        }
      }
    }
  },

  // Schema cho API lấy một mã giảm giá theo ID
  getCouponById: {
    description: 'Get a coupon by ID',
    tags: ['Coupons'],
    summary: 'Get details of a specific coupon',
    security: [{ bearerAuth: [] }],
    params: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Coupon ID' }
      },
      required: ['id']
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
              code: { type: 'string' },
              type: { type: 'string' },
              value: { type: 'number' },
              minOrderValue: { type: 'number' },
              maxDiscountValue: { type: ['number', 'null'] },
              startDate: { type: 'string', format: 'date-time' },
              endDate: { type: 'string', format: 'date-time' },
              usageLimit: { type: ['number', 'null'] },
              usedCount: { type: 'number' },
              perUserLimit: { type: 'number' },
              userUsage: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    user_id: { type: 'string' },
                    usedCount: { type: 'number' }
                  }
                }
              },
              applicableProducts: {
                type: 'array',
                items: { type: 'string' }
              },
              applicableCategories: {
                type: 'array',
                items: { type: 'string' }
              },
              isActive: { type: 'boolean' },
              description: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' }
            }
          }
        }
      },
      404: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          error: { type: 'string' },
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

  // Schema cho API tạo mã giảm giá mới
  createCoupon: {
    description: 'Create a new coupon',
    tags: ['Coupons'],
    summary: 'Create a new discount coupon',
    security: [{ bearerAuth: [] }],
    body: {
      type: 'object',
      properties: {
        code: { type: 'string', minLength: 3, maxLength: 20 },
        type: { type: 'string', enum: ['percentage', 'fixed'] },
        value: { type: 'number', minimum: 0 },
        minOrderValue: { type: 'number', minimum: 0 },
        maxDiscountValue: { type: ['number', 'null'], minimum: 0 },
        startDate: { type: 'string', format: 'date-time' },
        endDate: { type: 'string', format: 'date-time' },
        usageLimit: { type: ['number', 'null'], minimum: 1 },
        perUserLimit: { type: 'number', minimum: 1 },
        applicableProducts: {
          type: 'array',
          items: { type: 'string' }
        },
        applicableCategories: {
          type: 'array',
          items: { type: 'string' }
        },
        isActive: { type: 'boolean' },
        description: { type: 'string' }
      },
      required: ['code', 'type', 'value', 'startDate', 'endDate']
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
              code: { type: 'string' },
              type: { type: 'string' },
              value: { type: 'number' },
              minOrderValue: { type: 'number' },
              maxDiscountValue: { type: ['number', 'null'] },
              startDate: { type: 'string', format: 'date-time' },
              endDate: { type: 'string', format: 'date-time' },
              usageLimit: { type: ['number', 'null'] },
              usedCount: { type: 'number' },
              perUserLimit: { type: 'number' },
              applicableProducts: {
                type: 'array',
                items: { type: 'string' }
              },
              applicableCategories: {
                type: 'array',
                items: { type: 'string' }
              },
              isActive: { type: 'boolean' },
              description: { type: 'string' },
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
      401: {
        type: 'object',
        properties: {
          statusCode: { type: 'number' },
          error: { type: 'string' },
          message: { type: 'string' }
        }
      }
    }
  },

  // Schema cho API cập nhật mã giảm giá
  updateCoupon: {
    description: 'Update a coupon',
    tags: ['Coupons'],
    summary: 'Update an existing coupon',
    security: [{ bearerAuth: [] }],
    params: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Coupon ID' }
      },
      required: ['id']
    },
    body: {
      type: 'object',
      properties: {
        code: { type: 'string', minLength: 3, maxLength: 20 },
        type: { type: 'string', enum: ['percentage', 'fixed'] },
        value: { type: 'number', minimum: 0 },
        minOrderValue: { type: 'number', minimum: 0 },
        maxDiscountValue: { type: ['number', 'null'], minimum: 0 },
        startDate: { type: 'string', format: 'date-time' },
        endDate: { type: 'string', format: 'date-time' },
        usageLimit: { type: ['number', 'null'], minimum: 1 },
        perUserLimit: { type: 'number', minimum: 1 },
        applicableProducts: {
          type: 'array',
          items: { type: 'string' }
        },
        applicableCategories: {
          type: 'array',
          items: { type: 'string' }
        },
        isActive: { type: 'boolean' },
        description: { type: 'string' }
      },
      minProperties: 1 // Phải có ít nhất một trường để cập nhật
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
              code: { type: 'string' },
              type: { type: 'string' },
              value: { type: 'number' },
              minOrderValue: { type: 'number' },
              maxDiscountValue: { type: ['number', 'null'] },
              startDate: { type: 'string', format: 'date-time' },
              endDate: { type: 'string', format: 'date-time' },
              usageLimit: { type: ['number', 'null'] },
              usedCount: { type: 'number' },
              perUserLimit: { type: 'number' },
              applicableProducts: {
                type: 'array',
                items: { type: 'string' }
              },
              applicableCategories: {
                type: 'array',
                items: { type: 'string' }
              },
              isActive: { type: 'boolean' },
              description: { type: 'string' },
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
      404: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          error: { type: 'string' },
          message: { type: 'string' }
        }
      }
    }
  },

  // Schema cho API xóa mã giảm giá
  deleteCoupon: {
    description: 'Delete a coupon',
    tags: ['Coupons'],
    summary: 'Delete an existing coupon',
    security: [{ bearerAuth: [] }],
    params: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Coupon ID' }
      },
      required: ['id']
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
      404: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          error: { type: 'string' },
          message: { type: 'string' }
        }
      }
    }
  },

  // Schema cho API kiểm tra tính hợp lệ của mã giảm giá
  validateCoupon: {
    description: 'Validate a coupon code',
    tags: ['Coupons'],
    summary: 'Check if a coupon is valid and calculate discount',
    body: {
      type: 'object',
      properties: {
        code: { type: 'string' },
        orderTotal: { type: 'number', minimum: 0 },
        productIds: { 
          type: 'array',
          items: { type: 'string' }
        }
      },
      required: ['code', 'orderTotal']
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: {
            type: 'object',
            properties: {
              coupon: {
                type: 'object',
                properties: {
                  _id: { type: 'string' },
                  code: { type: 'string' },
                  type: { type: 'string' },
                  value: { type: 'number' },
                  minOrderValue: { type: 'number' },
                  maxDiscountValue: { type: ['number', 'null'] },
                  startDate: { type: 'string', format: 'date-time' },
                  endDate: { type: 'string', format: 'date-time' },
                  isActive: { type: 'boolean' },
                }
              },
              discountValue: { type: 'number' },
              finalAmount: { type: 'number' }
            }
          }
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

  // Schema cho API áp dụng mã giảm giá
  applyCoupon: {
    description: 'Apply a coupon to an order',
    tags: ['Coupons'],
    summary: 'Apply a coupon and update its usage stats',
    security: [{ bearerAuth: [] }],
    body: {
      type: 'object',
      properties: {
        couponId: { type: 'string' }
      },
      required: ['couponId']
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
              code: { type: 'string' },
              usedCount: { type: 'number' },
              userUsage: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    user_id: { type: 'string' },
                    usedCount: { type: 'number' }
                  }
                }
              }
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
      401: {
        type: 'object',
        properties: {
          statusCode: { type: 'number' },
          error: { type: 'string' },
          message: { type: 'string' }
        }
      }
    }
  }
};

module.exports = couponSchema;