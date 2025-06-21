const reviewService = require('../services/review.service');
const mongoose = require('mongoose');

/**
 * Get all reviews for a specific product
 */
async function getProductReviews(request, reply) {
  try {
    const { productId } = request.params;
    const { status, page, limit } = request.query;
    
    const result = await reviewService.getProductReviews(productId, { status, page, limit });
    
    return reply.code(200).send({
      success: true,
      data: result.reviews,
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
 * Create a new review
 */
async function createReview(request, reply) {
  try {
    const { productId, rating, comment } = request.body;
    const userId = new mongoose.Types.ObjectId(request.user.id);

    // Kiểm tra productId hợp lệ
    if (
      !productId ||
      typeof productId !== "string" ||
      !/^[a-fA-F0-9]{24}$/.test(productId)
    ) {
      return reply.code(400).send({
        success: false,
        error: "Bad Request",
        message: "ID sản phẩm không hợp lệ."
      });
    }
    const productObjId = new mongoose.Types.ObjectId(productId);

    // Kiểm tra quyền review (đã giao hàng)
    const Order = require('../model/order.model');
    const hasDelivered = await Order.exists({
      user_id: userId,
      "items.product": productObjId,
      status: "delivered"
    });
    if (!hasDelivered) {
      return reply.code(403).send({
        success: false,
        error: "Bad Request",
        message: "Bạn chỉ có thể đánh giá khi đơn hàng đã giao thành công."
      });
    }

    // Tạo review
    const Review = require('../model/review.model');
    const newReview = await Review.create({
      user_id: userId,
      product_id: productObjId,
      rating,
      comment,
      status: "approved"
    });

    return reply.code(201).send({ success: true, data: newReview });
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({
      success: false,
      error: "Internal Server Error",
      message: error.message
    });
  }
}

/**
 * Update an existing review
 */
async function updateReview(request, reply) {
  try {
    // Get user ID from authenticated user
    const userId = request.user.id;
    const { reviewId } = request.params;
    const { rating, comment } = request.body;
    
    const updatedReview = await reviewService.updateReview(reviewId, { rating, comment }, userId);
    
    return reply.code(200).send({
      success: true,
      data: updatedReview,
      message: 'Review updated successfully'
    });
  } catch (error) {
    request.log.error(error);
    
    if (error.message.includes('Unauthorized')) {
      return reply.code(403).send({
        success: false,
        error: 'Forbidden',
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
 * Delete a review
 */
async function deleteReview(request, reply) {
  try {
    const userId = request.user.id;
    const isAdmin = request.user.role === 'admin';
    const { reviewId } = request.params;
    await reviewService.deleteReview(reviewId, userId, isAdmin);
    return reply.code(200).send({
      success: true,
      message: 'Review deleted successfully'
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
 * Get product average rating
 */
async function getProductRating(request, reply) {
  try {
    const { productId } = request.params;
    
    const rating = await reviewService.getProductAverageRating(productId);
    
    return reply.code(200).send({
      success: true,
      data: rating
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
 * Admin functions below
 */

/**
 * Get all reviews (admin)
 */
async function getAllReviews(request, reply) {
  try {
    const { status, productId, userId, page, limit } = request.query;
    
    const result = await reviewService.getAllReviews({ 
      status, 
      productId, 
      userId, 
      page, 
      limit 
    });
    
    return reply.code(200).send({
      success: true,
      data: result.reviews,
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
 * Update review status (admin)
 */
async function updateReviewStatus(request, reply) {
  try {
    const { reviewId } = request.params;
    const { status } = request.body;
    
    const updatedReview = await reviewService.updateReviewStatus(reviewId, status);
    
    return reply.code(200).send({
      success: true,
      data: updatedReview,
      message: `Review status updated to ${status}`
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
 * Check if user can review this product (has delivered order)
 */
async function canReview(request, reply) {
  try {
    const userId = new mongoose.Types.ObjectId(request.user.id);
    const { productId } = request.params;
    const productObjId = new mongoose.Types.ObjectId(productId);
    const Order = require('../model/order.model');
    const hasDelivered = await Order.exists({
      user_id: userId,
      "items.product": productObjId,
      status: "delivered"
    });
    return reply.code(200).send({ canReview: !!hasDelivered });
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({
      canReview: false,
      error: 'Internal Server Error',
      message: error.message
    });
  }
}

module.exports = {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  getProductRating,
  getAllReviews,
  updateReviewStatus,
  canReview
};