const User = require('../model/user.model');
const Order = require('../model/order.model');
const Product = require('../model/product.model');

/**
 * Handler để lấy dữ liệu thống kê cho dashboard admin
 */
async function getDashboardStats(request, reply) {
  try {
    // Lấy tổng số đơn hàng
    const totalOrders = await Order.countDocuments({});
    
    // Lấy tổng doanh thu từ các đơn hàng có trạng thái "completed"
    const revenueResult = await Order.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const revenue = revenueResult.length > 0 ? revenueResult[0].total : 0;
    
    // Lấy tổng số người dùng (không tính admin)
    const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });
    
    // Lấy tổng số sản phẩm
    const totalProducts = await Product.countDocuments({});
    
    // Lấy các đơn hàng gần đây (giới hạn 10 đơn hàng, sắp xếp theo thời gian gần nhất)
    const recentOrders = await Order.find({})
      .sort({ created_at: -1 })
      .limit(10)
      .lean();
    
    // Format lại dữ liệu đơn hàng để hiển thị
    const formattedRecentOrders = recentOrders.map(order => ({
      id: order._id,
      customer_name: order.customer ? order.customer.name : 'Khách vãng lai',
      created_at: order.created_at,
      status: order.status,
      total_amount: order.totalAmount
    }));
    
    // Thống kê đơn hàng theo trạng thái
    const orderStatusStats = await Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    
    const ordersByStatus = {
      pending: 0,
      processing: 0,
      completed: 0,
      cancelled: 0
    };
    
    orderStatusStats.forEach(stat => {
      if (ordersByStatus.hasOwnProperty(stat._id)) {
        ordersByStatus[stat._id] = stat.count;
      }
    });
    
    // Lấy dữ liệu doanh thu và đơn hàng theo tháng trong năm hiện tại
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    
    const monthlyStats = await Order.aggregate([
      { 
        $match: { 
          created_at: { $gte: startOfYear } 
        } 
      },
      {
        $group: {
          _id: { month: { $month: "$created_at" } },
          revenue: { 
            $sum: {
              $cond: [
                { $eq: ["$status", "completed"] },
                "$totalAmount",
                0
              ]
            } 
          },
          orders: { $sum: 1 }
        }
      },
      { $sort: { "_id.month": 1 } }
    ]);
    
    // Format lại dữ liệu thống kê theo tháng
    const monthlySales = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      revenue: 0,
      orders: 0
    }));
    
    monthlyStats.forEach(stat => {
      const monthIndex = stat._id.month - 1;
      if (monthIndex >= 0 && monthIndex < 12) {
        monthlySales[monthIndex].revenue = stat.revenue;
        monthlySales[monthIndex].orders = stat.orders;
      }
    });
    
    // Trả về đầy đủ thông tin thống kê
    return {
      totalOrders,
      revenue,
      totalUsers,
      totalProducts,
      recentOrders: formattedRecentOrders,
      ordersByStatus,
      monthlySales
    };
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu dashboard:', error);
    return reply.code(500).send({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'Không thể lấy dữ liệu thống kê'
    });
  }
}

module.exports = {
  getDashboardStats
};
