const Coupon = require('../model/coupon.model');
const mongoose = require('mongoose');

/**
 * Lấy tất cả mã giảm giá với filter, phân trang
 * @param {Object} options - Các tùy chọn filter
 * @returns {Promise<Array>} - Danh sách mã giảm giá
 */
async function getAllCoupons(options = {}) {
  try {
    const { 
      isActive, 
      code, 
      type,
      startDate,
      endDate,
      page = 1, 
      limit = 10,
      sortField = 'createdAt',
      sortOrder = 'desc',
      // Thêm các tham số cho user
      userId,
      orderTotal,
      productIds,
      isUser // true nếu là user, false nếu là admin
    } = options;

    // Nếu là admin (isUser = false hoặc undefined), giữ nguyên logic cũ
    if (!isUser) {
      // Xây dựng query object
      const query = {};
      if (isActive !== undefined) {
        query.isActive = isActive === 'true';
      }
      if (code) {
        query.code = { $regex: new RegExp(code, 'i') };
      }
      if (type) {
        query.type = type;
      }
      if (startDate || endDate) {
        query.$and = [];
        if (startDate) {
          query.$and.push({ endDate: { $gte: new Date(startDate) } });
        }
        if (endDate) {
          query.$and.push({ startDate: { $lte: new Date(endDate) } });
        }
      }
      // Tính toán skip cho phân trang
      const skip = (parseInt(page) - 1) * parseInt(limit);
      // Xây dựng sort object
      const sort = {};
      sort[sortField] = sortOrder === 'desc' ? -1 : 1;
      // Thực thi query với phân trang
      const coupons = await Coupon.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit));
      // Đếm tổng số document cho phân trang
      const total = await Coupon.countDocuments(query);
      return {
        coupons,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        }
      };
    }

    // Nếu là user, chỉ trả về các coupon hợp lệ, có discount
    // Lấy tất cả coupon đang hoạt động, còn hạn, còn lượt dùng
    const now = new Date();
    const userQuery = {
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
      $or: [
        { usageLimit: null },
        { $expr: { $lt: ["$usedCount", "$usageLimit"] } }
      ]
    };
    // Có thể filter thêm theo code nếu FE truyền lên
    if (code) {
      userQuery.code = { $regex: new RegExp(code, 'i') };
    }
    // Lấy tất cả coupon hợp lệ
    const coupons = await Coupon.find(userQuery).sort({ createdAt: -1 });

    // Tính discount cho từng coupon dựa trên orderTotal, productIds
    const result = [];
    for (const coupon of coupons) {
      // Kiểm tra minOrderValue
      if (orderTotal && orderTotal < coupon.minOrderValue) continue;
      // Kiểm tra sản phẩm áp dụng (nếu có)
      if (coupon.applicableProducts && coupon.applicableProducts.length > 0 && Array.isArray(productIds)) {
        const validProduct = productIds.some(id =>
          coupon.applicableProducts.some(prodId => prodId.toString() === id)
        );
        if (!validProduct) continue;
      }
      // Kiểm tra perUserLimit
      if (userId && coupon.perUserLimit) {
        const userUsage = coupon.userUsage.find(usage =>
          usage.user_id.toString() === userId
        );
        if (userUsage && userUsage.usedCount >= coupon.perUserLimit) continue;
      }
      // Tính discount
      let discountValue = 0;
      if (orderTotal) {
        if (coupon.type === 'percentage') {
          discountValue = (orderTotal * coupon.value) / 100;
          if (coupon.maxDiscountValue && discountValue > coupon.maxDiscountValue) {
            discountValue = coupon.maxDiscountValue;
          }
        } else {
          discountValue = coupon.value;
          if (discountValue > orderTotal) discountValue = orderTotal;
        }
      }
      // Trả về coupon + discount
      result.push({
        ...coupon.toObject(),
        discount: discountValue
      });
    }
    return { coupons: result, pagination: null };
  } catch (error) {
    throw new Error(`Error fetching coupons: ${error.message}`);
  }
}

/**
 * Lấy một mã giảm giá theo ID
 * @param {string} id - ID của mã giảm giá
 * @returns {Promise<Object>} - Thông tin mã giảm giá
 */
async function getCouponById(id) {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid coupon ID');
    }
    
    const coupon = await Coupon.findById(id);
    
    if (!coupon) {
      throw new Error('Coupon not found');
    }
    
    return coupon;
  } catch (error) {
    throw new Error(`Error fetching coupon: ${error.message}`);
  }
}

/**
 * Tạo mã giảm giá mới
 * @param {Object} couponData - Dữ liệu mã giảm giá
 * @returns {Promise<Object>} - Mã giảm giá đã tạo
 */
async function createCoupon(couponData) {
  try {
    // Kiểm tra xem mã đã tồn tại chưa
    const existingCoupon = await Coupon.findOne({ code: couponData.code.toUpperCase() });
    
    if (existingCoupon) {
      throw new Error('Coupon code already exists');
    }
    
    // Đảm bảo mã coupon luôn viết hoa
    couponData.code = couponData.code.toUpperCase();
    
    // Kiểm tra giá trị phần trăm phải <= 100%
    if (couponData.type === 'percentage' && couponData.value > 100) {
      throw new Error('Percentage discount cannot exceed 100%');
    }
    
    // Đảm bảo ngày bắt đầu <= ngày kết thúc
    if (new Date(couponData.startDate) > new Date(couponData.endDate)) {
      throw new Error('Start date must be before end date');
    }
    
    const coupon = new Coupon(couponData);
    return await coupon.save();
  } catch (error) {
    throw new Error(`Error creating coupon: ${error.message}`);
  }
}

/**
 * Cập nhật mã giảm giá
 * @param {string} id - ID của mã giảm giá
 * @param {Object} couponData - Dữ liệu cập nhật
 * @returns {Promise<Object>} - Mã giảm giá đã cập nhật
 */
async function updateCoupon(id, couponData) {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid coupon ID');
    }
    
    // Kiểm tra mã giảm giá tồn tại
    const existingCoupon = await Coupon.findById(id);
    
    if (!existingCoupon) {
      throw new Error('Coupon not found');
    }
    
    // Nếu cập nhật mã code, phải kiểm tra trùng lặp
    if (couponData.code && couponData.code !== existingCoupon.code) {
      const duplicateCoupon = await Coupon.findOne({ 
        code: couponData.code.toUpperCase(),
        _id: { $ne: id } 
      });
      
      if (duplicateCoupon) {
        throw new Error('Coupon code already exists');
      }
      
      // Đảm bảo mã coupon luôn viết hoa
      couponData.code = couponData.code.toUpperCase();
    }
    
    // Kiểm tra giá trị phần trăm phải <= 100%
    if (couponData.type === 'percentage' && couponData.value > 100) {
      throw new Error('Percentage discount cannot exceed 100%');
    }
    
    // Đảm bảo ngày bắt đầu <= ngày kết thúc
    if (couponData.startDate && couponData.endDate && 
        new Date(couponData.startDate) > new Date(couponData.endDate)) {
      throw new Error('Start date must be before end date');
    }
    
    // Cập nhật ngày sửa đổi
    couponData.updatedAt = new Date();
    
    // Thực hiện cập nhật
    const updatedCoupon = await Coupon.findByIdAndUpdate(
      id,
      { $set: couponData },
      { new: true, runValidators: true }
    );
    
    return updatedCoupon;
  } catch (error) {
    throw new Error(`Error updating coupon: ${error.message}`);
  }
}

/**
 * Xóa mã giảm giá
 * @param {string} id - ID của mã giảm giá
 * @returns {Promise<boolean>} - Kết quả xóa
 */
async function deleteCoupon(id) {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid coupon ID');
    }
    const result = await Coupon.findByIdAndDelete(id);
    if (!result) {
      throw new Error('Coupon not found');
    }
    return true;
  } catch (error) {
    throw new Error(`Error deleting coupon: ${error.message}`);
  }
}

/**
 * Kiểm tra tính hợp lệ của mã giảm giá
 * @param {string} code - Mã giảm giá
 * @param {string} userId - ID người dùng
 * @param {number} orderTotal - Tổng giá trị đơn hàng
 * @param {Array} productIds - Danh sách ID sản phẩm trong đơn hàng
 * @returns {Promise<Object>} - Thông tin mã giảm giá nếu hợp lệ
 */
async function validateCoupon(code, userId, orderTotal, productIds = []) {
  try {
    // Tìm mã giảm giá theo code
    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase(),
      isActive: true
    });
    
    if (!coupon) {
      throw new Error('Invalid coupon code');
    }
    
    // Kiểm tra ngày hiệu lực
    const now = new Date();
    if (now < coupon.startDate || now > coupon.endDate) {
      throw new Error('Coupon is expired or not yet valid');
    }
    
    // Kiểm tra số lần sử dụng tối đa
    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      throw new Error('Coupon usage limit reached');
    }
    
    // Kiểm tra giới hạn sử dụng cho mỗi người dùng
    if (userId) {
      const userUsage = coupon.userUsage.find(usage => 
        usage.user_id.toString() === userId
      );
      
      if (userUsage && userUsage.usedCount >= coupon.perUserLimit) {
        throw new Error('You have already used this coupon the maximum number of times');
      }
    }
    
    // Kiểm tra giá trị đơn hàng tối thiểu
    if (orderTotal < coupon.minOrderValue) {
      throw new Error(`Order total must be at least ${coupon.minOrderValue} to use this coupon`);
    }
    
    // Kiểm tra sản phẩm được áp dụng (nếu có)
    if (coupon.applicableProducts && coupon.applicableProducts.length > 0) {
      const validProduct = productIds.some(id => 
        coupon.applicableProducts.some(prodId => prodId.toString() === id)
      );
      
      if (!validProduct) {
        throw new Error('Coupon is not applicable for the products in your cart');
      }
    }
    
    // Kiểm tra danh mục được áp dụng (cần truy vấn sản phẩm để kiểm tra)
    // Phần này phức tạp hơn và có thể cần kết hợp với Product service
    
    // Tính toán giảm giá
    let discountValue;
    if (coupon.type === 'percentage') {
      discountValue = (orderTotal * coupon.value) / 100;
      
      // Áp dụng giới hạn giảm giá tối đa (nếu có)
      if (coupon.maxDiscountValue && discountValue > coupon.maxDiscountValue) {
        discountValue = coupon.maxDiscountValue;
      }
    } else {
      // Fixed amount
      discountValue = coupon.value;
      
      // Đảm bảo giảm giá không vượt quá giá trị đơn hàng
      if (discountValue > orderTotal) {
        discountValue = orderTotal;
      }
    }
    
    return {
      coupon,
      discountValue,
      finalAmount: orderTotal - discountValue
    };
    
  } catch (error) {
    throw new Error(`Coupon validation failed: ${error.message}`);
  }
}

/**
 * Áp dụng mã giảm giá cho đơn hàng
 * @param {string} couponId - ID của mã giảm giá
 * @param {string} userId - ID người dùng
 * @returns {Promise<Object>} - Kết quả cập nhật
 */
async function applyCoupon(couponId, userId) {
  try {
    if (!mongoose.Types.ObjectId.isValid(couponId)) {
      throw new Error('Invalid coupon ID');
    }
    
    // Cập nhật thông tin sử dụng coupon
    const coupon = await Coupon.findById(couponId);
    
    if (!coupon) {
      throw new Error('Coupon not found');
    }
    
    // Tăng số lần sử dụng
    coupon.usedCount += 1;
    
    // Cập nhật thông tin người dùng đã sử dụng
    const userIndex = coupon.userUsage.findIndex(
      usage => usage.user_id.toString() === userId
    );
    
    if (userIndex >= 0) {
      // Đã có trong danh sách, tăng số lần sử dụng
      coupon.userUsage[userIndex].usedCount += 1;
    } else {
      // Thêm mới vào danh sách
      coupon.userUsage.push({
        user_id: userId,
        usedCount: 1
      });
    }
    
    // Lưu thay đổi
    await coupon.save();
    
    return { success: true, coupon };
    
  } catch (error) {
    throw new Error(`Error applying coupon: ${error.message}`);
  }
}

// 1. getAllCoupons
// - Nhận các tham số filter: isActive, code, type, startDate, endDate
// - Phân trang: page, limit
// - Sắp xếp: sortField, sortOrder
// - Xây dựng query phù hợp với filter
// - Trả về: { coupons, pagination: { total, page, limit, pages } }

// 2. getCouponById
// - Nhận id, kiểm tra hợp lệ (ObjectId)
// - Tìm kiếm bằng findById
// - Nếu không tìm thấy trả về lỗi 'Coupon not found'
// - Nếu tìm thấy trả về coupon

module.exports = {
  getAllCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  applyCoupon
};