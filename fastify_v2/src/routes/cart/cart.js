// filepath: /home/hoangsonsdk/Downloads/fastify_v2/src/routes/cart/cart.js
const cartSchema = require('./schema');
const cartHandler = require('../../handlers/cart.handler');

module.exports = function(fastify, opts, done) {
  // Get cart contents
  fastify.get('/', { 
    schema: cartSchema.getCartSchema,
    preHandler: fastify.authenticate
  }, cartHandler.getCart);
  
  // Add product to cart
  fastify.post('/add', { 
    schema: cartSchema.addToCartSchema,
    preHandler: fastify.authenticate
  }, cartHandler.addToCart);
  
  // Update cart item quantity
  fastify.put('/update', { 
    schema: cartSchema.updateCartSchema,
    preHandler: fastify.authenticate
  }, cartHandler.updateCartItem);
  
  // Remove item from cart
  fastify.delete('/item/:productId', { 
    schema: cartSchema.removeFromCartSchema,
    preHandler: fastify.authenticate
  }, cartHandler.removeFromCart);
  
  // Clear cart
  fastify.delete('/clear', { 
    schema: cartSchema.clearCartSchema,
    preHandler: fastify.authenticate
  }, cartHandler.clearCart);
  
  // Checkout - convert cart to order
  fastify.post('/checkout', { 
    schema: cartSchema.checkoutSchema,
    preHandler: fastify.authenticate
  }, cartHandler.checkout);
  
  done();
};