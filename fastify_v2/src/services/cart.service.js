// filepath: /home/hoangsonsdk/Downloads/fastify_v2/src/services/cart.service.js
const Cart = require('../model/cart.model');
const Product = require('../model/product.model');

class CartService {
  // Get cart by user ID
  async getCartByUserId(userId) {
    try {
      let cart = await Cart.findOne({ user: userId }).populate('items.product');
      
      // If no cart exists for the user, create a new empty cart
      if (!cart) {
        cart = await this.createCart(userId);
      }
      
      return cart;
    } catch (error) {
      throw new Error(`Error fetching cart: ${error.message}`);
    }
  }
  
  // Create a new empty cart for user
  async createCart(userId) {
    try {
      const newCart = new Cart({
        user: userId,
        items: [],
        totalAmount: 0
      });
      return await newCart.save();
    } catch (error) {
      throw new Error(`Error creating cart: ${error.message}`);
    }
  }
  
  // Add product to cart
  async addToCart(userId, productId, quantity) {
    try {
      // Get product details first to check stock and get current price
      const product = await Product.findById(productId);
      
      if (!product) {
        throw new Error('Product not found');
      }
      
      if (product.stock < quantity) {
        throw new Error(`Not enough stock. Only ${product.stock} available.`);
      }
      
      // Find user's cart or create if doesn't exist
      let cart = await Cart.findOne({ user: userId });
      
      if (!cart) {
        cart = await this.createCart(userId);
      }
      
      // Check if the product is already in the cart
      const existingItemIndex = cart.items.findIndex(
        item => item.product.toString() === productId
      );
      
      if (existingItemIndex > -1) {
        // Product already in cart, update quantity
        const newQuantity = cart.items[existingItemIndex].quantity + quantity;
        
        // Check if we have enough stock for the new total quantity
        if (product.stock < newQuantity) {
          throw new Error(`Cannot add ${quantity} more. Only ${product.stock} available.`);
        }
        
        cart.items[existingItemIndex].quantity = newQuantity;
      } else {
        // Add new product to cart
        cart.items.push({
          product: productId,
          name: product.name,
          quantity: quantity,
          price: product.price,
          imageUrl: product.imageUrl || ''
        });
      }
      
      // Recalculate total amount
      cart.totalAmount = cart.items.reduce(
        (total, item) => total + (item.price * item.quantity), 
        0
      );
      
      cart.updated_at = Date.now();
      return await cart.save();
    } catch (error) {
      throw new Error(`Error adding to cart: ${error.message}`);
    }
  }
  
  // Update cart item quantity
  async updateCartItem(userId, productId, quantity) {
    try {
      // Check if quantity is valid
      if (quantity < 0) {
        throw new Error('Quantity must be positive');
      }
      
      // Find user's cart
      const cart = await Cart.findOne({ user: userId });
      
      if (!cart) {
        throw new Error('Cart not found');
      }
      
      // Find the item in the cart
      const itemIndex = cart.items.findIndex(
        item => item.product.toString() === productId
      );
      
      if (itemIndex === -1) {
        throw new Error('Product not found in cart');
      }
      
      // If quantity is 0, remove the item
      if (quantity === 0) {
        return await this.removeFromCart(userId, productId);
      }
      
      // Check stock
      const product = await Product.findById(productId);
      
      if (!product) {
        throw new Error('Product no longer available');
      }
      
      if (product.stock < quantity) {
        throw new Error(`Not enough stock. Only ${product.stock} available.`);
      }
      
      // Update quantity
      cart.items[itemIndex].quantity = quantity;
      
      // Recalculate total amount
      cart.totalAmount = cart.items.reduce(
        (total, item) => total + (item.price * item.quantity), 
        0
      );
      
      cart.updated_at = Date.now();
      return await cart.save();
    } catch (error) {
      throw new Error(`Error updating cart: ${error.message}`);
    }
  }
  
  // Remove an item from cart
  async removeFromCart(userId, productId) {
    try {
      const cart = await Cart.findOne({ user: userId });
      
      if (!cart) {
        throw new Error('Cart not found');
      }
      
      // Remove the item
      cart.items = cart.items.filter(
        item => item.product.toString() !== productId
      );
      
      // Recalculate total amount
      cart.totalAmount = cart.items.reduce(
        (total, item) => total + (item.price * item.quantity), 
        0
      );
      
      cart.updated_at = Date.now();
      return await cart.save();
    } catch (error) {
      throw new Error(`Error removing from cart: ${error.message}`);
    }
  }
  
  // Clear all items from cart
  async clearCart(userId) {
    try {
      const cart = await Cart.findOne({ user: userId });
      
      if (!cart) {
        throw new Error('Cart not found');
      }
      
      cart.items = [];
      cart.totalAmount = 0;
      cart.updated_at = Date.now();
      
      return await cart.save();
    } catch (error) {
      throw new Error(`Error clearing cart: ${error.message}`);
    }
  }
  
  // Convert cart to order
  async cartToOrder(userId, orderData) {
    try {
      const cart = await Cart.findOne({ user: userId });
      
      if (!cart || cart.items.length === 0) {
        throw new Error('Cart is empty');
      }
      
      // Convert cart items to order items format
      const orderItems = cart.items.map(item => ({
        product: item.product,
        quantity: item.quantity,
        price: item.price,
        name: item.name
      }));
      
      // Create order data
      const completeOrderData = {
        ...orderData,
        items: orderItems,
        totalAmount: cart.totalAmount
      };
      
      // Return order data to be used by order service
      return completeOrderData;
    } catch (error) {
      throw new Error(`Error converting cart to order: ${error.message}`);
    }
  }
}

module.exports = new CartService();