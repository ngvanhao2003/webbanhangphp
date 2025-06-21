const userSchema = require('./schema');
const userHandler = require('../../handlers/user.handler');
const userService = require('../../services/user.service');
const verifyJWT = require('../../routes/plugins/auth');

module.exports = function(fastify, opts, done) {
    // Middleware xác thực JWT
    fastify.register(verifyJWT);
    // Get all users
    fastify.get('/api/users', {
        schema: userSchema.getAllUsersSchema
    }, userHandler.getAllUsers);

    // Get user by id
    fastify.get('/api/users/:id', {
        schema: userSchema.getOneUserSchema
    }, userHandler.getOneUser);
    
    // Create new user
    fastify.post('/api/users', {
        schema: userSchema.createUserSchema
    }, userHandler.createUser);
    
    // Update user
    fastify.put('/api/users/:id', {
        schema: userSchema.updateUserSchema
    }, userHandler.updateUser);
    
    // Delete user
    fastify.delete('/api/users/:id', {
        schema: userSchema.deleteUserSchema
    }, userHandler.deleteUser);
    
    // User login
    fastify.post('/api/login', {
        schema: userSchema.loginUserSchema
    }, userHandler.loginUser);

    // Public user registration (no auth required)
    fastify.post('/api/users/register', {
    schema: userSchema.createUserSchema
    }, userHandler.registerUser);

    fastify.get('/api/users/verify-email', async (request, reply) => {
    const { token } = request.query;
    console.log('Verify token:', token);
    const user = await userService.findUserByVerifyToken(token);
    if (!user) {
        return reply.code(400).send({ message: 'Mã xác nhận không hợp lệ!' });
    }
    user.status = 1;
    user.email_verified = true;
    user.email_verify_token = null;
    await user.save();
    return { message: 'Xác nhận thành công. Bạn có thể đăng nhập!' };
    });

    // API quên mật khẩu
    fastify.post('/api/forgot-password', userHandler.forgotPassword);

    // Đổi mật khẩu, cần xác thực
    fastify.put('/api/users/change-password', { preHandler: fastify.authenticate }, userHandler.changePassword);


    
    done();
};