const mongoose = require('mongoose');

let cached = global._mongooseConnection;

const connectDB = async () => {
  if (cached) {
    return cached;
  }

  const conn = await mongoose.connect(process.env.MONGODB_URI);
  console.log(`MongoDB connected: ${conn.connection.host}`);
  cached = conn;
  global._mongooseConnection = cached;
  return conn;
};

module.exports = connectDB;
