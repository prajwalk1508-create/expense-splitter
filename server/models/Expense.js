import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
    },
    paidBy: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    splitAmong: {
      type: [String],
      required: true,
      validate: {
        validator: (arr) => arr.length >= 1,
        message: 'At least one person must split the expense',
      },
    },
  },
  { timestamps: true }
);

const Expense = mongoose.model('Expense', expenseSchema);

export default Expense;