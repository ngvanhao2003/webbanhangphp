const getAllOrderDetailsSchema = require('./order_detail.getall.schema');
const getOneOrderDetailSchema = require('./order_detail.getone.schema');
const getByOrderSchema = require('./order_detail.getbyorder.schema');
const createOrderDetailSchema = require('./order_detail.create.schema');
const updateOrderDetailSchema = require('./order_detail.update.schema');
const deleteOrderDetailSchema = require('./order_detail.delete.schema');

module.exports = {
    getAllOrderDetailsSchema,
    getOneOrderDetailSchema,
    getByOrderSchema,
    createOrderDetailSchema,
    updateOrderDetailSchema,
    deleteOrderDetailSchema
};