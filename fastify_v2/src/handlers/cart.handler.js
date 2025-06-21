// filepath: /home/hoangsonsdk/Downloads/fastify_v2/src/handlers/cart.handler.js
const cartService = require('../services/cart.service');
const orderService = require('../services/order.service');

// Get user's cart
const getCart = async (request, reply) => {
  try {
    const userId = request.user.id;
    
    // Get cart with populated product details
    const cart = await cartService.getCartByUserId(userId);
    
    return cart;
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'An unexpected error occurred'
    });
  }
};

// Add item to cart
const addToCart = async (request, reply) => {
  try {
    const userId = request.user.id;
    const { productId, quantity = 1 } = request.body;
    
    const updatedCart = await cartService.addToCart(userId, productId, quantity);
    
    return updatedCart;
  } catch (error) {
    request.log.error(error);
    
    // Provide specific error message for stock issues
    if (error.message.includes('stock')) {
      return reply.code(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: error.message
      });
    }
    
    return reply.code(500).send({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'An unexpected error occurred'
    });
  }
};

// Update cart item quantity
const updateCartItem = async (request, reply) => {
  try {
    const userId = request.user.id;
    const { productId, quantity } = request.body;
    
    const updatedCart = await cartService.updateCartItem(userId, productId, quantity);
    
    return updatedCart;
  } catch (error) {
    request.log.error(error);
    
    if (error.message.includes('stock') || 
        error.message.includes('found in cart') ||
        error.message.includes('must be positive')) {
      return reply.code(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: error.message
      });
    }
    
    return reply.code(500).send({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'An unexpected error occurred'
    });
  }
};

// Remove item from cart
const removeFromCart = async (request, reply) => {
  try {
    const userId = request.user.id;
    const { productId } = request.params;
    
    const updatedCart = await cartService.removeFromCart(userId, productId);
    
    return updatedCart;
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'An unexpected error occurred'
    });
  }
};

// Clear the cart
const clearCart = async (request, reply) => {
  try {
    const userId = request.user.id;
    
    const emptyCart = await cartService.clearCart(userId);
    
    return {
      success: true,
      message: 'Cart cleared successfully',
      cart: emptyCart
    };
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'An unexpected error occurred'
    });
  }
};

// Checkout - convert cart to order
const checkout = async (request, reply) => {
  try {
    const userId = request.user.id;
    const { customer, paymentMethod, shippingMethod, notes } = request.body;
    
    // Validate required fields
    if (!customer || !customer.name || !customer.email || !customer.phone || !customer.address) {
      return reply.code(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Customer details are required (name, email, phone, address)'
      });
    }
    
    if (!paymentMethod) {
      return reply.code(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Payment method is required'
      });
    }
    
    // Prepare order data from cart
    const orderData = {
      customer,
      paymentMethod,
      shippingMethod: shippingMethod || 'standard',
      notes: notes || ''
    };
    
    // Convert cart to order format
    const completeOrderData = await cartService.cartToOrder(userId, orderData);
    
    // Create the order
    const newOrder = await orderService.createOrder(completeOrderData);
    
    // Clear the cart after successful order creation
    await cartService.clearCart(userId);
    
    return {
      success: true,
      message: 'Order placed successfully',
      order: newOrder
    };
  } catch (error) {
    request.log.error(error);
    
    if (error.message.includes('Cart is empty')) {
      return reply.code(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Cannot checkout with an empty cart'
      });
    }
    
    if (error.message.includes('stock')) {
      return reply.code(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: error.message
      });
    }
    
    return reply.code(500).send({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'An unexpected error occurred'
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  checkout
};