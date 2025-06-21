const OrderDetail = require('../model/order_detail.model');

class OrderDetailService {
  async getAllOrderDetails() {
    return await OrderDetail.find()
      .populate('order')
      .populate('product')
      .sort({ created_at: -1 });
  }

  async getOrderDetailById(id) {
    return await OrderDetail.findById(id)
      .populate('order')
      .populate('product');
  }

  async getOrderDetailsByOrderId(orderId) {
    return await OrderDetail.find({ order: orderId })
      .populate('product')
      .sort({ created_at: -1 });
  }

  async createOrderDetail(data) {
    // Kiểm tra có trường size trong dữ liệu không
    if (!data.size) {
      throw new Error("Missing size field");
    }
    // Tính subtotal
    data.subtotal = data.price * data.quantity;

    // Tạo và lưu chi tiết đơn hàng
    const orderDetail = new OrderDetail(data);
    return await orderDetail.save();
  }

  async updateOrderDetail(id, data) {
    // Nếu price hoặc quantity được cập nhật, cần tính lại subtotal
    if (data.price !== undefined && data.quantity !== undefined) {
      data.subtotal = data.price * data.quantity;
    }

    // Cập nhật trường updated_at
    data.updated_at = Date.now();

    return await OrderDetail.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async deleteOrderDetail(id) {
    return await OrderDetail.findByIdAndDelete(id);
  }

  async deleteOrderDetailsByOrderId(orderId) {
    return await OrderDetail.deleteMany({ order: orderId });
  }
}

module.exports = new OrderDetailService();
