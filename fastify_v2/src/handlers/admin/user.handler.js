const User = require('../../model/user.model');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { saveFile } = require('../../routes/uploads/schema/uploadFile');

/**
 * Lấy danh sách tất cả người dùng với phân trang, tìm kiếm và hỗ trợ lọc theo trạng thái xóa
 */
async function getAllUsers(request, reply) {
  try {
    const { page = 1, limit = 10, search, deleted = false } = request.query;
    const skip = (page - 1) * limit;
    
    // Xây dựng điều kiện tìm kiếm
    let query = {};
    
    // Thêm điều kiện tìm kiếm nếu có
    if (search) {
      query.$or = [
        { full_name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter theo trạng thái xóa
    if (deleted) {
      query.deleted = true;
    } else {
      query.deleted = { $ne: true };
    }
    
    // Đếm tổng số bản ghi theo điều kiện
    const totalUsers = await User.countDocuments(query);
    
    // Lấy danh sách người dùng theo điều kiện với phân trang
    const users = await User.find(query)
      .select('-password')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    const totalPages = Math.ceil(totalUsers / limit);
    
    return {
      users: users.map(user => {
        const userWithId = {
          ...user,
          id: user._id
        };
        
        // Ensure avatar is properly provided
        if (!userWithId.avatar) {
          userWithId.avatar = '/images/users/default-avatar.png';
        }
        
        return userWithId;
      }),
      totalUsers,
      totalPages,
      currentPage: parseInt(page)
    };
  } catch (error) {
    request.log.error(`Error fetching users: ${error.message}`);
    return reply.code(500).send({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'Có lỗi xảy ra khi lấy danh sách người dùng'
    });
  }
}

/**
 * Lấy thông tin chi tiết một người dùng theo ID
 */
async function getUserById(request, reply) {
  try {
    const { id } = request.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return reply.code(400).send({ 
        statusCode: 400,
        error: 'Bad Request',
        message: 'ID người dùng không hợp lệ'
      });
    }
    
    const user = await User.findById(id).select('-password').lean();
    
    if (!user) {
      return reply.code(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: 'Không tìm thấy người dùng'
      });
    }
    
    // Chuyển đổi _id thành id để đồng nhất
    user.id = user._id;
    
    return user;
  } catch (error) {
    request.log.error(`Error getting user: ${error.message}`);
    return reply.code(500).send({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'Có lỗi xảy ra khi lấy thông tin người dùng'
    });
  }
}

/**
 * Tạo người dùng mới (với hỗ trợ upload avatar)
 */
async function createUser(request, reply) {
  try {
    // Xử lý dữ liệu multipart form
    let userData = {};
    let avatarFile = null;
    
    // Kiểm tra xem có phải multipart form không
    if (request.isMultipart()) {
      const parts = request.parts();
      
      for await (const part of parts) {
        if (part.type === 'file' && part.fieldname === 'avatar' && part.file) {
          // Xử lý file avatar
          avatarFile = part;
          try {
            // Lưu file vào thư mục uploads
            const avatarUrl = await saveFile(part, 'users');
            userData.avatar = avatarUrl;
          } catch (fileError) {
            request.log.error(`Error saving avatar: ${fileError.message}`);
            // Nếu lỗi, dùng avatar mặc định
            userData.avatar = '/images/users/default-avatar.png';
          }
        } else {
          // Lưu trữ các trường dữ liệu khác
          userData[part.fieldname] = part.value;
        }
      }
    } else {
      userData = request.body;
    }
    
    // Kiểm tra xem email hoặc username đã tồn tại chưa
    const existingUser = await User.findOne({
      $or: [
        { email: userData.email },
        { username: userData.username }
      ]
    });
    
    if (existingUser) {
      return reply.code(409).send({
        statusCode: 409,
        error: 'Conflict',
        message: 'Email hoặc tên đăng nhập đã tồn tại'
      });
    }
    
    // Tạo người dùng mới
    const newUser = new User({
      username: userData.username,
      email: userData.email,
      password: userData.password,
      full_name: userData.name,
      role: userData.role || 'user',
      status: userData.status !== undefined ? parseInt(userData.status) : 1
    });
    
    if (userData.phone) newUser.phone = userData.phone;
    if (userData.address) newUser.address = userData.address;
    if (userData.avatar) newUser.avatar = userData.avatar;
    
    const savedUser = await newUser.save();
    
    // Trả về thông tin người dùng đã tạo (không có mật khẩu)
    const userToReturn = savedUser.toObject();
    delete userToReturn.password;
    userToReturn.id = userToReturn._id;
    
    // Đảm bảo avatar URL đầy đủ
    if (userToReturn.avatar && !userToReturn.avatar.startsWith('http')) {
      // Avatar đã được lưu với đường dẫn tương đối trên server
      // Khi client hiển thị sẽ tự nối với base URL
    }
    
    return reply.code(201).send(userToReturn);
  } catch (error) {
    request.log.error(`Error creating user: ${error.message}`);
    return reply.code(500).send({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'Có lỗi xảy ra khi tạo người dùng'
    });
  }
}

/**
 * Cập nhật thông tin người dùng (với hỗ trợ upload avatar)
 */
async function updateUser(request, reply) {
  try {
    const { id } = request.params;
    let updateData = {};
    let avatarFile = null;
    
    // Xử lý dữ liệu multipart form
    if (request.isMultipart()) {
      const parts = request.parts();
      
      for await (const part of parts) {
        if (part.type === 'file' && part.fieldname === 'avatar' && part.file) {
          // Xử lý file avatar
          avatarFile = part;
          try {
            // Lưu file vào thư mục uploads
            const avatarUrl = await saveFile(part, 'users');
            updateData.avatar = avatarUrl;
          } catch (fileError) {
            request.log.error(`Error saving avatar: ${fileError.message}`);
            // Nếu lỗi, không cập nhật avatar
          }
        } else {
          // Lưu trữ các trường dữ liệu khác
          updateData[part.fieldname] = part.value;
        }
      }
    } else {
      updateData = request.body;
    }
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return reply.code(400).send({ 
        statusCode: 400,
        error: 'Bad Request',
        message: 'ID người dùng không hợp lệ'
      });
    }
    
    // Kiểm tra người dùng tồn tại
    const user = await User.findById(id);
    
    if (!user) {
      return reply.code(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: 'Không tìm thấy người dùng'
      });
    }
    
    // Kiểm tra trùng lặp email nếu email được cập nhật
    if (updateData.email && updateData.email !== user.email) {
      const existingEmail = await User.findOne({ email: updateData.email, _id: { $ne: id } });
      
      if (existingEmail) {
        return reply.code(409).send({
          statusCode: 409,
          error: 'Conflict',
          message: 'Email đã tồn tại'
        });
      }
    }
    
    // Cập nhật thông tin người dùng
    if (updateData.name) user.full_name = updateData.name;
    if (updateData.email) user.email = updateData.email;
    if (updateData.role) user.role = updateData.role;
    if (updateData.status !== undefined) user.status = parseInt(updateData.status);
    if (updateData.phone) user.phone = updateData.phone;
    if (updateData.address) user.address = updateData.address;
    
    // Cập nhật mật khẩu nếu có
    if (updateData.password && updateData.password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(updateData.password, salt);
    }
    
    // Cập nhật avatar nếu có
    if (updateData.avatar) {
      // Nếu đã xử lý file ở trên và có đường dẫn mới
      user.avatar = updateData.avatar;
    }
    
    user.updated_at = new Date();
    
    const updatedUser = await user.save();
    
    // Trả về thông tin người dùng đã cập nhật (không có mật khẩu)
    const userToReturn = updatedUser.toObject();
    delete userToReturn.password;
    userToReturn.id = userToReturn._id;
    
    // Đảm bảo avatar URL đầy đủ
    if (userToReturn.avatar && !userToReturn.avatar.startsWith('http')) {
      // Avatar đã được lưu với đường dẫn tương đối trên server
      // Khi client hiển thị sẽ tự nối với base URL
    }
    
    return userToReturn;
  } catch (error) {
    request.log.error(`Error updating user: ${error.message}`);
    return reply.code(500).send({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'Có lỗi xảy ra khi cập nhật người dùng'
    });
  }
}

/**
 * Xóa người dùng (xóa mềm - soft delete)
 */
async function softDeleteUser(request, reply) {
  try {
    const { id } = request.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return reply.code(400).send({ 
        statusCode: 400,
        error: 'Bad Request',
        message: 'ID người dùng không hợp lệ'
      });
    }
    
    const user = await User.findById(id);
    
    if (!user) {
      return reply.code(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: 'Không tìm thấy người dùng'
      });
    }
    
    // Không cho phép xóa admin cuối cùng
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin', deleted: { $ne: true } });
      if (adminCount <= 1) {
        return reply.code(403).send({
          statusCode: 403,
          error: 'Forbidden',
          message: 'Không thể xóa người dùng admin cuối cùng'
        });
      }
    }
    
    // Thực hiện xóa mềm
    user.deleted = true;
    user.deleted_at = new Date();
    user.status = 0; // Vô hiệu hóa tài khoản
    
    await user.save();
    
    return { success: true, message: 'Đã xóa người dùng' };
  } catch (error) {
    request.log.error(`Error deleting user: ${error.message}`);
    return reply.code(500).send({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'Có lỗi xảy ra khi xóa người dùng'
    });
  }
}

/**
 * Xóa vĩnh viễn người dùng
 */
async function hardDeleteUser(request, reply) {
  try {
    const { id } = request.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return reply.code(400).send({ 
        statusCode: 400,
        error: 'Bad Request',
        message: 'ID người dùng không hợp lệ'
      });
    }
    
    const user = await User.findById(id);
    
    if (!user) {
      return reply.code(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: 'Không tìm thấy người dùng'
      });
    }
    
    // Không cho phép xóa vĩnh viễn admin cuối cùng
    if (user.role === 'admin' && !user.deleted) {
      const adminCount = await User.countDocuments({ role: 'admin', deleted: { $ne: true } });
      if (adminCount <= 1) {
        return reply.code(403).send({
          statusCode: 403,
          error: 'Forbidden',
          message: 'Không thể xóa người dùng admin cuối cùng'
        });
      }
    }
    
    // Thực hiện xóa vĩnh viễn
    await User.findByIdAndDelete(id);
    
    return { success: true, message: 'Đã xóa vĩnh viễn người dùng' };
  } catch (error) {
    request.log.error(`Error permanently deleting user: ${error.message}`);
    return reply.code(500).send({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'Có lỗi xảy ra khi xóa vĩnh viễn người dùng'
    });
  }
}

/**
 * Khôi phục người dùng đã xóa mềm
 */
async function restoreUser(request, reply) {
  try {
    const { id } = request.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return reply.code(400).send({ 
        statusCode: 400,
        error: 'Bad Request',
        message: 'ID người dùng không hợp lệ'
      });
    }
    
    const user = await User.findById(id);
    
    if (!user) {
      return reply.code(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: 'Không tìm thấy người dùng'
      });
    }
    
    if (!user.deleted) {
      return reply.code(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Người dùng chưa bị xóa'
      });
    }
    
    // Khôi phục người dùng
    user.deleted = false;
    user.deleted_at = undefined;
    user.status = 1; // Kích hoạt lại tài khoản
    
    await user.save();
    
    return { success: true, message: 'Đã khôi phục người dùng' };
  } catch (error) {
    request.log.error(`Error restoring user: ${error.message}`);
    return reply.code(500).send({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'Có lỗi xảy ra khi khôi phục người dùng'
    });
  }
}

/**
 * Thay đổi trạng thái người dùng (kích hoạt/vô hiệu hóa)
 */
async function toggleUserStatus(request, reply) {
  try {
    const { id } = request.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return reply.code(400).send({ 
        statusCode: 400,
        error: 'Bad Request',
        message: 'ID người dùng không hợp lệ'
      });
    }
    
    const user = await User.findById(id);
    
    if (!user) {
      return reply.code(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: 'Không tìm thấy người dùng'
      });
    }
    
    // Không cho phép vô hiệu hóa admin cuối cùng
    if (user.role === 'admin' && user.status === 1) {
      const activeAdmins = await User.countDocuments({ 
        role: 'admin',
        status: 1,
        deleted: { $ne: true }
      });
      
      if (activeAdmins <= 1) {
        return reply.code(403).send({
          statusCode: 403,
          error: 'Forbidden',
          message: 'Không thể vô hiệu hóa người dùng admin cuối cùng'
        });
      }
    }
    
    // Đảo ngược trạng thái
    user.status = user.status === 1 ? 0 : 1;
    user.updated_at = new Date();
    
    await user.save();
    
    return {
      success: true,
      message: user.status === 1 ? 'Đã kích hoạt người dùng' : 'Đã vô hiệu hóa người dùng',
      status: user.status
    };
  } catch (error) {
    request.log.error(`Error toggling user status: ${error.message}`);
    return reply.code(500).send({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'Có lỗi xảy ra khi thay đổi trạng thái người dùng'
    });
  }
}

/**
 * Khôi phục nhiều người dùng
 */
async function restoreMultipleUsers(request, reply) {
  try {
    const { userIds } = request.body;
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return reply.code(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Danh sách ID người dùng không hợp lệ'
      });
    }
    
    // Lọc ra các ID hợp lệ
    const validIds = userIds.filter(id => mongoose.Types.ObjectId.isValid(id));
    
    if (validIds.length === 0) {
      return reply.code(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Không có ID người dùng nào hợp lệ'
      });
    }
    
    // Khôi phục các người dùng
    const result = await User.updateMany(
      { _id: { $in: validIds }, deleted: true },
      { $set: { deleted: false, status: 1, updated_at: new Date() }, $unset: { deleted_at: "" } }
    );
    
    return {
      success: true,
      message: `Đã khôi phục ${result.nModified} người dùng`,
      restored: result.nModified
    };
  } catch (error) {
    request.log.error(`Error restoring multiple users: ${error.message}`);
    return reply.code(500).send({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'Có lỗi xảy ra khi khôi phục danh sách người dùng'
    });
  }
}

/**
 * Xóa mềm nhiều người dùng
 */
async function softDeleteMultipleUsers(request, reply) {
  try {
    const { userIds } = request.body;
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return reply.code(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Danh sách ID người dùng không hợp lệ'
      });
    }
    
    // Lọc ra các ID hợp lệ
    const validIds = userIds.filter(id => mongoose.Types.ObjectId.isValid(id));
    
    if (validIds.length === 0) {
      return reply.code(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Không có ID người dùng nào hợp lệ'
      });
    }
    
    // Kiểm tra xem có admin hoạt động cuối cùng trong danh sách không
    const activeAdminCount = await User.countDocuments({
      role: 'admin',
      deleted: { $ne: true }
    });
    
    if (activeAdminCount <= validIds.length) {
      // Kiểm tra xem có bao nhiêu admin trong danh sách xóa
      const adminsToDelete = await User.countDocuments({
        _id: { $in: validIds },
        role: 'admin',
        deleted: { $ne: true }
      });
      
      if (adminsToDelete >= activeAdminCount) {
        return reply.code(403).send({
          statusCode: 403,
          error: 'Forbidden',
          message: 'Không thể xóa tất cả các tài khoản admin'
        });
      }
    }
    
    // Thực hiện xóa mềm
    const result = await User.updateMany(
      { _id: { $in: validIds }, deleted: { $ne: true } },
      { $set: { deleted: true, deleted_at: new Date(), status: 0, updated_at: new Date() } }
    );
    
    return {
      success: true,
      message: `Đã xóa ${result.nModified} người dùng`,
      deleted: result.nModified
    };
  } catch (error) {
    request.log.error(`Error soft deleting multiple users: ${error.message}`);
    return reply.code(500).send({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'Có lỗi xảy ra khi xóa danh sách người dùng'
    });
  }
}

/**
 * Xóa vĩnh viễn nhiều người dùng
 */
async function hardDeleteMultipleUsers(request, reply) {
  try {
    const { userIds } = request.body;
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return reply.code(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Danh sách ID người dùng không hợp lệ'
      });
    }
    
    // Lọc ra các ID hợp lệ
    const validIds = userIds.filter(id => mongoose.Types.ObjectId.isValid(id));
    
    if (validIds.length === 0) {
      return reply.code(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Không có ID người dùng nào hợp lệ'
      });
    }
    
    // Kiểm tra các tài khoản admin chưa xóa mềm
    const activeAdminIds = await User.find({
      _id: { $in: validIds },
      role: 'admin',
      deleted: { $ne: true }
    }).select('_id');
    
    if (activeAdminIds.length > 0) {
      // Kiểm tra xem có bao nhiêu admin còn lại
      const activeAdminCount = await User.countDocuments({
        role: 'admin',
        deleted: { $ne: true }
      });
      
      if (activeAdminIds.length >= activeAdminCount) {
        return reply.code(403).send({
          statusCode: 403,
          error: 'Forbidden',
          message: 'Không thể xóa tất cả các tài khoản admin'
        });
      }
    }
    
    // Thực hiện xóa vĩnh viễn
    const result = await User.deleteMany({ _id: { $in: validIds } });
    
    return {
      success: true,
      message: `Đã xóa vĩnh viễn ${result.deletedCount} người dùng`,
      deleted: result.deletedCount
    };
  } catch (error) {
    request.log.error(`Error hard deleting multiple users: ${error.message}`);
    return reply.code(500).send({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'Có lỗi xảy ra khi xóa vĩnh viễn danh sách người dùng'
    });
  }
}

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  softDeleteUser,
  hardDeleteUser,
  restoreUser,
  toggleUserStatus,
  restoreMultipleUsers,
  softDeleteMultipleUsers,
  hardDeleteMultipleUsers
};
