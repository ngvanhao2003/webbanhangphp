// Script seed du lieu mau cho payment
const mongoose = require('mongoose');
const Payment = require('../model/payment.model');
const User = require('../model/user.model');
const Order = require('../model/order.model');

async function connectToDB() {
  await mongoose.connect('mongodb://localhost:27017/fastify', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  console.log('Da ket noi MongoDB thanh cong!');
}

async function seedPayments() {
  // Lay 3 user va 5 order mau
  const users = await User.find({}).limit(3);
  const orders = await Order.find({}).limit(5);
  if (users.length === 0 || orders.length === 0) {
    console.log('Chua co user hoac order trong database!');
    process.exit(1);
  }

  // Xoa payment cu
  await Payment.deleteMany({});

  // Cac phuong thuc va trang thai mau
  const methods = ['cash', 'credit_card', 'bank_transfer', 'vnpay', 'momo'];
  const statuses = ['pending', 'processing', 'completed', 'failed', 'refunded'];

  // Tao 10 payment mau
  const payments = [];
  for (let i = 0; i < 10; i++) {
    const user = users[i % users.length];
    const order = orders[i % orders.length];
    payments.push({
      order_id: order._id,
      user_id: user._id,
      amount: Math.floor(Math.random() * 2000000) + 100000,
      currency: 'VND',
      payment_method: methods[i % methods.length],
      payment_status: statuses[i % statuses.length],
      transaction_id: `TXN${Date.now()}${i}`,
      payment_date: new Date(Date.now() - Math.floor(Math.random() * 1000000000)),
      note: `Payment sample #${i + 1}`
    });
  }
  await Payment.insertMany(payments);
  console.log('Da seed du lieu payment mau thanh cong!');
}

async function main() {
  await connectToDB();
  await seedPayments();
  process.exit();
}

main();
