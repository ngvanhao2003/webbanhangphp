const { getDashboardStats } = require('../../handlers/admin.handler');

/**
 * Route cho các chức năng quản trị admin
 */
async function routes(fastify, options) {
  // Đăng ký route quản lý người dùng
  fastify.register(require('./user.routes'));
  
  // Endpoint lấy dữ liệu thống kê cho dashboard
  fastify.get('/dashboard', {
    schema: {
      tags: ['Admin'],
      description: 'Get dashboard statistics for admin',
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            totalOrders: { type: 'number' },
            revenue: { type: 'number' },
            totalUsers: { type: 'number' },
            totalProducts: { type: 'number' },
            recentOrders: { 
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  customer_name: { type: 'string' },
                  created_at: { type: 'string' },
                  status: { type: 'string' },
                  total_amount: { type: 'number' }
                }
              }
            },
            ordersByStatus: {
              type: 'object',
              properties: {
                pending: { type: 'number' },
                processing: { type: 'number' },
                completed: { type: 'number' },
                cancelled: { type: 'number' }
              }
            },
            monthlySales: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  month: { type: 'number' },
                  revenue: { type: 'number' },
                  orders: { type: 'number' }
                }
              }
            }
          }
        }
      }
    },
    preHandler: [fastify.authenticate, fastify.isAdmin],
    handler: getDashboardStats
  });
}

module.exports = routes;
