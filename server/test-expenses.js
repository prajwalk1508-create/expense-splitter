import dotenv from 'dotenv';
import mongoose from 'mongoose';
import axios from 'axios';
import Group from './models/Group.js';
import Expense from './models/Expense.js';

dotenv.config();

const API = 'http://localhost:5000/api';
let pass = 0, fail = 0;

const assert = (condition, label) => {
  if (condition) {
    pass++;
    console.log(`✅ ${label}`);
  } else {
    fail++;
    console.log(`❌ ${label}`);
  }
};

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB\n');

  // Setup — create a fresh group
  const groupRes = await axios.post(`${API}/groups`, {
    name: 'T19 Auto Test Group',
    members: ['Alice', 'Bob', 'Charlie'],
  });
  const GROUP_ID = groupRes.data._id;
  console.log(`Setup: Group ${GROUP_ID}\n`);

  // ---- Test 1: Create expense (happy path) ----
  const exp1 = await axios.post(`${API}/expenses`, {
    groupId: GROUP_ID,
    paidBy: 'Alice',
    amount: 150000,
    description: 'Pizza',
    splitAmong: ['Alice', 'Bob', 'Charlie'],
  });
  assert(exp1.status === 201, 'T1: Create expense → 201');
  const EXPENSE_ID_1 = exp1.data._id;

  // ---- Test 2: Second expense ----
  const exp2 = await axios.post(`${API}/expenses`, {
    groupId: GROUP_ID,
    paidBy: 'Bob',
    amount: 60000,
    description: 'Snacks',
    splitAmong: ['Alice', 'Bob'],
  });
  assert(exp2.status === 201, 'T2: Create 2nd expense → 201');

  // ---- Test 3: Get expenses ----
  const list = await axios.get(`${API}/groups/${GROUP_ID}/expenses`);
  assert(list.status === 200 && list.data.length === 2, 'T3: Get expenses → length 2');

  // ---- Helper for expected error responses ----
  const expectError = async (promise, status, label) => {
    try {
      await promise;
      assert(false, `${label} — expected error, got success`);
    } catch (err) {
      assert(err.response?.status === status, `${label} → ${status}`);
    }
  };

  // ---- Test 4: Missing fields ----
  await expectError(
    axios.post(`${API}/expenses`, { groupId: GROUP_ID, paidBy: 'Alice' }),
    400, 'T4: Missing fields'
  );

  // ---- Test 5: Invalid group ID ----
  await expectError(
    axios.post(`${API}/expenses`, {
      groupId: 'bad-id', paidBy: 'Alice', amount: 1000, description: 'X', splitAmong: ['Alice'],
    }),
    400, 'T5: Invalid group ID'
  );

  // ---- Test 6: Amount zero ----
  await expectError(
    axios.post(`${API}/expenses`, {
      groupId: GROUP_ID, paidBy: 'Alice', amount: 0, description: 'X', splitAmong: ['Alice'],
    }),
    400, 'T6: Amount zero'
  );

  // ---- Test 7: Amount decimal ----
  await expectError(
    axios.post(`${API}/expenses`, {
      groupId: GROUP_ID, paidBy: 'Alice', amount: 10.5, description: 'X', splitAmong: ['Alice'],
    }),
    400, 'T7: Amount decimal'
  );

  // ---- Test 8: Group not found ----
  await expectError(
    axios.post(`${API}/expenses`, {
      groupId: '000000000000000000000000', paidBy: 'Alice', amount: 1000, description: 'X', splitAmong: ['Alice'],
    }),
    404, 'T8: Group not found'
  );

  // ---- Test 9: Paid-by not a member ----
  await expectError(
    axios.post(`${API}/expenses`, {
      groupId: GROUP_ID, paidBy: 'Stranger', amount: 1000, description: 'X', splitAmong: ['Alice'],
    }),
    400, 'T9: Paid-by not member'
  );

  // ---- Test 10: Split member not in group ----
  await expectError(
    axios.post(`${API}/expenses`, {
      groupId: GROUP_ID, paidBy: 'Alice', amount: 1000, description: 'X', splitAmong: ['Alice', 'Stranger'],
    }),
    400, 'T10: Split member not in group'
  );

  // ---- Test 11: Duplicate splits ----
  await expectError(
    axios.post(`${API}/expenses`, {
      groupId: GROUP_ID, paidBy: 'Alice', amount: 1000, description: 'X', splitAmong: ['Alice', 'Alice'],
    }),
    400, 'T11: Duplicate splits'
  );

  // ---- Test 12: Empty split ----
  await expectError(
    axios.post(`${API}/expenses`, {
      groupId: GROUP_ID, paidBy: 'Alice', amount: 1000, description: 'X', splitAmong: [],
    }),
    400, 'T12: Empty split'
  );

  // ---- Test 13: Delete one expense ----
  const del = await axios.delete(`${API}/expenses/${EXPENSE_ID_1}`);
  assert(del.status === 200, 'T13: Delete expense → 200');

  // ---- Test 14: Confirm deleted ----
  const list2 = await axios.get(`${API}/groups/${GROUP_ID}/expenses`);
  assert(list2.data.length === 1, 'T14: Confirm deleted → length 1');

  // ---- Test 15: Delete invalid ID ----
  await expectError(
    axios.delete(`${API}/expenses/bad-id`),
    400, 'T15: Delete invalid ID'
  );

  // ---- Test 16: Delete non-existent ----
  await expectError(
    axios.delete(`${API}/expenses/000000000000000000000000`),
    404, 'T16: Delete non-existent'
  );

  // ---- Test 17: Cascade delete ----
  const cascadeGroup = await axios.post(`${API}/groups`, {
    name: 'Cascade Test',
    members: ['X', 'Y', 'Z'],
  });
  const CASCADE_ID = cascadeGroup.data._id;

  await axios.post(`${API}/expenses`, {
    groupId: CASCADE_ID, paidBy: 'X', amount: 10000, description: 'Item A', splitAmong: ['X', 'Y'],
  });
  await axios.post(`${API}/expenses`, {
    groupId: CASCADE_ID, paidBy: 'Y', amount: 20000, description: 'Item B', splitAmong: ['X', 'Y', 'Z'],
  });

  const cascadeDel = await axios.delete(`${API}/groups/${CASCADE_ID}`);
  assert(
    cascadeDel.status === 200 && cascadeDel.data.deletedExpenses === 2,
    'T17: Cascade delete → deletedExpenses: 2'
  );

  // ---- Cleanup ----
  await Expense.deleteMany({ groupId: GROUP_ID });
  await Group.deleteMany({ _id: GROUP_ID });
  await Group.deleteMany({ _id: CASCADE_ID });
  await mongoose.disconnect();

  console.log(`\n📊 Results: ${pass} passed, ${fail} failed`);
  process.exit(fail > 0 ? 1 : 0);
};

run().catch((err) => {
  console.error('Fatal:', err.message);
  process.exit(1);
});