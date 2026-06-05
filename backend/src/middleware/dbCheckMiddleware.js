import mongoose from 'mongoose';

const dbCheck = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: 'Database is not connected. Please make sure MongoDB is running and your MONGODB_URI is correctly configured in backend/.env.',
    });
  }
  next();
};

export default dbCheck;
