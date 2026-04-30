require('dotenv').config();
const mongoose = require('mongoose');

async function keepMongoAlive() {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error('MONGO_URI is not set.');
    }

    await mongoose.connect(mongoUri);
    await mongoose.connection.db.admin().ping();
    console.log('MongoDB keep-alive ping successful.');
  } catch (error) {
    console.error('MongoDB keep-alive ping failed:', error.message);
    process.exitCode = 1;
  } finally {
    try {
      await mongoose.disconnect();
    } catch (disconnectError) {
      console.error('Error during mongoose disconnect:', disconnectError.message);
      process.exitCode = 1;
    }
  }
}

keepMongoAlive();
