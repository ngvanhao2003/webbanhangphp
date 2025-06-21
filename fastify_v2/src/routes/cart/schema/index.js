// filepath: /home/hoangsonsdk/Downloads/fastify_v2/src/routes/cart/schema/index.js
const getCartSchema = require('./cart.getall.schema');
const addToCartSchema = require('./cart.add.schema');
const updateCartSchema = require('./cart.update.schema');
const removeFromCartSchema = require('./cart.remove.schema');
const clearCartSchema = require('./cart.clear.schema');
const checkoutSchema = require('./cart.checkout.schema');

module.exports = {
  getCartSchema,
  addToCartSchema,
  updateCartSchema,
  removeFromCartSchema,
  clearCartSchema,
  checkoutSchema
};