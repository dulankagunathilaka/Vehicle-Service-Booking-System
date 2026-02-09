const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/autoserve';
    console.log('Attempting to connect to MongoDB with URI:', uri.substring(0, 50) + '...');
    
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✓ MongoDB connected successfully');
  } catch (error) {
    console.error('✗ MongoDB connection error:', error.message);
    console.log('Note: Make sure MongoDB Atlas URI is correct or MongoDB is running locally');
    process.exit(1);
  }
};

module.exports = connectDB;
