const paymentService = require('../services/payment.service');
const orderService = require('../services/order.service');
const crypto = require('crypto');

/**
 * Handler xử lý các yêu cầu API về thanh toán
 */
class PaymentHandler {

  async createVnpayPaymentUrl(request, reply) {
    try {
      const { orderId } = request.params;
      const { amount, language = 'vn' } = request.body;

      const order = await orderService.getOrderById(orderId);
      if (!order) {
        return reply.code(404).send({ success: false, message: 'Không tìm thấy đơn hàng' });
      }
      if (order.payment_status === 'paid') {
        return reply.code(400).send({ success: false, message: 'Đơn hàng này đã được thanh toán' });
      }

      const paymentData = { amount, language };
      const ipAddr = request.ip || '127.0.0.1';
      const paymentUrl = await paymentService.createVnpayPaymentUrl(order, paymentData, ipAddr);

      return reply.code(200).send({
        success: true,
        message: 'Tạo URL thanh toán thành công',
        data: { paymentUrl }
      });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({
        success: false,
        message: error.message || 'Đã xảy ra lỗi khi tạo URL thanh toán'
      });
    }
  }

  // Xử lý trả về từ VNPay
  async processVnpayReturn(request, reply) {
    try {
      const vnpParams = request.query;
      const result = await paymentService.processVnpayReturn(vnpParams);
      let order = null;
      if (result.payment && result.payment.order_id) {
        order = await orderService.getOrderById(result.payment.order_id);
      }
      if (result.success) {
        return reply.code(200).send({
          success: true,
          message: 'Thanh toán thành công',
          payment: result.payment,
          order: order
        });
      } else {
        return reply.code(200).send({
          success: false,
          message: result.message || 'Thanh toán thất bại',
          payment: result.payment,
          order: order
        });
      }
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({
        success: false,
        message: error.message || 'Đã xảy ra lỗi khi xử lý kết quả thanh toán'
      });
    }
  }

  /**
   * Tạo mới giao dịch thanh toán
   */
  async createPayment(request, reply) {
    try {
      // Log body nhận được từ frontend
      console.log("Body nhận được ở backend:", request.body);
      const paymentData = request.body;
      const result = await paymentService.createPayment(paymentData);
      
      return reply.code(201).send({
        success: true,
        message: 'Tạo giao dịch thanh toán thành công',
        data: result
      });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({
        success: false,
        message: error.message || 'Đã xảy ra lỗi khi tạo giao dịch thanh toán'
      });
    }
  }

  /**
   * Lấy thông tin giao dịch thanh toán theo ID
   */
  async getPaymentById(request, reply) {
    try {
      const { id } = request.params;
      const payment = await paymentService.getPaymentById(id);
      
      return reply.code(200).send({
        success: true,
        data: payment
      });
    } catch (error) {
      request.log.error(error);
      return reply.code(404).send({
        success: false,
        message: error.message || 'Không tìm thấy giao dịch thanh toán'
      });
    }
  }

  /**
   * Cập nhật trạng thái giao dịch thanh toán
   */
  async updatePaymentStatus(request, reply) {
    try {
      const { id } = request.params;
      const updateData = request.body;
      
      const updatedPayment = await paymentService.updatePaymentStatus(id, updateData);
      
      return reply.code(200).send({
        success: true,
        message: 'Cập nhật trạng thái thanh toán thành công',
        data: updatedPayment
      });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({
        success: false,
        message: error.message || 'Đã xảy ra lỗi khi cập nhật trạng thái thanh toán'
      });
    }
  }

  /**
   * Xử lý yêu cầu hoàn tiền
   */
  async processRefund(request, reply) {
    try {
      const { id } = request.params;
      const refundData = request.body;
      
      const result = await paymentService.processRefund(id, refundData);
      
      return reply.code(200).send({
        success: true,
        message: 'Hoàn tiền thành công',
        data: result
      });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({
        success: false,
        message: error.message || 'Đã xảy ra lỗi khi xử lý hoàn tiền'
      });
    }
  }

  /**
   * Lấy danh sách giao dịch thanh toán
   */
  async getAllPayments(request, reply) {
    try {
      const { query } = request;
      
      // Xử lý các tham số lọc
      const filters = {};
      if (query.user_id) filters.user_id = query.user_id;
      if (query.order_id) filters.order_id = query.order_id;
      if (query.payment_method) filters.payment_method = query.payment_method;
      if (query.payment_status) filters.payment_status = query.payment_status;
      if (query.startDate) filters.startDate = query.startDate;
      if (query.endDate) filters.endDate = query.endDate;
      if (query.min_amount) filters.min_amount = Number(query.min_amount);
      if (query.max_amount) filters.max_amount = Number(query.max_amount);
      
      // Xử lý các tham số phân trang và sắp xếp
      const options = {
        page: query.page || 1,
        limit: query.limit || 10,
        sort_by: query.sort_by || 'createdAt',
        sort_order: query.sort_order || 'desc'
      };
      
      const result = await paymentService.getAllPayments(filters, options);
      
      return reply.code(200).send({
        success: true,
        data: result.payments,
        pagination: result.pagination
      });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({
        success: false,
        message: error.message || 'Đã xảy ra lỗi khi lấy danh sách giao dịch thanh toán'
      });
    }
  }

  /**
   * Lấy các giao dịch thanh toán theo đơn hàng
   */
  async getPaymentsByOrderId(request, reply) {
    try {
      const { orderId } = request.params;
      const payments = await paymentService.getPaymentsByOrderId(orderId);
      
      return reply.code(200).send({
        success: true,
        data: payments
      });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({
        success: false,
        message: error.message || 'Đã xảy ra lỗi khi lấy danh sách giao dịch thanh toán'
      });
    }
  }

  /**
   * Tạo URL thanh toán cho VNPay
   */
  async createVnpayPaymentUrl(request, reply) {
    try {
      const { orderId } = request.params;
      const { amount, language = 'vn' } = request.body;
      
      // Lấy thông tin đơn hàng
      const order = await orderService.getOrderById(orderId);
      if (!order) {
        return reply.code(404).send({
          success: false,
          message: 'Không tìm thấy đơn hàng'
        });
      }
      
      // Kiểm tra trạng thái đơn hàng
      if (order.payment_status === 'paid') {
        return reply.code(400).send({
          success: false,
          message: 'Đơn hàng này đã được thanh toán'
        });
      }
      
      // Tạo URL thanh toán
      const paymentData = { amount, language };
      const ipAddr = request.ip || '127.0.0.1';
      const paymentUrl = await paymentService.createVnpayPaymentUrl(order, paymentData, ipAddr);
      
      return reply.code(200).send({
        success: true,
        message: 'Tạo URL thanh toán thành công',
        data: {
          paymentUrl
        }
      });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({
        success: false,
        message: error.message || 'Đã xảy ra lỗi khi tạo URL thanh toán'
      });
    }
  }

  /**
   * Xử lý kết quả thanh toán từ VNPay
   */
  async processVnpayReturn(request, reply) {
    try {
      const vnpParams = request.query;
      
      const result = await paymentService.processVnpayReturn(vnpParams);
      let order = null;
      if (result.payment && result.payment.order_id) {
        order = await orderService.getOrderById(result.payment.order_id);
      }
      if (result.success) {
        return reply.code(200).send({
          success: true,
          message: 'Thanh toán thành công',
          payment: result.payment,
          order: order
        });
      } else {
        return reply.code(200).send({
          success: false,
          message: 'Thanh toán thất bại',
          payment: result.payment,
          order: order
        });
      }
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({
        success: false,
        message: error.message || 'Đã xảy ra lỗi khi xử lý kết quả thanh toán'
      });
    }
  }

  /**
   * Tạo URL thanh toán cho MoMo
   */
  async createMomoPaymentUrl(request, reply) {
    try {
      const { orderId } = request.params;
      const { amount } = request.body;
      
      // Lấy thông tin đơn hàng
      const order = await orderService.getOrderById(orderId);
      if (!order) {
        return reply.code(404).send({
          success: false,
          message: 'Không tìm thấy đơn hàng'
        });
      }
      
      // Kiểm tra trạng thái đơn hàng
      if (order.payment_status === 'paid') {
        return reply.code(400).send({
          success: false,
          message: 'Đơn hàng này đã được thanh toán'
        });
      }
      
      // Tạo URL thanh toán
      const paymentData = { amount };
      // Sửa: nhận toàn bộ response MoMo từ service
      const momoResult = await paymentService.createMomoPaymentUrl(order, paymentData);
      
      return reply.code(200).send({
        success: true,
        message: 'Tạo URL thanh toán thành công',
        data: momoResult // Trả về toàn bộ object MoMo (bao gồm payUrl, deeplink, qrCodeUrl, ...)
      });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({
        success: false,
        message: error.message || 'Đã xảy ra lỗi khi tạo URL thanh toán'
      });
    }
  }

  // Xử lý trả về từ MoMo
  async processMomoReturn(request, reply) {
    const momoParams = request.query;
    try {
      const result = await paymentService.processMomoReturn(momoParams);
      let order = null;
      if (result.payment && result.payment.order_id) {
        order = await orderService.getOrderById(result.payment.order_id);
      }
      // Sau khi xử lý xong, redirect về frontend (3001)
      const frontendUrl = `http://localhost:3001/payment/momo-return?${new URLSearchParams(momoParams).toString()}`;
      return reply.redirect(frontendUrl);
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({
        success: false,
        message: error.message || 'Đã xảy ra lỗi khi xử lý kết quả thanh toán'
      });
    }
  }
}

module.exports = new PaymentHandler();