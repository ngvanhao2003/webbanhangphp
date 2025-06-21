const Review = require('../model/review.model');
const mongoose = require('mongoose');
const Order = require('../model/order.model'); // import model đơn hàng

/**
 * Get all reviews for a specific product
 * @param {string} productId - ID of the product
 * @param {Object} options - Filter options (status, page, limit)
 * @returns {Promise<Array>} - List of reviews
 */
async function getProductReviews(productId, options = {}) {
  try {
    const { status, page = 1, limit = 10 } = options;
    const query = { product_id: productId };

    // Only show approved reviews to regular users
    if (status) {
      query.status = status;
    } else {
      query.status = 'approved'; // Default to approved reviews for public view
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Populate user info (username, avatar, email) and product info (name, images)
    const reviews = await Review.find(query)
      .populate({ path: 'user_id', select: 'username avatar email' })
      .populate({ path: 'product_id', select: 'name images' })
      .lean() // <-- Thêm .lean() để trả về plain JS objects, tránh lỗi khi truyền sang frontend
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Review.countDocuments(query);

    return {
      reviews,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    };
  } catch (error) {
    throw new Error(`Error fetching product reviews: ${error.message}`);
  }
}

/**
 * Create a new review
 * @param {Object} reviewData - Review data including product_id, user_id, rating, comment
 * @returns {Promise<Object>} - Created review
 */
async function createReview(reviewData) {
  // Kiểm tra user đã nhận hàng chưa
  const hasDelivered = await Order.exists({
    user_id: reviewData.user_id,
    "items.product_id": reviewData.product_id,
    status: "delivered" // trạng thái đơn hàng đã giao thành công
  });
  if (!hasDelivered) {
    const err = new Error("Bạn chỉ có thể đánh giá khi đơn hàng đã giao thành công.");
    err.statusCode = 403;
    throw err;
  }
  reviewData.status = 'approved';
  const newReview = await Review.create(reviewData);
  return newReview;
}

/**
 * Update a review
 * @param {string} reviewId - ID of the review
 * @param {Object} reviewData - Updated review data 
 * @param {string} userId - ID of the user attempting to update
 * @returns {Promise<Object>} - Updated review
 */
async function updateReview(reviewId, reviewData, userId) {
  try {
    const review = await Review.findById(reviewId);

    if (!review) {
      throw new Error('Review not found');
    }

    // Only the review author can update their own review
    if (review.user_id.toString() !== userId) {
      throw new Error('Unauthorized to update this review');
    }

    Object.assign(review, reviewData, { updatedAt: new Date() });
    return await review.save();
  } catch (error) {
    throw new Error(`Error updating review: ${error.message}`);
  }
}

/**
 * Delete a review
 * @param {string} reviewId - ID of the review
 * @param {string} userId - ID of the user attempting to delete
 * @returns {Promise<boolean>} - Success status
 */
async function deleteReview(reviewId, userId, isAdmin = false) {
  try {
    const review = await Review.findById(reviewId);
    if (!review) throw new Error('Review not found');
    // Cho phép admin hoặc chính chủ review xóa
    if (!isAdmin && review.user_id.toString() !== userId) {
      throw new Error('Unauthorized to delete this review');
    }
    await Review.findByIdAndDelete(reviewId);
    return true;
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Update review status (for admin)
 * @param {string} reviewId - ID of the review
 * @param {string} status - New status (approved/rejected)
 * @returns {Promise<Object>} - Updated review
 */
async function updateReviewStatus(reviewId, status) {
  try {
    const validStatuses = ['pending', 'approved', 'rejected'];

    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status. Must be pending, approved, or rejected');
    }

    const review = await Review.findById(reviewId);

    if (!review) {
      throw new Error('Review not found');
    }

    review.status = status;
    review.updatedAt = new Date();
    return await review.save();
  } catch (error) {
    throw new Error(`Error updating review status: ${error.message}`);
  }
}

/**
 * Get average rating for a product
 * @param {string} productId - ID of the product
 * @returns {Promise<number>} - Average rating
 */
async function getProductAverageRating(productId) {
  try {
    const result = await Review.aggregate([
      { $match: { product_id: mongoose.Types.ObjectId(productId), status: 'approved' } },
      { $group: { _id: null, averageRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);

    if (result.length === 0) {
      return { averageRating: 0, count: 0 };
    }

    return {
      averageRating: parseFloat(result[0].averageRating.toFixed(1)),
      count: result[0].count
    };
  } catch (error) {
    throw new Error(`Error calculating average rating: ${error.message}`);
  }
}

/**
 * Get all reviews (admin function)
 * @param {Object} options - Filter options
 * @returns {Promise<Array>} - List of reviews
 */
async function getAllReviews(options = {}) {
  try {
    const {
      status,
      productId,
      userId,
      page = 1,
      limit = 10
    } = options;

    const query = {};
    if (status) query.status = status;
    if (productId) query.product_id = productId;
    if (userId) query.user_id = userId;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Populate đầy đủ thông tin sản phẩm và user
    const [reviews, total] = await Promise.all([
      Review.find(query)
        .populate({ path: 'product_id', select: 'name images' })
        .populate({ path: 'user_id', select: 'username email' })
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }),
      Review.countDocuments(query)
    ]);

    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    };

    return { reviews, pagination };
  } catch (error) {
    throw new Error(`Error fetching all reviews: ${error.message}`);
  }
}

module.exports = {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  updateReviewStatus,
  getProductAverageRating,
  getAllReviews
};