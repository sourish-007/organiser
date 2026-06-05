import mongoose from 'mongoose';

const monthSchema = new mongoose.Schema(
  {
    yearId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Year',
      required: true,
    },
    month: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

monthSchema.index({ yearId: 1, month: 1 }, { unique: true });

const Month = mongoose.model('Month', monthSchema);
export default Month;
