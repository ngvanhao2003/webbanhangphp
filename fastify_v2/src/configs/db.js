const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async (fastify) => {
  try {
    // Sử dụng biến môi trường hoặc URI mặc định
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/fastify";

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    if (fastify && fastify.log) {
      fastify.log.info("MongoDB connected successfully");
    } else {
      console.log("MongoDB connected successfully");
    }
  } catch (error) {
    if (fastify && fastify.log) {
      fastify.log.error(error);
    } else {
      console.error(error);
    }
    process.exit(1); // Exit the process with failure
  }
};

module.exports = connectDB;
