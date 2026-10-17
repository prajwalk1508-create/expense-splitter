import express from 'express';
import mongoose from 'mongoose';
import Group from '../models/Group.js';
import Expense from '../models/Expense.js';

const router = express.Router();

// POST /api/expenses — create a new expense
router.post('/', async (req, res) => {
  try {
    const { groupId, paidBy, amount, description, splitAmong } = req.body;

    // 1. Basic validation
    if (!groupId || !paidBy || !amount || !description || !splitAmong) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ error: 'Invalid group ID' });
    }

    if (!Number.isInteger(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive integer in paise' });
    }

    if (!Array.isArray(splitAmong) || splitAmong.length < 1) {
      return res.status(400).json({ error: 'At least one person must split the expense' });
    }

    // 2. Check the group exists
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // 3. Check paidBy is a member
    if (!group.members.includes(paidBy)) {
      return res.status(400).json({ error: 'Paid-by must be a group member' });
    }

    // 4. Check every splitAmong member is in the group
    const invalidMembers = splitAmong.filter(m => !group.members.includes(m));
    if (invalidMembers.length > 0) {
      return res.status(400).json({
        error: `These split members are not in the group: ${invalidMembers.join(', ')}`,
      });
    }

    // 5. Check for duplicates in splitAmong
    const uniqueSplit = new Set(splitAmong);
    if (uniqueSplit.size !== splitAmong.length) {
      return res.status(400).json({ error: 'Split members must be unique' });
    }

    // 6. Create the expense
    const expense = await Expense.create({
      groupId,
      paidBy: paidBy.trim(),
      amount,
      description: description.trim(),
      splitAmong: splitAmong.map(m => m.trim()),
    });

    res.status(201).json(expense);
  } catch (err) {
    console.error('POST /api/expenses error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/expenses/:id — delete a single expense
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid expense ID' });
    }

    const expense = await Expense.findById(id);
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    await Expense.findByIdAndDelete(id);

    res.status(200).json({ message: 'Expense deleted' });
  } catch (err) {
    console.error('DELETE /api/expenses/:id error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;