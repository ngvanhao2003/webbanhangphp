const paymentSchema = require('./schema');
const paymentHandler = require('../../handlers/payment.handler');

module.exports = function(fastify, opts, done) {
  // ===================== API QUẢN LÝ THANH TOÁN (ADMIN) =====================
  
  // Lấy danh sách tất cả giao dịch thanh toán (admin only)
  fastify.get('/api/payments', {
    schema: paymentSchema.getAllPayments,
    preHandler: [fastify.authenticate, fastify.isAdmin]
  }, paymentHandler.getAllPayments);

  // Lấy thông tin chi tiết giao dịch thanh toán theo ID
  fastify.get('/api/payments/:id', {
    schema: paymentSchema.getPaymentById,
    preHandler: [fastify.authenticate, fastify.isAdmin]
  }, paymentHandler.getPaymentById);

  // Tạo giao dịch thanh toán mới (user hoặc admin đều có thể tạo)
  fastify.post('/api/payments', {
    schema: paymentSchema.createPayment,
    preHandler: fastify.authenticate
  }, paymentHandler.createPayment);

  // Cập nhật trạng thái giao dịch thanh toán (admin only)
  fastify.put('/api/payments/:id/status', {
    schema: paymentSchema.updatePaymentStatus,
    preHandler: [fastify.authenticate, fastify.isAdmin]
  }, paymentHandler.updatePaymentStatus);

  // Xử lý hoàn tiền (admin only)
  fastify.post('/api/payments/:id/refund', {
    schema: paymentSchema.processRefund,
    preHandler: [fastify.authenticate, fastify.isAdmin]
  }, paymentHandler.processRefund);

  // ===================== API THANH TOÁN (USER) =====================
  
  // Các API dưới đây chỉ cho phép user thao tác với đơn hàng của chính họ
  // => CẦN kiểm tra quyền sở hữu đơn hàng trong handler (nếu chưa có)
  fastify.get('/api/orders/:orderId/payments', {
    schema: paymentSchema.getPaymentsByOrderId,
    preHandler: fastify.authenticate
  }, paymentHandler.getPaymentsByOrderId); // <-- Trong handler cần kiểm tra user chỉ xem được đơn hàng của mình
  
  // ===================== API CỔNG THANH TOÁN =====================
  
  // Các API này chỉ cho phép user thao tác với đơn hàng của chính họ
  // => CẦN kiểm tra quyền sở hữu đơn hàng trong handler (nếu chưa có)
  fastify.post('/payment/vnpay/:orderId', paymentHandler.createVnpayPaymentUrl);
  fastify.get('/payment/vnpay-return', paymentHandler.processVnpayReturn);
  
// API tạo URL thanh toán MoMo
  fastify.post('/payment/momo/:orderId', {
    preHandler: fastify.authenticate
  }, paymentHandler.createMomoPaymentUrl); // Tạo URL thanh toán MoMo

  // API xử lý kết quả trả về từ MoMo
  fastify.get('/payment/momo-return', paymentHandler.processMomoReturn); // Xử lý kết quả từ MoMo
  fastify.get('/api/payment/momo-return', paymentHandler.processMomoReturn); // Xử lý kết quả từ MoMo
  done();
};