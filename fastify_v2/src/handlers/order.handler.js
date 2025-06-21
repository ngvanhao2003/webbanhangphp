const orderService = require('../services/order.service');

// Lấy lịch sử đơn hàng của người dùng
async function getOrderHistory(request, reply) {
    const { userId } = request.params;
    console.log('Received userId:', userId);  // Log ra để kiểm tra

    try {
      const orders = await orderService.getOrdersByUserId(userId);
      if (orders.length === 0) {
        return reply.code(404).send({ message: 'Order not found' });
      }
      return reply.code(200).send({ orders });
    } catch (error) {
      console.error('Error:', error);
      return reply.code(500).send({ message: 'Lỗi khi lấy đơn hàng' });
    }
}

function getAll(req, res) {
    orderService.getAllOrders()
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            console.error('Database error:', err);
            res.status(500).send({ error: 'Internal Server Error' });
        });
}

function getOne(req, res) {
    const id = req.params.id;
    
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        res.status(400).send({ error: 'Invalid ID format' });
        return;
    }
    
    orderService.getOrderById(id)
        .then((result) => {
            if (!result) {
                res.status(404).send({ error: 'Order not found' });
                return;
            }
            res.send(result);
        })
        .catch((err) => {
            console.error('Database error:', err);
            res.status(500).send({ error: 'Internal Server Error' });
        });
}

// API tạo đơn hàng, luôn lấy user_id từ request.user (gắn bởi authenticate)
async function createOrder(request, reply) {
  try {
    const userId = request.user?._id || request.user?.id; // lấy từ token
    if (!userId) {
      return reply.code(401).send({ error: 'Bạn chưa đăng nhập!' });
    }
    // Lấy data từ body, KHÔNG lấy user_id từ client
    const { customer, items, totalAmount, paymentMethod, ...rest } = request.body;
    const orderData = {
      user_id: userId, // Gắn user đăng nhập
      customer,
      items,
      totalAmount,
      paymentMethod,
      ...rest
    };
    // Gọi service để tạo order
    const result = await orderService.createOrder(orderData);
    const item = await orderService.getOrderById(result._id);
    if (item) {
      return reply.code(201).send(item);
    } else {
      return reply.code(404).send({ error: 'Order not found' });
    }
  } catch (err) {
    request.log.error('Error creating order:', err);
    return reply.code(400).send({ error: err.message || 'Error creating order' });
  }
}


async function updateOrderStatus(req, res) {
  const id = req.params.id;
  const { status } = req.body;

  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).send({ error: "Invalid ID format" });
  }

  const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
  if (!validStatuses.includes(status)) {
    return res.status(400).send({ error: "Invalid status value" });
  }

  try {
    // Cập nhật trạng thái đơn hàng
    const updatedOrder = await orderService.updateOrderStatus(id, status);
    if (!updatedOrder) {
      return res.status(404).send({ error: "Order not found" });
    }

    // Nếu trạng thái là 'delivered', tự động cập nhật trạng thái thanh toán 'paid'
    if (status === "delivered") {
      await orderService.updatePaymentStatus(id, "paid");
    }

    // Lấy lại dữ liệu đơn hàng mới nhất
    const order = await orderService.getOrderById(id);
    if (!order) {
      return res.status(404).send({ error: "Order not found after update" });
    }

    return res.send(order);
  } catch (err) {
    console.error("Error updating order status:", err.message);
    return res.status(500).send({ error: "Internal Server Error" });
  }
}


function updatePaymentStatus(req, res) {
    const id = req.params.id;
    const { paymentStatus } = req.body;

    // Validate ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        res.status(400).send({ error: 'Invalid ID format' });
        return;
    }

    // Check if payment status is valid
    const validPaymentStatuses = ['pending', 'paid', 'failed', 'refunded'];
    if (!validPaymentStatuses.includes(paymentStatus)) {
        res.status(400).send({ error: 'Invalid payment status value' });
        return;
    }

    // Call service to update payment status
    orderService.updatePaymentStatus(id, paymentStatus)
        .then((updatedOrder) => {
            if (!updatedOrder) {
                res.status(404).send({ error: 'Order not found' });
                return;
            }

            // Get updated order information
            return orderService.getOrderById(id);
        })
        .then((item) => {
            if (item) {
                res.send(item);
            } else {
                res.status(404).send({ error: 'Order not found after update' });
            }
        })
        .catch((err) => {
            console.error('Error updating payment status:', err.message);
            res.status(500).send({ error: 'Internal Server Error' });
        });
}

function updateOrder(req, res) {
    const id = req.params.id;
    const data = req.body;

    // Validate ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        res.status(400).send({ error: 'Invalid ID format' });
        return;
    }

    // Call service to update order
    orderService.updateOrder(id, data)
        .then((updatedOrder) => {
            if (!updatedOrder) {
                res.status(404).send({ error: 'Order not found' });
                return;
            }

            // Get updated order information
            return orderService.getOrderById(id);
        })
        .then((item) => {
            if (item) {
                res.send(item);
            } else {
                res.status(404).send({ error: 'Order not found after update' });
            }
        })
        .catch((err) => {
            console.error('Error updating order:', err.message);
            res.status(500).send({ error: 'Internal Server Error' });
        });
}

function deleteOrder(req, res) {
    const id = req.params.id;

    // Validate ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        res.status(400).send({ error: 'Invalid ID format' });
        return;
    }

    // Check if order exists before deleting
    orderService.getOrderById(id)
        .then((order) => {
            if (!order) {
                res.status(404).send({ error: 'Order not found' });
                return;
            }

            // If order exists, proceed with deletion
            return orderService.deleteOrder(id);
        })
        .then((deleted) => {
            if (deleted) {
                res.send({ 
                    success: true,
                    message: 'Order deleted successfully', 
                    deleted 
                });
            }
        })
        .catch((err) => {
            console.error('Error deleting order:', err.message);
            res.status(500).send({ error: 'Internal Server Error' });
        });
}

function getOrdersByDateRange(req, res) {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
        res.status(400).send({ error: 'Start date and end date are required' });
        return;
    }
    
    orderService.getOrdersByDateRange(startDate, endDate)
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            console.error('Database error:', err);
            res.status(500).send({ error: 'Internal Server Error' });
        });
}

// Lấy sản phẩm bán chạy nhất
async function getBestSellingProducts(req, res) {
  const limit = parseInt(req.query.limit) || 8;
  try {
    const products = await orderService.getBestSellingProducts(limit);
    res.send({ success: true, data: products });
  } catch (err) {
    console.error('Error fetching best-selling products:', err);
    res.status(500).send({ success: false, error: 'Internal Server Error' });
  }
}

module.exports = {
    getAll,
    getOne,
    createOrder,
    updateOrderStatus,
    updatePaymentStatus,
    updateOrder,
    deleteOrder,
    getOrdersByDateRange,
    getOrderHistory,
    getBestSellingProducts,
};