const orderDetailService = require('../services/order_detail.service');

async function getAll(req, reply) {
  try {
    const result = await orderDetailService.getAllOrderDetails();
    reply.send(result);
  } catch (err) {
    console.error('Database error:', err);
    reply.status(500).send({ error: 'Internal Server Error' });
  }
}

async function getOne(req, reply) {
  const id = req.params.id;
  
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    reply.status(400).send({ error: 'Invalid ID format' });
    return;
  }
  
  try {
    const result = await orderDetailService.getOrderDetailById(id);
    if (!result) {
      reply.status(404).send({ error: 'Order detail not found' });
      return;
    }
    reply.send(result);
  } catch (err) {
    console.error('Database error:', err);
    reply.status(500).send({ error: 'Internal Server Error' });
  }
}

async function getByOrder(req, reply) {
  const orderId = req.params.orderId;

  try {
    const result = await orderDetailService.getOrderDetailsByOrderId(orderId);
    if (!result || result.length === 0) {
      return reply.status(404).send({ error: 'No order details found for this order' });
    }
    reply.send(result);
  } catch (err) {
    console.error('Database error:', err);
    reply.status(500).send({ error: 'Internal Server Error' });
  }
}

async function createOrderDetail(req, reply) {
  const data = req.body;

  console.log("Dữ liệu nhận từ frontend:", data);

  // Kiểm tra trường 'size' có trong mỗi mục trong 'items'
  if (!data.items || !data.items.every(item => item.size)) {
    return reply.status(400).send({ error: 'Missing size field in items' });
  }

  try {
    const result = await orderDetailService.createOrderDetail(data);
    reply.send(result);
  } catch (err) {
    console.error('Lỗi khi tạo chi tiết đơn hàng:', err);
    reply.status(500).send({ error: 'Internal Server Error' });
  }
}

async function updateOrderDetail(req, reply) {
  const id = req.params.id;
  const data = req.body;

  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    reply.status(400).send({ error: 'Invalid ID format' });
    return;
  }

  // Kiểm tra có trường size trong dữ liệu không
  if (!data.size) {
    return reply.status(400).send({ error: 'Missing size field' });
  }

  try {
    const updatedOrderDetail = await orderDetailService.updateOrderDetail(id, data);
    if (!updatedOrderDetail) {
      reply.status(404).send({ error: 'Order detail not found' });
      return;
    }

    // Cập nhật lại thông tin đơn hàng sau khi sửa
    const item = await orderDetailService.getOrderDetailById(id);
    if (item) {
      reply.send(item); // Trả về chi tiết order sau khi cập nhật
    } else {
      reply.status(404).send({ error: 'Order detail not found after update' });
    }
  } catch (err) {
    console.error('Error updating order detail:', err.message);
    reply.status(500).send({ error: 'Internal Server Error' });
  }
}

async function deleteOrderDetail(req, reply) {
  const id = req.params.id;

  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    reply.status(400).send({ error: 'Invalid ID format' });
    return;
  }

  try {
    const orderDetail = await orderDetailService.getOrderDetailById(id);
    if (!orderDetail) {
      reply.status(404).send({ error: 'Order detail not found' });
      return;
    }

    const deleted = await orderDetailService.deleteOrderDetail(id);
    reply.send({ success: true, message: 'Order detail deleted successfully', deleted });
  } catch (err) {
    console.error('Error deleting order detail:', err.message);
    reply.status(500).send({ error: 'Internal Server Error' });
  }
}

module.exports = {
  getAll,
  getOne,
  getByOrder,
  createOrderDetail,
  updateOrderDetail,
  deleteOrderDetail,
};
