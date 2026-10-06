import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    members: {
      type: [String],
      required: true,
      validate: {
        validator: (arr) => arr.length >= 2,
        message: 'A group must have at least 2 members',
      },
    },
  },
  { timestamps: true }
);

const Group = mongoose.model('Group', groupSchema);

export default Group;