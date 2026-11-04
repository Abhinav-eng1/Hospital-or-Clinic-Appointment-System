// backend/config/db.js
// This file manages the connection to our MongoDB database using Mongoose.

const mongoose = require('mongoose');

let dbError = null;

/**
 * Connect to MongoDB using the URI specified in .env
 */
const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    dbError = 'MONGO_URI environment variable is missing.';
    console.error(`❌ MongoDB Connection Error: ${dbError}`);
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 8000
    });
    dbError = null;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    dbError = error.message;
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // Do NOT call process.exit(1) in production cloud hosting (e.g. Render)
    // to avoid container crash loops and 502 Bad Gateway / no-deploy states.
  }
};

const getDbError = () => dbError;

module.exports = { connectDB, getDbError };
