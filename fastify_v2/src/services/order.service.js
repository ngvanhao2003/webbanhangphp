const Order = require('../model/order.model');
const OrderDetail = require('../model/order_detail.model');  // Đảm bảo rằng OrderDetail đã được import
const Product = require('../model/product.model'); // Thêm dòng này nếu chưa import

class OrderService {
  async getOrdersByUserId(userId) {
    return await Order.find({ user_id: userId }).populate('items.product');
  }

  async getAllOrders() {
    return await Order.find().populate('items.product').sort({ created_at: -1 });
  }

  async getOrderById(id) {
    return await Order.findById(id).populate('items.product');
  }

  async createOrder(orderData) {
    // Tạo đơn hàng và lưu vào cơ sở dữ liệu
    const order = new Order(orderData);
    const savedOrder = await order.save();

    // Tạo OrderDetail cho mỗi sản phẩm trong đơn hàng
    await Promise.all(orderData.items.map(async (item) => {
      const orderDetailData = {
        order: savedOrder._id,
        product: item.product,
        quantity: item.quantity,
        price: item.price,
        name: item.name,
        size: item.size,
        paymentMethod: orderData.paymentMethod,
        subtotal: item.price * item.quantity
      };

      const orderDetail = new OrderDetail(orderDetailData);
      await orderDetail.save();
    }));

    // Giảm stock cho từng sản phẩm/size đã mua
    await Promise.all(orderData.items.map(async (item) => {
      await Product.updateOne(
        { _id: item.product, "variants.size": item.size },
        { $inc: { "variants.$.stock": -item.quantity } }
      );
    }));

    return savedOrder;
  }

  async updateOrderStatus(id, status) {
    return await Order.findByIdAndUpdate(id, { status: status }, { new: true });
  }

  async updatePaymentStatus(id, paymentStatus) {
    return await Order.findByIdAndUpdate(id, { paymentStatus: paymentStatus }, { new: true });
  }

  async updateOrder(id, orderData) {
    return await Order.findByIdAndUpdate(id, orderData, { new: true });
  }

  async deleteOrder(id) {
    return await Order.findByIdAndDelete(id);
  }

  async getOrdersByDateRange(startDate, endDate) {
    return await Order.find({
      created_at: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }).sort({ created_at: -1 });
  }

  // Lấy sản phẩm bán chạy nhất từ các đơn hàng
  async getBestSellingProducts(limit = 8) {
    // Dùng aggregate để gom nhóm theo product và tính tổng quantity
    const result = await Order.aggregate([
      { $unwind: "$items" },
      { $group: {
        _id: "$items.product",
        totalSold: { $sum: "$items.quantity" }
      }},
      { $sort: { totalSold: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" }
    ]);
    // Trả về mảng sản phẩm kèm số lượng đã bán
    return result.map(item => ({
      ...item.product,
      totalSold: item.totalSold
    }));
  }
}

module.exports = new OrderService();
