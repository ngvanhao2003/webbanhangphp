/**
 * Schema cho API thanh toán
 */
const paymentSchema = {
  /**
   * Schema chung cho đối tượng payment
   */
  paymentObject: {
    _id: { type: 'string' },
    order_id: { 
      type: 'object', 
      properties: {
        _id: { type: 'string' },
        order_number: { type: 'string' },
        total_amount: { type: 'number' }
      }
    },
    user_id: {
      type: 'object',
      properties: {
        _id: { type: 'string' },
        username: { type: 'string' },
        email: { type: 'string' }
      }
    },
    amount: { type: 'number' },
    currency: { type: 'string' },
    payment_method: { type: 'string' },
    payment_status: { type: 'string' },
    transaction_id: { type: 'string' },
    transaction_data: { type: 'object' },
    payment_date: { type: 'string', format: 'date-time' },
    refund_data: {
      type: 'object',
      properties: {
        refund_amount: { type: 'number' },
        refund_reason: { type: 'string' },
        refund_date: { type: 'string', format: 'date-time' },
        refund_transaction_id: { type: 'string' }
      }
    },
    note: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
  },

  /**
   * Schema cho API tạo giao dịch thanh toán mới
   */
  createPayment: {
    summary: 'Tạo mới giao dịch thanh toán',
    description: 'API tạo mới giao dịch thanh toán',
    tags: ['Payments'],
    security: [{ bearerAuth: [] }],
    body: {
      type: 'object',
      required: ['order_id', 'user_id', 'amount', 'payment_method'],
      properties: {
        order_id: { type: 'string' },
        user_id: { type: 'string' },
        amount: { type: 'number', minimum: 0 },
        currency: { type: 'string', enum: ['VND', 'USD', 'EUR'], default: 'VND' },
        payment_method: { 
          type: 'string', 
          enum: ['cash', 'credit_card', 'bank_transfer', 'vnpay', 'momo', 'zalopay', 'paypal', 'other'] 
        },
        payment_status: { 
          type: 'string', 
          enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
          default: 'pending'
        },
        transaction_id: { type: 'string' },
        transaction_data: { type: 'object' },
        payment_date: { type: 'string', format: 'date-time' },
        note: { type: 'string' }
      }
    },
    response: {
      201: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              order_id: { type: 'string' },
              user_id: { type: 'string' },
              amount: { type: 'number' },
              currency: { type: 'string' },
              payment_method: { type: 'string' },
              payment_status: { type: 'string' },
              transaction_id: { type: 'string' },
              payment_date: { type: 'string', format: 'date-time' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' }
            }
          }
        }
      },
      500: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' }
        }
      }
    }
  },

  /**
   * Schema cho API lấy thông tin giao dịch thanh toán theo ID
   */
  getPaymentById: {
    summary: 'Lấy thông tin giao dịch thanh toán theo ID',
    description: 'API lấy thông tin chi tiết của một giao dịch thanh toán',
    tags: ['Payments'],
    security: [{ bearerAuth: [] }],
    params: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string', description: 'ID của giao dịch thanh toán' }
      }
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
              order_id: { 
                type: 'object', 
                properties: {
                  _id: { type: 'string' },
                  order_number: { type: 'string' },
                  total_amount: { type: 'number' }
                }
              },
              user_id: {
                type: 'object',
                properties: {
                  _id: { type: 'string' },
                  username: { type: 'string' },
                  email: { type: 'string' }
                }
              },
              amount: { type: 'number' },
              currency: { type: 'string' },
              payment_method: { type: 'string' },
              payment_status: { type: 'string' },
              transaction_id: { type: 'string' },
              transaction_data: { type: 'object' },
              payment_date: { type: 'string', format: 'date-time' },
              refund_data: {
                type: 'object',
                properties: {
                  refund_amount: { type: 'number' },
                  refund_reason: { type: 'string' },
                  refund_date: { type: 'string', format: 'date-time' },
                  refund_transaction_id: { type: 'string' }
                }
              },
              note: { type: 'string' },
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
          message: { type: 'string' }
        }
      }
    }
  },

  /**
   * Schema cho API cập nhật trạng thái giao dịch thanh toán
   */
  updatePaymentStatus: {
    summary: 'Cập nhật trạng thái giao dịch thanh toán',
    description: 'API cập nhật trạng thái và thông tin của giao dịch thanh toán',
    tags: ['Payments'],
    security: [{ bearerAuth: [] }],
    params: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string', description: 'ID của giao dịch thanh toán' }
      }
    },
    body: {
      type: 'object',
      required: ['payment_status'],
      properties: {
        payment_status: { 
          type: 'string', 
          enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded']
        },
        transaction_data: { type: 'object' },
        payment_date: { type: 'string', format: 'date-time' },
        note: { type: 'string' }
      }
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              order_id: { type: 'string' },
              payment_status: { type: 'string' },
              updatedAt: { type: 'string', format: 'date-time' }
            }
          }
        }
      },
      500: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' }
        }
      }
    }
  },

  /**
   * Schema cho API xử lý hoàn tiền
   */
  processRefund: {
    summary: 'Xử lý hoàn tiền',
    description: 'API xử lý yêu cầu hoàn tiền cho một giao dịch thanh toán',
    tags: ['Payments'],
    security: [{ bearerAuth: [] }],
    params: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string', description: 'ID của giao dịch thanh toán' }
      }
    },
    body: {
      type: 'object',
      required: ['refund_reason'],
      properties: {
        refund_amount: { type: 'number', minimum: 0 },
        refund_reason: { type: 'string', minLength: 3 },
        refund_transaction_id: { type: 'string' }
      }
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              payment_status: { type: 'string', enum: ['refunded'] },
              refund_data: {
                type: 'object',
                properties: {
                  refund_amount: { type: 'number' },
                  refund_reason: { type: 'string' },
                  refund_date: { type: 'string', format: 'date-time' },
                  refund_transaction_id: { type: 'string' }
                }
              }
            }
          }
        }
      },
      500: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' }
        }
      }
    }
  },

  /**
   * Schema cho API lấy danh sách giao dịch thanh toán
   */
  getAllPayments: {
    summary: 'Lấy danh sách giao dịch thanh toán',
    description: 'API lấy danh sách giao dịch thanh toán với các bộ lọc và phân trang',
    tags: ['Payments'],
    security: [{ bearerAuth: [] }],
    querystring: {
      type: 'object',
      properties: {
        user_id: { type: 'string' },
        order_id: { type: 'string' },
        payment_method: { 
          type: 'string',
          enum: ['cash', 'credit_card', 'bank_transfer', 'vnpay', 'momo', 'zalopay', 'paypal', 'other']
        },
        payment_status: { 
          type: 'string',
          enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded']
        },
        startDate: { type: 'string', format: 'date' },
        endDate: { type: 'string', format: 'date' },
        min_amount: { type: 'number' },
        max_amount: { type: 'number' },
        page: { type: 'integer', minimum: 1, default: 1 },
        limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
        sort_by: { 
          type: 'string', 
          enum: ['createdAt', 'payment_date', 'amount', 'payment_status'],
          default: 'createdAt'
        },
        sort_order: { type: 'string', enum: ['asc', 'desc'], default: 'desc' }
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
                order_id: { 
                  type: 'object', 
                  properties: {
                    _id: { type: 'string' },
                    order_number: { type: 'string' },
                    total_amount: { type: 'number' }
                  }
                },
                user_id: {
                  type: 'object',
                  properties: {
                    _id: { type: 'string' },
                    username: { type: 'string' },
                    email: { type: 'string' }
                  }
                },
                amount: { type: 'number' },
                currency: { type: 'string' },
                payment_method: { type: 'string' },
                payment_status: { type: 'string' },
                payment_date: { type: 'string', format: 'date-time' },
                createdAt: { type: 'string', format: 'date-time' }
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
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' }
        }
      }
    }
  },

  /**
   * Schema cho API lấy giao dịch thanh toán theo đơn hàng
   */
  getPaymentsByOrderId: {
    summary: 'Lấy danh sách giao dịch thanh toán theo đơn hàng',
    description: 'API lấy tất cả giao dịch thanh toán liên quan đến một đơn hàng cụ thể',
    tags: ['Payments'],
    security: [{ bearerAuth: [] }],
    params: {
      type: 'object',
      required: ['orderId'],
      properties: {
        orderId: { type: 'string', description: 'ID của đơn hàng' }
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
                order_id: { type: 'string' },
                user_id: { type: 'string' },
                amount: { type: 'number' },
                currency: { type: 'string' },
                payment_method: { type: 'string' },
                payment_status: { type: 'string' },
                transaction_id: { type: 'string' },
                payment_date: { type: 'string', format: 'date-time' },
                createdAt: { type: 'string', format: 'date-time' }
              }
            }
          }
        }
      },
      500: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' }
        }
      }
    }
  },

  /**
   * Schema cho API tạo URL thanh toán VNPay
   */
  createVnpayPaymentUrl: {
    summary: 'Tạo URL thanh toán VNPay',
    description: 'API tạo URL để chuyển hướng người dùng đến cổng thanh toán VNPay',
    tags: ['Payments', 'VNPay'],
    security: [{ bearerAuth: [] }],
    params: {
      type: 'object',
      required: ['orderId'],
      properties: {
        orderId: { type: 'string', description: 'ID của đơn hàng' }
      }
    },
    body: {
      type: 'object',
      required: ['amount'],
      properties: {
        amount: { type: 'number', minimum: 1000 },
        language: { type: 'string', enum: ['vn', 'en'], default: 'vn' }
      }
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: {
            type: 'object',
            properties: {
              paymentUrl: { type: 'string', format: 'uri' }
            }
          }
        }
      },
      400: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' }
        }
      },
      404: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' }
        }
      },
      500: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' }
        }
      }
    }
  },

  /**
   * Schema cho API xử lý kết quả từ VNPay
   */
  processVnpayReturn: {
    summary: 'Xử lý kết quả thanh toán từ VNPay',
    description: 'API nhận và xử lý thông tin trả về từ cổng thanh toán VNPay',
    tags: ['Payments', 'VNPay'],
    querystring: {
      type: 'object',
      properties: {
        vnp_TxnRef: { type: 'string' },
        vnp_Amount: { type: 'string' },
        vnp_ResponseCode: { type: 'string' },
        vnp_SecureHash: { type: 'string' }
      }
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              order_id: { type: 'string' },
              payment_status: { type: 'string' },
              transaction_id: { type: 'string' }
            }
          }
        }
      },
      500: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' }
        }
      }
    }
  },

  /**
   * Schema cho API tạo URL thanh toán MoMo
   */
  createMomoPaymentUrl: {
    summary: 'Tạo URL thanh toán MoMo',
    description: 'API tạo URL để chuyển hướng người dùng đến cổng thanh toán MoMo',
    tags: ['Payments', 'MoMo'],
    security: [{ bearerAuth: [] }],
    params: {
      type: 'object',
      required: ['orderId'],
      properties: {
        orderId: { type: 'string', description: 'ID của đơn hàng' }
      }
    },
    body: {
      type: 'object',
      required: ['amount'],
      properties: {
        amount: { type: 'number', minimum: 1000 }
      }
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: {
            type: 'object',
            properties: {
              paymentUrl: { type: 'string', format: 'uri' }
            }
          }
        }
      },
      400: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' }
        }
      },
      404: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' }
        }
      },
      500: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' }
        }
      }
    }
  }
};

module.exports = paymentSchema;