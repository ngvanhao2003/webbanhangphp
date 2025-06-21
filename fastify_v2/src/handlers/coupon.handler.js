const couponService = require('../services/coupon.service');

/**
 * Lấy danh sách tất cả mã giảm giá với phân trang và filter
 */
async function getAllCoupons(request, reply) {
  try {
    const { 
      isActive, 
      code, 
      type,
      startDate,
      endDate,
      page, 
      limit,
      sortField,
      sortOrder,
      orderTotal,
      productIds
    } = request.query;

    // Kiểm tra quyền admin (nếu có fastify.isAdmin thì là admin)
    const isAdmin = request.user && request.user.role === 'admin';

    // Nếu là user (không phải admin), truyền thêm orderTotal, productIds, userId, isUser=true
    if (!isAdmin) {
      // orderTotal có thể là string, cần chuyển về number
      const parsedOrderTotal = orderTotal ? Number(orderTotal) : undefined;
      // productIds có thể là chuỗi hoặc mảng
      let parsedProductIds = [];
      if (productIds) {
        if (Array.isArray(productIds)) {
          parsedProductIds = productIds;
        } else if (typeof productIds === 'string') {
          // Chuỗi dạng "id1,id2"
          parsedProductIds = productIds.split(',').map(s => s.trim());
        }
      }
      const result = await couponService.getAllCoupons({
        code,
        userId: request.user ? request.user.id : null,
        orderTotal: parsedOrderTotal,
        productIds: parsedProductIds,
        isUser: true
      });
      return reply.code(200).send({
        success: true,
        data: result.coupons
      });
    }

    // Nếu là admin, giữ nguyên logic cũ
    const result = await couponService.getAllCoupons({
      isActive,
      code,
      type,
      startDate,
      endDate,
      page,
      limit,
      sortField,
      sortOrder
    });
    return reply.code(200).send({
      success: true,
      data: result.coupons,
      pagination: result.pagination
    });
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({
      success: false,
      error: 'Internal Server Error',
      message: error.message
    });
  }
}

/**
 * Lấy thông tin một mã giảm giá theo ID
 */
async function getCouponById(request, reply) {
  try {
    const { id } = request.params;
    
    const coupon = await couponService.getCouponById(id);
    
    return reply.code(200).send({
      success: true,
      data: coupon
    });
  } catch (error) {
    request.log.error(error);
    return reply.code(error.message.includes('not found') ? 404 : 400).send({
      success: false,
      error: error.message.includes('not found') ? 'Not Found' : 'Bad Request',
      message: error.message
    });
  }
}

/**
 * Tạo mã giảm giá mới
 */
async function createCoupon(request, reply) {
  try {
    const couponData = request.body;
    
    const newCoupon = await couponService.createCoupon(couponData);
    
    return reply.code(201).send({
      success: true,
      data: newCoupon,
      message: 'Coupon created successfully'
    });
  } catch (error) {
    request.log.error(error);
    return reply.code(400).send({
      success: false,
      error: 'Bad Request',
      message: error.message
    });
  }
}

/**
 * Cập nhật thông tin mã giảm giá
 */
async function updateCoupon(request, reply) {
  try {
    const { id } = request.params;
    const couponData = request.body;
    
    const updatedCoupon = await couponService.updateCoupon(id, couponData);
    
    return reply.code(200).send({
      success: true,
      data: updatedCoupon,
      message: 'Coupon updated successfully'
    });
  } catch (error) {
    request.log.error(error);
    
    if (error.message.includes('not found')) {
      return reply.code(404).send({
        success: false,
        error: 'Not Found',
        message: error.message
      });
    }
    
    return reply.code(400).send({
      success: false,
      error: 'Bad Request',
      message: error.message
    });
  }
}

/**
 * Xóa mã giảm giá
 */
async function deleteCoupon(request, reply) {
  try {
    const { id } = request.params;
    await couponService.deleteCoupon(id);
    return reply.code(200).send({
      success: true,
      message: 'Coupon deleted successfully'
    });
  } catch (error) {
    request.log.error(error);
    if (error.message.includes('not found')) {
      return reply.code(404).send({
        success: false,
        error: 'Not Found',
        message: error.message
      });
    }
    return reply.code(400).send({
      success: false,
      error: 'Bad Request',
      message: error.message
    });
  }
}

/**
 * Xác thực và áp dụng mã giảm giá
 */
async function validateCoupon(request, reply) {
  try {
    const { code } = request.body;
    const { orderTotal, productIds } = request.body;
    const userId = request.user ? request.user.id : null;
    
    const result = await couponService.validateCoupon(code, userId, orderTotal, productIds);
    
    return reply.code(200).send({
      success: true,
      data: result
    });
  } catch (error) {
    request.log.error(error);
    return reply.code(400).send({
      success: false,
      error: 'Coupon Validation Failed',
      message: error.message
    });
  }
}

/**
 * Áp dụng mã giảm giá cho đơn hàng
 */
async function applyCoupon(request, reply) {
  try {
    const { couponId } = request.body;
    const userId = request.user.id;
    
    const result = await couponService.applyCoupon(couponId, userId);
    
    return reply.code(200).send({
      success: true,
      data: result.coupon,
      message: 'Coupon applied successfully'
    });
  } catch (error) {
    request.log.error(error);
    return reply.code(400).send({
      success: false,
      error: 'Failed to Apply Coupon',
      message: error.message
    });
  }
}


module.exports = {
  getAllCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  applyCoupon,
};