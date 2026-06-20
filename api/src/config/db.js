const mongoose = require("mongoose");
require("dotenv").config();

const DB_HOST = process.env.DB_HOST ?? "localhost";
const DB_PORT = process.env.DB_PORT ?? 27017;
const DB_NAME = process.env.DB_NAME ?? "lururu";
const DB_URI =
  process.env.DB_URI || `mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(DB_URI);
    console.log(`MongoDB Terkoneksi: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error Koneksi Database: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
