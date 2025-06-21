/**
 * Script tạo tài khoản admin mặc định
 */
const mongoose = require('mongoose');
const User = require('../model/user.model');

// Kết nối với cơ sở dữ liệu MongoDB
const connectToDB = async () => {
  try {
    // Sử dụng biến môi trường hoặc URL MongoDB thực tế của bạn
    await mongoose.connect('mongodb://localhost:27017/fastify', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Kết nối thành công với MongoDB.');
  } catch (error) {
    console.error('Kết nối thất bại:', error.message);
    process.exit(1);
  }
};

// Tạo tài khoản admin
const createAdmin = async () => {
  try {
    // Kiểm tra xem đã tồn tại admin chưa
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      console.log('Tài khoản admin đã tồn tại:', existingAdmin.username);
      process.exit(0);
    }

    // Thông tin tài khoản admin mặc định
    const adminData = {
      username: 'admin',
      email: 'admin@example.com',
      password: '123456',  // Mật khẩu mặc định
      full_name: 'Administrator',
      role: 'admin',
      status: 1
    };

    // Tạo tài khoản admin
    const admin = new User(adminData);
    await admin.save();
    
    console.log('Tạo tài khoản admin thành công:');
    console.log('- Username: admin');
    console.log('- Password: 123456');
    console.log('- Email: admin@example.com');
    
    process.exit(0);
  } catch (error) {
    console.error('Lỗi khi tạo admin:', error.message);
    process.exit(1);
  }
};

// Thực thi tạo admin
const run = async () => {
  await connectToDB();
  await createAdmin();
};

run();