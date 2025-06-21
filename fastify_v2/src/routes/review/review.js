const reviewSchema = require('./schema');
const reviewHandler = require('../../handlers/review.handler');

module.exports = function(fastify, opts, done) {
  // Công khai
  fastify.get('/api/products/:productId/reviews', { schema: reviewSchema.getProductReviews }, reviewHandler.getProductReviews);
  fastify.get('/api/products/:productId/rating', { schema: reviewSchema.getProductRating }, reviewHandler.getProductRating);

  // Yêu cầu đăng nhập
  fastify.post('/api/products/:productId/reviews', { schema: reviewSchema.createReview, preHandler: fastify.authenticate }, reviewHandler.createReview);
  fastify.put('/api/reviews/:reviewId', { schema: reviewSchema.updateReview, preHandler: fastify.authenticate }, reviewHandler.updateReview);
  fastify.delete('/api/reviews/:reviewId', { schema: reviewSchema.deleteReview, preHandler: fastify.authenticate }, reviewHandler.deleteReview);

  // Admin
  fastify.get('/api/reviews', { schema: reviewSchema.getAllReviews, preHandler: [fastify.authenticate, fastify.isAdmin] }, reviewHandler.getAllReviews);
  fastify.put('/api/reviews/:reviewId/status', { schema: reviewSchema.updateReviewStatus, preHandler: [fastify.authenticate, fastify.isAdmin] }, reviewHandler.updateReviewStatus);
  fastify.get('/api/products/:productId/can-review', { preHandler: fastify.authenticate }, reviewHandler.canReview);
  done();
};