const User = require('../model/user.model');

// Tìm tất cả user
const getAllUsers = async () => {
  return await User.find({}).select('-password');
};

// Tìm user theo id
const getUserById = async (id, withPassword = false) => {
  if (withPassword) {
    return await User.findById(id); // lấy tất cả, bao gồm password
  }
  return await User.findById(id).select('-password');
};

// Tìm user theo username
const findUserByUsername = async (username) => {
  return await User.findOne({ username });
};

// Tìm user theo email
// const findUserByEmail = async (email) => {
//   return await User.findOne({ email });
// };

// Tìm user theo username hoặc email
const findUserByUsernameOrEmail = async (username, email) => {
  return await User.findOne({
    $or: [{ username }, { email }]
  });
};

// Tạo user mới
const createUser = async (userData) => {
  const user = new User(userData);
  await user.save();
  return user;
};

// Cập nhật user
// const updateUser = async (id, updates) => {
//   updates.updated_at = new Date();
//   return await User.findByIdAndUpdate(id, updates, { new: true }).select('-password');
// };

// Xóa user
const deleteUser = async (id) => {
  return await User.findByIdAndDelete(id).select('-password');
};

// So sánh mật khẩu
const verifyPassword = async (user, password) => {
  if (!user || !user.password) return false;
  return await user.comparePassword(password);
};

// Cập nhật last login
const updateLastLogin = async (id) => {
  return await User.findByIdAndUpdate(id, {
    last_login: new Date(),
    updated_at: new Date()
  });
};

// Tìm user theo token xác nhận email
const findUserByVerifyToken = async (token) => {
  return await User.findOne({ email_verify_token: token });
};

const findUserByEmail = async (email) => {
  return await User.findOne({ email });
};

// Cập nhật user theo id, cập nhật các trường (trong đó có thể có password đã hash)
const updateUser = async (id, updates) => {
  updates.updated_at = new Date();
  return await User.findByIdAndUpdate(id, updates, { new: true }).select('-password');
};

module.exports = {
  getAllUsers,
  getUserById,
  findUserByUsername,
  findUserByEmail,
  findUserByUsernameOrEmail,
  createUser,
  updateUser,
  deleteUser,
  verifyPassword,
  updateLastLogin,
  findUserByVerifyToken,
};
