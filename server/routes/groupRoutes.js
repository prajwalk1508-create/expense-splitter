import express from 'express';
import Group from '../models/Group.js';
import mongoose from 'mongoose';
import Expense from '../models/Expense.js';

const router = express.Router();

// POST /api/groups — create a new group
router.post('/', async (req, res) => {
  try {
    const { name, members } = req.body;

    // Basic validation
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Group name is required' });
    }

    if (!Array.isArray(members) || members.length < 2) {
      return res.status(400).json({ error: 'At least 2 members are required' });
    }

    // Check for duplicate members
    const uniqueMembers = new Set(members.map(m => m.trim()));
    if (uniqueMembers.size !== members.length) {
      return res.status(400).json({ error: 'Member names must be unique' });
    }

    // Create the group
    const group = await Group.create({
      name: name.trim(),
      members: members.map(m => m.trim()),
    });

    res.status(201).json(group);
  } catch (err) {
    console.error('POST /api/groups error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/groups — list all groups
router.get('/', async (req, res) => {
  try {
    const groups = await Group.find().sort({ createdAt: -1 });
    res.status(200).json(groups);
  } catch (err) {
    console.error('GET /api/groups error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/groups/:id — get one group by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate the ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid group ID' });
    }

    const group = await Group.findById(id);

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    res.status(200).json(group);
  } catch (err) {
    console.error('GET /api/groups/:id error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/groups/:id — delete a group and its expenses
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid group ID' });
    }

    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Cascade delete: remove all expenses for this group
    const expensesResult = await Expense.deleteMany({ groupId: id });

    // Now delete the group
    await Group.findByIdAndDelete(id);

    res.status(200).json({
      message: 'Group and its expenses deleted',
      deletedExpenses: expensesResult.deletedCount,
    });
  } catch (err) {
    console.error('DELETE /api/groups/:id error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;