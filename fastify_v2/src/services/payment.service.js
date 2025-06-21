const Payment = require('../model/payment.model');
const Order = require('../model/order.model');
const crypto = require('crypto');
const axios = require('axios');


// Cấu hình VNPay
const vnpConfig = {
  vnp_TmnCode: 'D7LH2RJD',  // Thay bằng mã thực tế
  vnp_HashSecret: '933HRSG93EA66WHAWBVL053ZDK8CJEM3',  // Thay bằng secret key thực tế
  vnp_Url: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
  vnp_ReturnUrl: 'http://localhost:3000/api/payment/vnpay-return'
};

// Cấu hình MoMo
const momoConfig = {
  partnerCode: "MOMO",    // Thay bằng mã đối tác thực tế của bạn
  accessKey: "F8BBA842ECF85", // Thay bằng Access Key thực tế của bạn
  secretKey: "K951B6PE1waDMi640xX08PD3vg6EkVlz",  // Thay bằng Secret Key thực tế của bạn
  momoApiUrl: "https://test-payment.momo.vn/v2/gateway/api/create", // URL API MoMo
  redirectUrl: "http://localhost:3000/payment/momo-return", // Đặt về backend
  ipnUrl: "http://localhost:3000/api/payment/momo-ipn", // URL nhận kết quả IPN
};

class PaymentService {

  // ------- MoMo -------
  async createMomoPaymentUrl(order, paymentData) {
    const { partnerCode, accessKey, secretKey, momoApiUrl, redirectUrl, ipnUrl } = momoConfig;
    const orderInfo = `Thanh toán đơn hàng #${order._id.toString()}`;
    const orderId = `${order._id.toString()}_${Date.now()}`;
    const requestId = orderId;

    const userId = order.user_id;
    if (!userId) throw new Error("user_id is required in the order");

    const requestData = {
      partnerCode,
      partnerName: "Test",
      storeId: "MomoTestStore",
      requestId,
      amount: paymentData.amount,
      orderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      lang: "vi",
      extraData: "",
      requestType: "captureWallet"
    };

    const message = `accessKey=${accessKey}&amount=${requestData.amount}&extraData=${requestData.extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestData.requestType}`;
    const signature = crypto
      .createHmac("sha256", secretKey)
      .update(message)
      .digest("hex");

    requestData.signature = signature;

    const response = await axios.post(momoApiUrl, requestData);

    if (response.data.resultCode === 0) {
      const newPayment = {
        order_id: order._id,
        user_id: userId,
        amount: paymentData.amount,
        currency: 'VND',
        payment_method: 'momo',
        payment_status: 'pending',
        transaction_id: orderId,
        transaction_data: { ...requestData, ...response.data },
        payment_date: new Date(),
        note: 'Thanh toán qua cổng MoMo'
      };

      await this.createPayment(newPayment); // Lưu giao dịch vào cơ sở dữ liệu
      return response.data; // Trả về toàn bộ response MoMo
    } else {
      throw new Error(`Lỗi từ MoMo: ${response.data.message}`);
    }
  }

  // Xử lý trả về MoMo
  async processMomoReturn(momoParams) {
    const { orderId, resultCode } = momoParams;

    if (resultCode === '0') {
      const payment = await Payment.findOne({ transaction_id: orderId });
      if (payment) {
        payment.payment_status = 'completed';
        payment.payment_date = new Date();
        await payment.save();

        const order = await Order.findById(payment.order_id);
        if (order) {
          order.paymentStatus = 'paid';
          try {
            await order.save();
            console.log('Order đã cập nhật paymentStatus:', order.paymentStatus);
          } catch (err) {
            console.error('Lỗi khi lưu order:', err);
          }
        }
      }
      return { success: true, payment };
    } else {
      const payment = await Payment.findOne({ transaction_id: orderId });
      if (payment) {
        payment.payment_status = 'failed';
        await payment.save();
      }
      return { success: false, payment };
    }
  }
  // Tạo URL thanh toán VNPay
  async createVnpayPaymentUrl(order, paymentData, ipAddr) {
    if (!order || !order._id) throw new Error('Order không hợp lệ');
    if (!order.user_id) throw new Error('Order chưa có user_id');
    if (!paymentData.amount || paymentData.amount <= 0) throw new Error('Số tiền không hợp lệ');

    let payment = await Payment.findOne({ order_id: order._id, payment_method: 'vnpay' });
    if (!payment) {
      payment = await Payment.create({
        order_id: order._id,
        user_id: order.user_id,
        amount: paymentData.amount,
        currency: 'VND',
        payment_method: 'vnpay',
        payment_status: 'pending'
      });
    }

    // Định dạng ngày giờ
    const pad2 = n => n.toString().padStart(2, '0');
    const date = new Date();
    const createDate = `${date.getFullYear()}${pad2(date.getMonth() + 1)}${pad2(date.getDate())}${pad2(date.getHours())}${pad2(date.getMinutes())}${pad2(date.getSeconds())}`;

    // Các tham số VNPay
    const params = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: vnpConfig.vnp_TmnCode,
      vnp_Amount: (payment.amount * 100).toString(),
      vnp_CurrCode: 'VND',
      vnp_TxnRef: payment._id.toString(),
      vnp_OrderInfo: `Order_${order._id}`,
      vnp_OrderType: 'other',
      vnp_Locale: 'vn',
      vnp_ReturnUrl: vnpConfig.vnp_ReturnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate
    };

    // Tạo chữ ký hợp lệ
    const sortedKeys = Object.keys(params).sort();
    const signData = sortedKeys.map(key => `${key}=${params[key]}`).join('&');
    
    // Log signData để debug
    console.log('[DEBUG] signData:', signData);

    const secureHash = crypto.createHmac('sha512', vnpConfig.vnp_HashSecret)
      .update(signData, 'utf-8').digest('hex');

    console.log('[DEBUG] secureHash:', secureHash);

    // Tạo URL thanh toán
    const urlParams = sortedKeys.map(key => `${key}=${encodeURIComponent(params[key])}`).join('&');
    return `${vnpConfig.vnp_Url}?${urlParams}&vnp_SecureHash=${secureHash}`;
  }

  // Xử lý phản hồi VNPay
  async processVnpayReturn(vnpParams) {
    const { vnp_SecureHash, vnp_SecureHashType, ...params } = vnpParams;
    const sortedKeys = Object.keys(params).sort();
    const signData = sortedKeys.map(key => `${key}=${params[key]}`).join('&');
    
    console.log('[DEBUG] Received signData:', signData);

    const hashCheck = crypto.createHmac('sha512', vnpConfig.vnp_HashSecret)
      .update(signData, 'utf-8')
      .digest('hex');

    console.log('[DEBUG] VNPay Signature:', vnp_SecureHash);
    console.log('[DEBUG] Local Hash:', hashCheck);

    if (hashCheck.toLowerCase() !== String(vnp_SecureHash).toLowerCase()) {
      return { success: false, message: 'Checksum không hợp lệ!' };
    }

    const paymentId = params.vnp_TxnRef;
    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return { success: false, message: 'Không tìm thấy giao dịch' };
    }

    const payment_status = params.vnp_ResponseCode === '00' ? 'completed' : 'failed';
    payment.payment_status = payment_status;
    payment.transaction_id = params.vnp_TransactionNo;
    payment.payment_date = new Date();
    payment.vnpay = { ...params, vnp_SecureHash };

    await payment.save();

    if (payment_status === 'completed') {
      const order = await Order.findById(payment.order_id);
      if (order) {
        order.paymentStatus = 'paid'; // Sửa đúng tên trường
        await order.save();
      }
    }

    return { success: payment_status === 'completed', payment };
  }

  // Lấy thông tin thanh toán
  async getPaymentById(id) {
    const payment = await Payment.findById(id)
      .populate('order_id', 'order_number total_amount')
      .populate('user_id', 'username email');
    if (!payment) throw new Error('Không tìm thấy giao dịch thanh toán');
    return payment;
  }

  // Cập nhật trạng thái thanh toán
  async updatePaymentStatus(id, updateData) {
    const payment = await Payment.findById(id);
    if (!payment) throw new Error('Không tìm thấy giao dịch thanh toán');

    payment.payment_status = updateData.payment_status;
    payment.transaction_data = updateData.transaction_data || payment.transaction_data;
    payment.payment_date = updateData.payment_date || payment.payment_date;
    payment.note = updateData.note || payment.note;

    await payment.save();

    if (updateData.payment_status === 'completed') {
      const order = await Order.findById(payment.order_id);
      if (order) {
        order.paymentStatus = 'paid'; // Sửa đúng tên trường
        await order.save();
      }
    } else if (['failed', 'cancelled'].includes(updateData.payment_status)) {
      const order = await Order.findById(payment.order_id);
      if (order) {
        order.paymentStatus = 'unpaid'; // Sửa đúng tên trường
        await order.save();
      }
    }

    return payment;
  }

  async createPayment(paymentData) {
    try {
      // Tạo mới giao dịch thanh toán
      const payment = new Payment(paymentData);
      await payment.save();
      return payment;  // Trả về payment đã lưu
    } catch (error) {
      throw new Error(`Lỗi khi tạo giao dịch thanh toán: ${error.message}`);
    }
  }
}

module.exports = new PaymentService();
