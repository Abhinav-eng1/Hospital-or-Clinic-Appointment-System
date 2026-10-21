// backend/config/db.js
// This file manages the connection to our MongoDB database using Mongoose.

const mongoose = require('mongoose');

/**
 * Connect to MongoDB using the URI specified in .env
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // Exit process with failure code so the app doesn't run without a database
    process.exit(1);
  }
};

module.exports = connectDB;
