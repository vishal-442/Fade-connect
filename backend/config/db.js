const mongoose = require('mongoose');

const connectDB = async () => {
  if (process.env.SKIP_DB === 'true') {
    console.warn('Skipping MongoDB connection because SKIP_DB=true');
    return;
  }

  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error('MONGO_URI is required');
  }

  await mongoose.connect(mongoUri, {
    dbName: process.env.MONGO_DB_NAME || 'fade_connect'
  });
  console.log('MongoDB connected');
};

module.exports = connectDB;
