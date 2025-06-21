const couponSchema = require('./schema');
const couponHandler = require('../../handlers/coupon.handler');

module.exports = function(fastify, opts, done) {
  // API Quản lý mã giảm giá
  
  // Lấy danh sách tất cả mã giảm giá
  fastify.get('/api/coupons', {
    schema: couponSchema.getAllCoupons,
    preHandler: [fastify.authenticate] // bỏ fastify.isAdmin để user cũng lấy được coupon
  }, couponHandler.getAllCoupons);

  // Lấy thông tin chi tiết một mã giảm giá theo ID
  fastify.get('/api/coupons/:id', {
    schema: couponSchema.getCouponById,
    preHandler: [fastify.authenticate, fastify.isAdmin]
  }, couponHandler.getCouponById);

  // Tạo mã giảm giá mới
  fastify.post('/api/coupons', {
    schema: couponSchema.createCoupon,
    preHandler: [fastify.authenticate, fastify.isAdmin]
  }, couponHandler.createCoupon);

  // Cập nhật thông tin mã giảm giá
  fastify.put('/api/coupons/:id', {
    schema: couponSchema.updateCoupon,
    preHandler: [fastify.authenticate, fastify.isAdmin]
  }, couponHandler.updateCoupon);

  // Xóa mã giảm giá
  fastify.delete('/api/coupons/:id', {
    schema: couponSchema.deleteCoupon,
    preHandler: [fastify.authenticate, fastify.isAdmin]
  }, couponHandler.deleteCoupon);
  
  // API cho người dùng để kiểm tra và sử dụng mã giảm giá
  
  // Xác thực mã giảm giá (không cần đăng nhập)
  fastify.post('/api/coupons/validate', {
    schema: couponSchema.validateCoupon
  }, couponHandler.validateCoupon);

  // Áp dụng mã giảm giá (yêu cầu đăng nhập)
  fastify.post('/api/coupons/apply', {
    schema: couponSchema.applyCoupon,
    preHandler: fastify.authenticate
  }, couponHandler.applyCoupon);

  done();
};