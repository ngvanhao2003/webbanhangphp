// Load environment variables
require("dotenv").config();
// Require the framework and instantiate it
const fastify = require("fastify")({
  logger: true,
});
// Import user handler (đường dẫn chính xác)
// const userHandler = require('./handlers/user.handler');

// const verifyJWT = require('./routes/plugins/auth');
// fastify.register(verifyJWT);
// Đăng ký plugin multipart SAU khi đã khởi tạo fastify
const cors = require("@fastify/cors");
const jwt = require("jsonwebtoken");
const multipart = require("@fastify/multipart");
const path = require("path");

const connectDB = require("./configs/db");
connectDB(fastify);

fastify.register(require("@fastify/static"), {
  root: path.join(__dirname, "../uploads"),
  prefix: "/uploads/", // Đường dẫn public
});

// Register multipart for file uploads
fastify.register(multipart, {
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for file uploads
    files: 1, // Maximum 1 file per request
  },
});

// Add authentication decorator
fastify.decorate("authenticate", async function (request, reply) {
  try {
    console.log("Full headers:", request.headers); // Log all headers to debug
    const authHeader = request.headers.authorization;
    console.log("Auth header:", authHeader); // Debug log for authentication header

    if (!authHeader) {
      console.log("No authorization header found"); // Debug log for missing header
      return reply.code(401).send({
        statusCode: 401,
        error: "Unauthorized",
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];
    console.log("Token extracted:", token ? "exists" : "missing"); // Debug log for token extraction

    try {
      const decoded = jwt.verify(token, "your_jwt_secret_key"); // Use the same secret key as in login
      console.log("Token verified successfully for user:", decoded.username); // Debug log for successful token verification
      request.user = decoded;
    } catch (tokenError) {
      console.log("Token verification failed:", tokenError.message); // Debug log for token verification error
      throw tokenError; // Re-throw to be caught by outer catch
    }
  } catch (err) {
    console.log("Authentication error:", err.message); // Debug log for overall authentication error
    return reply.code(401).send({
      statusCode: 401,
      error: "Unauthorized",
      message: "Invalid or expired token",
    });
  }
});

// Add admin check decorator
fastify.decorate("isAdmin", async function (request, reply) {
  if (!request.user || request.user.role !== "admin") {
    return reply.code(403).send({
      statusCode: 403,
      error: "Forbidden",
      message: "Access denied: Admin privileges required",
    });
  }
});

///////////////CORS//////////////////////
fastify.register(cors, {
  origin: ["http://localhost:3001", "http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  exposedHeaders: ["Content-Range", "X-Content-Range"],
  credentials: true,
  maxAge: 86400, // 24 hours
  preflight: true,
  preflightContinue: false,
});

////////////////////SWAGGER///////////////////////
fastify.register(require("@fastify/swagger"), {
  swagger: {
    info: {
      title: "FastifyV2 API",
      description: "API documentation for FastifyV2 e-commerce platform",
      version: "0.1.0",
    },
    externalDocs: {
      url: "https://swagger.io",
      description: "Find more info here",
    },
    hosts: "localhost:3000",
    basePath: "/",
    schemes: ["http"],
    consumes: ["application/json", "multipart/form-data"], // Added multipart/form-data for file uploads
    produces: ["application/json"],
    tags: [
      {
        name: "Authentication",
        description: "Authentication related endpoints",
      },
      { name: "Categories", description: "Categories operations" },
      { name: "Products", description: "Products operations" },
      { name: "Orders", description: "Order management" },
      { name: "Users", description: "User management" },
      { name: "Admin", description: "Admin operations" },
    ],
    definitions: {},
    securityDefinitions: {
      bearerAuth: {
        type: "apiKey",
        name: "Authorization",
        in: "header",
        description: 'Enter your bearer token in the format "Bearer {token}"',
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  exposeRoute: true,
});

////////////SWAGGER-UI///////////////////////////
fastify.register(require("@fastify/swagger-ui"), {
  routePrefix: "/docs",
  uiConfig: {
    docExpansion: "list",
    deepLinking: false,
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    tryItOutEnabled: true,
  },
  uiHooks: {
    onRequest: function (request, reply, next) {
      next();
    },
    preHandler: function (request, reply, next) {
      next();
    },
  },
  staticCSP: true,
  transformStaticCSP: (header) => header,
  transformSpecification: (swaggerObject, request, reply) => {
    return swaggerObject;
  },
  transformSpecificationClone: true,
});

// Declare a route
fastify.get("/", function (request, reply) {
  reply.send({ hello: "worlddddd" });
});

// // Đăng ký route thay đổi mật khẩu với middleware authenticate
// fastify.put('/api/users/change-password', { preHandler: fastify.authenticate }, userHandler.changePassword);

//import route
fastify.register(require("./routes/auth/auth"), { prefix: "/api/auth" });
fastify.register(require("./routes/categories/categories"));
fastify.register(require("./routes/product/product"));
// fastify.register(require("./routes/contact/contact"));
fastify.register(require("./routes/brands/brands"));
fastify.register(require("./routes/banner/banner"), { prefix: "/api/banners" });
fastify.register(require("./routes/order/order"), { prefix: "/api/orders" });
fastify.register(require("./routes/order_detail/order_detail"), {
  prefix: "/api/order-details",
});
fastify.register(require("./routes/topic/topic"), { prefix: "/api/topics" });
fastify.register(require("./routes/post/post"), { prefix: "/api/posts" });
fastify.register(require("./routes/user/user"));
fastify.register(require("./routes/contact/contact"), {
  prefix: "/api/contact",
});
fastify.register(require("./routes/cart/cart"), { prefix: "/api/cart" });
fastify.register(require("./routes/review/review"));
fastify.register(require("./routes/coupon/coupon"));
fastify.register(require("./routes/payment/payment")); // Thêm routes cho thanh toán
fastify.register(require("./routes/home/home")); // Thêm routes cho trang chủ
fastify.register(require("./routes/admin/admin"), { prefix: "/api/admin" }); // Thêm routes cho admin dashboard
fastify.register(require("./routes/uploads/upload"));

// Add global error handler for better debugging
fastify.setErrorHandler(function (error, request, reply) {
  // Log error
  this.log.error(error);

  // Special handling for CORS errors
  if (error.message && error.message.includes("CORS")) {
    return reply.code(500).send({
      statusCode: 500,
      error: "CORS Error",
      message: "Cross-Origin Request blocked. Check CORS configuration.",
      details: error.message,
    });
  }

  // Handle other errors
  const statusCode = error.statusCode || 500;
  reply.code(statusCode).send({
    statusCode,
    error: error.name || "Internal Server Error",
    message: error.message || "An unknown error occurred",
  });
});

// Run the server!
fastify.listen({ port: 3000, host: "0.0.0.0" }, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Server listening on ${address}`);
});
