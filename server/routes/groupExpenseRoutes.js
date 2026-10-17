import express from 'express';
import mongoose from 'mongoose';
import Expense from '../models/Expense.js';
import Group from '../models/Group.js';

const router = express.Router({ mergeParams: true });

// GET /api/groups/:id/expenses — list expenses for a group
router.get('/', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid group ID' });
    }

    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const expenses = await Expense.find({ groupId: id }).sort({ createdAt: 1 });
    res.status(200).json(expenses);
  } catch (err) {
    console.error('GET /api/groups/:id/expenses error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;