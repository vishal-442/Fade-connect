const mongoose = require('mongoose');

/**
 * Connects to MongoDB using the URI supplied in MONGO_URI.
 * Works with a local mongod instance or a MongoDB Atlas cluster.
 */
const connectDB = async () => {
  try {
    mongoose.set('strictQuery', true);
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`[MongoDB] Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    console.error(
      '[MongoDB] Make sure MONGO_URI in server/.env points to a running MongoDB ' +
        'instance (local `mongod` or a MongoDB Atlas connection string).'
    );
    process.exit(1);
  }
};

module.exports = connectDB;
