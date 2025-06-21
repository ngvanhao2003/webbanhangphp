const userService = require('../services/user.service');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { resetPasswordAndSendEmail } = require('../services/auth.service');

// Get all users
const getAllUsers = async (request, reply) => {
  try {
    const users = await userService.getAllUsers();
    return users;
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'An unexpected error occurred'
    });
  }
};

// Get a single user by ID
const getOneUser = async (request, reply) => {
  try {
    const { id } = request.params;
    const user = await userService.getUserById(id);
    
    if (!user) {
      return reply.code(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: 'User not found'
      });
    }
    
    return user;
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'An unexpected error occurred'
    });
  }
};

// Create a new user
const createUser = async (request, reply) => {
  try {
    const userData = request.body;
    
    // Check if username or email already exists
    const existingUser = await userService.findUserByUsernameOrEmail(
      userData.username, 
      userData.email
    );
    
    if (existingUser) {
      return reply.code(409).send({
        statusCode: 409,
        error: 'Conflict',
        message: 'Username or email already exists'
      });
    }
    
    const newUser = await userService.createUser(userData);
    return reply.code(201).send(newUser);
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'An unexpected error occurred'
    });
  }
};

// Update a user
const updateUser = async (request, reply) => {
  try {
    const { id } = request.params;
    const updates = request.body;
    
    // Check if user exists
    const existingUser = await userService.getUserById(id);
    if (!existingUser) {
      return reply.code(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: 'User not found'
      });
    }
    
    // Check for unique constraints if updating username or email
    if (updates.username || updates.email) {
      const conflictingUser = await userService.findUserByUsernameOrEmail(
        updates.username || '', 
        updates.email || ''
      );
      
      if (conflictingUser && conflictingUser.id !== id) {
        return reply.code(409).send({
          statusCode: 409,
          error: 'Conflict',
          message: 'Username or email already in use'
        });
      }
    }
    
    const updatedUser = await userService.updateUser(id, updates);
    return updatedUser;
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'An unexpected error occurred'
    });
  }
};

// Delete a user
const deleteUser = async (request, reply) => {
  try {
    const { id } = request.params;
    
    // Check if user exists
    const existingUser = await userService.getUserById(id);
    if (!existingUser) {
      return reply.code(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: 'User not found'
      });
    }
    
    const deletedUser = await userService.deleteUser(id);
    return deletedUser;
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'An unexpected error occurred'
    });
  }
};

// User login
// const loginUser = async (request, reply) => {
//   try {
//     const { username, password } = request.body;
    
//     // Find user by username
//     const user = await userService.findUserByUsername(username);
    
//     if (!user) {
//       return reply.code(401).send({
//         statusCode: 401,
//         error: 'Unauthorized',
//         message: 'Invalid username or password'
//       });
//     }
    
//     // Verify password
//     const isValidPassword = await userService.verifyPassword(user, password);
    
//     if (!isValidPassword) {
//       return reply.code(401).send({
//         statusCode: 401,
//         error: 'Unauthorized',
//         message: 'Invalid username or password'
//       });
//     }
    
//     // Update last login timestamp
//     await userService.updateLastLogin(user.id);
    
//     // Generate JWT token
//     const token = jwt.sign(
//       { 
//         id: user.id,
//         username: user.username,
//         email: user.email,
//         role: user.role
//       },
//       'your_jwt_secret_key', // This should be in an environment variable
//       { expiresIn: '24h' }
//     );
    
//     return { 
//       token,
//       user: {
//         id: user.id,
//         username: user.username,
//         email: user.email,
//         full_name: user.full_name,
//         avatar: user.avatar,
//         role: user.role,
//         status: user.status
//       }
//     };
//   } catch (error) {
//     request.log.error(error);
//     return reply.code(500).send({
//       statusCode: 500,
//       error: 'Internal Server Error',
//       message: 'An unexpected error occurred'
//     });
//   }
// };
const loginUser = async (request, reply) => {
  try {
    const { username, password } = request.body;
    const user = await userService.findUserByUsername(username);
    
    if (!user) {
      return reply.code(401).send({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Invalid username or password'
      });
    }

    // Kiểm tra tài khoản đã kích hoạt chưa
    if (user.status !== 1 || user.email_verified !== true) {
      return reply.code(403).send({
        statusCode: 403,
        error: 'Forbidden',
        message: 'Tài khoản chưa được kích hoạt. Vui lòng xác nhận email trước khi đăng nhập.'
      });
    }
    
    const isValidPassword = await userService.verifyPassword(user, password);
    if (!isValidPassword) {
      return reply.code(401).send({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Invalid username or password'
      });
    }
    
    await userService.updateLastLogin(user.id);
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, role: user.role },
      'your_jwt_secret_key',
      { expiresIn: '24h' }
    );
    
    return { 
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        avatar: user.avatar,
        role: user.role,
        status: user.status
      }
    };
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'An unexpected error occurred'
    });
  }
};


// Public user registration (no auth required)
// const registerUser = async (request, reply) => {
//   try {
//     const userData = request.body;
//     // Force role to 'user' regardless of input
//     userData.role = 'user';
//     // Check if username or email already exists
//     const existingUser = await userService.findUserByUsernameOrEmail(
//       userData.username,
//       userData.email
//     );
//     if (existingUser) {
//       return reply.code(409).send({
//         statusCode: 409,
//         error: 'Conflict',
//         message: 'Username or email already exists'
//       });
//     }
//     const newUser = await userService.createUser(userData);
//     // Remove password from response (already handled by model, but for safety)
//     const userObj = newUser.toObject ? newUser.toObject() : newUser;
//     delete userObj.password;
//     return reply.code(201).send(userObj);
//   } catch (error) {
//     request.log.error(error);
//     return reply.code(500).send({
//       statusCode: 500,
//       error: 'Internal Server Error',
//       message: 'An unexpected error occurred'
//     });
//   }
// };
const registerUser = async (request, reply) => {
  try {
    const userData = request.body;
    userData.role = 'user';

    // Tạo verifyToken và gán vào userData
    const verifyToken = crypto.randomBytes(32).toString('hex');
    userData.email_verify_token = verifyToken;
    userData.status = 0;
    userData.email_verified = false;

    // Kiểm tra username/email đã tồn tại chưa
    const existingUser = await userService.findUserByUsernameOrEmail(
      userData.username,
      userData.email
    );
    if (existingUser) {
      return reply.code(409).send({
        statusCode: 409,
        error: 'Conflict',
        message: 'Username or email already exists'
      });
    }

    // Tạo user mới (lúc này user đã có token xác thực)
    const newUser = await userService.createUser(userData);

    // Gửi email xác thực
    await sendVerificationEmail(userData.email, verifyToken);

    // Trả về message yêu cầu xác nhận email
    return reply.code(201).send({
      message: 'Vui lòng kiểm tra email để xác nhận tài khoản.'
    });

  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'An unexpected error occurred'
    });
  }
};

// Gửi email xác thực
async function sendVerificationEmail(email, token) {
  const transporter = nodemailer.createTransport({
    // config gửi mail, ví dụ với Gmail
    service: 'gmail',
    auth: {
      user: 'haocuaquakhu@gmail.com',
      pass: 'gtzgacyxbdlhwtth'
    }
  });

  const url = `http://localhost:3001/verify-email?token=${token}`;


  await transporter.sendMail({
    from: '"App Name" <haocuaquakhu@gmail.com>',
    to: email,
    subject: 'Xác nhận tài khoản',
    html: `<b>Nhấn vào đây để xác nhận đăng ký:</b> <a href="${url}">${url}</a>`
  });
}

const forgotPassword = async (request, reply) => {
  const { email } = request.body;

  if (!email) {
    return reply.status(400).send({ message: 'Email không được để trống' });
  }

  try {
    const result = await resetPasswordAndSendEmail(email);

    if (!result) {
      // Bảo mật: không cho biết email có tồn tại hay không
      return reply.send({ message: 'Nếu email tồn tại, mật khẩu mới đã được gửi.' });
    }

    return reply.send({ message: 'Mật khẩu mới đã được gửi đến email của bạn.' });
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({ message: 'Lỗi máy chủ khi gửi email' });
  }
};

const changePassword = async (request, reply) => {
  try {
    const userId = request.user.id;
    const { currentPassword, newPassword } = request.body;

    if (!currentPassword || !newPassword) {
      return reply.status(400).send({ message: 'Vui lòng nhập đủ mật khẩu hiện tại và mật khẩu mới' });
    }

    const user = await userService.getUserById(userId, true);
    if (!user) {
      return reply.status(404).send({ message: 'Người dùng không tồn tại' });
    }

    const isMatch = await userService.verifyPassword(user, currentPassword);
    if (!isMatch) {
      return reply.status(401).send({ message: 'Mật khẩu hiện tại không đúng' });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await userService.updateUser(userId, { password: hashedNewPassword });

    return reply.send({ message: 'Đổi mật khẩu thành công' });
  } catch (error) {
    request.log.error(error.stack || error); // Sửa dòng này
    return reply.status(500).send({ message: 'Lỗi máy chủ', error: error.message }); // Sửa dòng này
  }
};


module.exports = {
  getAllUsers,
  getOneUser,
  createUser,
  updateUser,
  deleteUser,
  loginUser,
  registerUser,
  forgotPassword,
  changePassword,
};