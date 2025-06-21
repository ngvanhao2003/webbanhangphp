const userHandler = require('../../handlers/admin/user.handler');

/**
 * Routes quản lý người dùng cho admin
 */
async function routes(fastify, options) {
  // Middleware xác thực tài khoản admin
  const adminAuth = [fastify.authenticate, fastify.isAdmin];
  
  // Lấy danh sách người dùng với phân trang và tìm kiếm
  fastify.get('/users', {
    preValidation: adminAuth,
    schema: {
      tags: ['Admin', 'Users'],
      description: 'Lấy danh sách người dùng có phân trang, tìm kiếm và lọc',
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', default: 1 },
          limit: { type: 'number', default: 10 },
          search: { type: 'string' },
          deleted: { type: 'boolean', default: false }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            users: { 
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  username: { type: 'string' },
                  email: { type: 'string' },
                  full_name: { type: 'string' },
                  avatar: { type: 'string' },
                  role: { type: 'string' },
                  status: { type: 'number' },
                  phone: { type: 'string' },
                  address: { type: 'string' },
                  deleted: { type: 'boolean' },
                  created_at: { type: 'string', format: 'date-time' },
                  updated_at: { type: 'string', format: 'date-time' }
                }
              }
            },
            totalUsers: { type: 'number' },
            totalPages: { type: 'number' },
            currentPage: { type: 'number' }
          }
        }
      }
    }
  }, userHandler.getAllUsers);
  
  // Lấy thông tin chi tiết người dùng theo ID
  fastify.get('/users/:id', {
    preValidation: adminAuth,
    schema: {
      tags: ['Admin', 'Users'],
      description: 'Lấy thông tin chi tiết người dùng theo ID',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', description: 'ID người dùng' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            username: { type: 'string' },
            email: { type: 'string' },
            full_name: { type: 'string' },
            avatar: { type: 'string' },
            role: { type: 'string' },
            status: { type: 'number' },
            phone: { type: 'string' },
            address: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  }, userHandler.getUserById);
  
  // Tạo người dùng mới
  fastify.post('/users', {
    preValidation: adminAuth,
    schema: {
      tags: ['Admin', 'Users'],
      description: 'Tạo người dùng mới',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['username', 'email', 'password', 'name'],
        properties: {
          username: { type: 'string' },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 },
          name: { type: 'string' },
          phone: { type: 'string' },
          address: { type: 'string' },
          role: { 
            type: 'string',
            enum: ['user', 'admin', 'staff'],
            default: 'user'
          },
          status: { 
            type: 'number',
            enum: [0, 1],
            default: 1
          }
        }
      },
      response: {
        201: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            username: { type: 'string' },
            email: { type: 'string' },
            full_name: { type: 'string' },
            role: { type: 'string' },
            status: { type: 'number' },
            created_at: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  }, userHandler.createUser);
  
  // Cập nhật người dùng
  fastify.put('/users/:id', {
    preValidation: adminAuth,
    schema: {
      tags: ['Admin', 'Users'],
      description: 'Cập nhật thông tin người dùng',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', description: 'ID người dùng' }
        }
      },
      body: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          name: { type: 'string' },
          phone: { type: 'string' },
          address: { type: 'string' },
          password: { type: 'string', minLength: 6 },
          role: { 
            type: 'string',
            enum: ['user', 'admin', 'staff']
          },
          status: { 
            type: 'number',
            enum: [0, 1]
          }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            username: { type: 'string' },
            email: { type: 'string' },
            full_name: { type: 'string' },
            role: { type: 'string' },
            status: { type: 'number' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  }, userHandler.updateUser);
  
  // Xóa mềm (soft delete) người dùng
  fastify.delete('/users/:id', {
    preValidation: adminAuth,
    schema: {
      tags: ['Admin', 'Users'],
      description: 'Xóa mềm người dùng (chuyển vào thùng rác)',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', description: 'ID người dùng' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, userHandler.softDeleteUser);
  
  // Xóa vĩnh viễn người dùng
  fastify.delete('/users/:id/permanent', {
    preValidation: adminAuth,
    schema: {
      tags: ['Admin', 'Users'],
      description: 'Xóa vĩnh viễn người dùng',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', description: 'ID người dùng' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, userHandler.hardDeleteUser);
  
  // Khôi phục người dùng đã xóa mềm
  fastify.patch('/users/:id/restore', {
    preValidation: adminAuth,
    schema: {
      tags: ['Admin', 'Users'],
      description: 'Khôi phục người dùng từ thùng rác',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', description: 'ID người dùng' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, userHandler.restoreUser);
  
  // Thay đổi trạng thái người dùng (kích hoạt/vô hiệu hóa)
  fastify.patch('/users/:id/toggle-status', {
    preValidation: adminAuth,
    schema: {
      tags: ['Admin', 'Users'],
      description: 'Thay đổi trạng thái người dùng (kích hoạt/vô hiệu hóa)',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', description: 'ID người dùng' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            status: { type: 'number' }
          }
        }
      }
    }
  }, userHandler.toggleUserStatus);
  
  // API khôi phục nhiều người dùng cùng lúc
  fastify.post('/users/restore', {
    preValidation: adminAuth,
    schema: {
      tags: ['Admin', 'Users'],
      description: 'Khôi phục nhiều người dùng từ thùng rác',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['userIds'],
        properties: {
          userIds: { type: 'array', items: { type: 'string' } }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            restored: { type: 'number' }
          }
        }
      }
    }
  }, userHandler.restoreMultipleUsers);
  
  // API xóa mềm nhiều người dùng cùng lúc
  fastify.post('/users/delete', {
    preValidation: adminAuth,
    schema: {
      tags: ['Admin', 'Users'],
      description: 'Xóa mềm nhiều người dùng (chuyển vào thùng rác)',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['userIds'],
        properties: {
          userIds: { type: 'array', items: { type: 'string' } }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            deleted: { type: 'number' }
          }
        }
      }
    }
  }, userHandler.softDeleteMultipleUsers);
  
  // API xóa vĩnh viễn nhiều người dùng cùng lúc
  fastify.post('/users/delete-permanent', {
    preValidation: adminAuth,
    schema: {
      tags: ['Admin', 'Users'],
      description: 'Xóa vĩnh viễn nhiều người dùng',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['userIds'],
        properties: {
          userIds: { type: 'array', items: { type: 'string' } }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            deleted: { type: 'number' }
          }
        }
      }
    }
  }, userHandler.hardDeleteMultipleUsers);
}

module.exports = routes;
