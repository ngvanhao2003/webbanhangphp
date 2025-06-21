const crypto = require('crypto');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const { findUserByEmail, updateUser } = require('./user.service');

// Cấu hình transporter SMTP Gmail
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // dùng SSL
  auth: {
    user: 'haocuaquakhu@gmail.com',     // Thay email thật
    pass: 'gtzgacyxbdlhwtth',       // Thay app password Gmail, KHÔNG DÙNG MẬT KHẨU CHÍNH
  },
});

/**
 * Tạo mật khẩu mới, hash, cập nhật DB và gửi email mật khẩu mới
 * @param {string} email
 * @returns {boolean|null} true nếu thành công, null nếu user không tồn tại
 */
async function resetPasswordAndSendEmail(email) {
  const user = await findUserByEmail(email);
  if (!user) return null;

  const newPassword = crypto.randomBytes(6).toString('hex'); // 12 ký tự hex
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await updateUser(user._id, { password: hashedPassword });

  const mailOptions = {
    from: '"Support" <haocuaquakhu@gmail.com>', // Thay bằng email của bạn
    to: user.email,
    subject: 'Mật khẩu mới của bạn',
    text: `Xin chào ${user.username},\n\nMật khẩu mới của bạn là: ${newPassword}\n\nVui lòng đăng nhập và đổi mật khẩu ngay.`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error('Lỗi gửi mail:', err);
    throw err; // ném lỗi ra ngoài để handler bắt
  }

  return true;
}

module.exports = {
  resetPasswordAndSendEmail,
};
