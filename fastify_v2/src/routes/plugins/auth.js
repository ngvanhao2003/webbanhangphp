const jwt = require('jsonwebtoken');

async function verifyJWT(fastify, opts) {
  fastify.decorate('authenticate', async (request, reply) => {
    try {
      const authHeader = request.headers.authorization;
      if (!authHeader) {
        return reply.status(401).send({ message: 'Không có token xác thực' });
      }

      const token = authHeader.split(' ')[1];
      if (!token) {
        return reply.status(401).send({ message: 'Token không hợp lệ' });
      }

      // Sử dụng secret key thật, nên lấy từ biến môi trường
      const secret = process.env.JWT_SECRET || 'your_jwt_secret_key';
      const decoded = jwt.verify(token, secret);

      request.user = decoded;
    } catch (err) {
      return reply.status(401).send({ message: 'Token không hợp lệ hoặc hết hạn' });
    }
  });
}

module.exports = verifyJWT;