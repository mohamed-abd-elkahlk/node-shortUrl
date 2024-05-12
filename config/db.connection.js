const mongoose = require("mongoose");

//  dbConnection

const MONOG_URI = process.env.DB_STRING;

const cached = {};

async function dbConnection() {
  if (!MONOG_URI)
    throw new Error(
      "Please define the MONGO_URI environment variable inside .env"
    );
  if (cached.connction) return cached.connction;

  if (!cached.promise) {
    const opts = { bufferCommands: false };
    cached.promise = mongoose.connect(MONOG_URI, opts);
  }
  try {
    cached.connection = await cached.promise;
  } catch (e) {
    cached.promise = undefined;
    throw e;
  }
  return cached.connection;
}

module.exports = dbConnection;
