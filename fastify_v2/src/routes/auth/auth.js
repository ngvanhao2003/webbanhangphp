const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../model/user.model");

async function routes(fastify, options) {
  // Endpoint đăng nhập admin
  fastify.post("/admin/login", {
    schema: {
      tags: ["Authentication"],
      description: "Admin login endpoint",
      body: {
        type: "object",
        required: ["username", "password"],
        properties: {
          username: { type: "string" },
          password: { type: "string" },
        },
      },
      response: {
        200: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            token: { type: "string" },
            user: {
              type: "object",
              properties: {
                _id: { type: "string" },
                username: { type: "string" },
                fullname: { type: "string" },
                role: { type: "string" },
              },
            },
          },
        },
        401: {
          type: "object",
          properties: {
            statusCode: { type: "number" },
            error: { type: "string" },
            message: { type: "string" },
          },
        },
      },
    },
    handler: async (request, reply) => {
      const { username, password } = request.body;

      try {
        // Tìm user trong database
        const user = await User.findOne({ username });

        if (!user) {
          return reply.code(401).send({
            statusCode: 401,
            error: "Unauthorized",
            message: "Invalid username or password",
          });
        }

        // Kiểm tra quyền admin
        if (user.role !== "admin") {
          return reply.code(403).send({
            statusCode: 403,
            error: "Forbidden",
            message: "Access denied: Admin privileges required",
          });
        }

        // Kiểm tra mật khẩu
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
          return reply.code(401).send({
            statusCode: 401,
            error: "Unauthorized",
            message: "Invalid username or password",
          });
        }

        // Tạo JWT token
        const token = jwt.sign(
          {
            id: user._id,
            username: user.username,
            role: user.role,
          },
          "your_jwt_secret_key",
          { expiresIn: "24h" }
        );

        // Trả về thông tin user (không bao gồm password) và token
        const userObj = user.toObject();
        const { password: _, ...userWithoutPassword } = userObj;

        return {
          success: true,
          token,
          user: userWithoutPassword,
        };
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({
          statusCode: 500,
          error: "Internal Server Error",
          message: "An error occurred during login",
        });
      }
    },
  });

  // API kiểm tra status xác thực của admin
  fastify.get("/admin/status", {
    schema: {
      tags: ["Authentication"],
      description: "Check admin authentication status",
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: "object",
          properties: {
            authenticated: { type: "boolean" },
            user: {
              type: "object",
              properties: {
                username: { type: "string" },
                role: { type: "string" },
              },
            },
          },
        },
      },
    },
    preHandler: [fastify.authenticate, fastify.isAdmin],
    handler: async (request, reply) => {
      return {
        authenticated: true,
        user: {
          username: request.user.username,
          role: request.user.role,
        },
      };
    },
  });
}

module.exports = routes;
