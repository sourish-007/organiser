import mongoose from 'mongoose';

const essayPointerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tag: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    points: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const EssayPointer = mongoose.model('EssayPointer', essayPointerSchema);
export default EssayPointer;
