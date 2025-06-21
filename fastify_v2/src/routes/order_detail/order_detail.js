const orderDetailSchema = require('./schema');
const orderDetailHandler = require('../../handlers/order_detail.handler');

module.exports = function(fastify, opts, done) {
    // GET all order details
    fastify.get('/', { schema: orderDetailSchema.getAllOrderDetailsSchema }, orderDetailHandler.getAll);
    
    // GET order details by order ID
    fastify.get('/order/:orderId', { schema: orderDetailSchema.getByOrderSchema }, orderDetailHandler.getByOrder);
    
    // GET order detail by ID
    fastify.get('/:id', { schema: orderDetailSchema.getOneOrderDetailSchema }, orderDetailHandler.getOne);
    
    // POST create a new order detail
    fastify.post('/', { schema: orderDetailSchema.createOrderDetailSchema }, orderDetailHandler.createOrderDetail);
    
    // PUT update order detail
    fastify.put('/:id', { schema: orderDetailSchema.updateOrderDetailSchema }, orderDetailHandler.updateOrderDetail);
    
    // DELETE order detail
    fastify.delete('/:id', { schema: orderDetailSchema.deleteOrderDetailSchema }, orderDetailHandler.deleteOrderDetail);
    
    done();
};