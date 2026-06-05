import mongoose from 'mongoose';

const yearSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

yearSchema.index({ userId: 1, year: 1 }, { unique: true });

const Year = mongoose.model('Year', yearSchema);
export default Year;
