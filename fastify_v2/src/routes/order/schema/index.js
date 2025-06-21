const getAllOrdersSchema = require('./order.getall.schema');
const getOneOrderSchema = require('./order.getone.schema');
const createOrderSchema = require('./order.create.schema');
const updateOrderSchema = require('./order.update.schema');
const updateOrderStatusSchema = require('./order.status.schema');
const updatePaymentStatusSchema = require('./order.payment.schema');
const deleteOrderSchema = require('./order.delete.schema');
// const getOrderByIdSchema = require('./order.getbyid.schema');

module.exports = {
    getAllOrdersSchema,
    getOneOrderSchema,
    createOrderSchema,
    updateOrderSchema,
    updateOrderStatusSchema,
    updatePaymentStatusSchema,
    deleteOrderSchema,
    // getOrderByIdSchema
};