const orderSchema = require('./schema');
const orderHandler = require('../../handlers/order.handler');

module.exports = function(fastify, opts, done) {
    // Route này assume file được register ở app.js với prefix '/api/orders'
    // => tất cả route bên dưới sẽ có prefix /api/orders/...

    // GET /api/orders           (lấy tất cả đơn)
    fastify.get('/', { schema: orderSchema.getAllOrdersSchema }, orderHandler.getAll);

    // GET /api/orders/date-range
    fastify.get('/date-range', { schema: orderSchema.getAllOrdersSchema }, orderHandler.getOrdersByDateRange);

    // GET /api/orders/:id
    fastify.get('/:id', { schema: orderSchema.getOneOrderSchema }, orderHandler.getOne);

    // POST /api/orders          (tạo mới đơn hàng - ĐÚNG CHUẨN)
    fastify.post('/', { 
        schema: orderSchema.createOrderSchema, 
        preHandler: fastify.authenticate 
    }, orderHandler.createOrder);

    // PUT /api/orders/:id       (update toàn bộ đơn)
    fastify.put('/:id', { schema: orderSchema.updateOrderSchema }, orderHandler.updateOrder);

    // PATCH /api/orders/:id/status  (update trạng thái đơn)
    fastify.patch('/:id/status', { schema: orderSchema.updateOrderStatusSchema }, orderHandler.updateOrderStatus);

    // PATCH /api/orders/:id/payment (update trạng thái thanh toán)
    fastify.patch('/:id/payment', { schema: orderSchema.updatePaymentStatusSchema }, orderHandler.updatePaymentStatus);

    // DELETE /api/orders/:id    (xóa đơn)
    fastify.delete('/:id', { schema: orderSchema.deleteOrderSchema }, orderHandler.deleteOrder);

    // Route để lấy lịch sử đơn hàng theo userId (lấy đơn hàng theo userId)
    fastify.get('/user/:userId', { schema: orderSchema.getOrderHistorySchema }, orderHandler.getOrderHistory);

    // GET /api/orders/best-selling
    fastify.get('/best-selling', orderHandler.getBestSellingProducts);

    done();
};
