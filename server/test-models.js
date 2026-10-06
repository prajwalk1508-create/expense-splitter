import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Group from './models/Group.js';
import Expense from './models/Expense.js';

dotenv.config();

const run = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected');

    // Cleanup before test
    await Group.deleteMany({ name: 'TEST Goa Trip' });
    console.log('🧹 Cleaned up old test data');

    // 1. Create a Group
    console.log('\n📝 Creating group...');
    const group = await Group.create({
      name: 'TEST Goa Trip',
      members: ['You', 'Raj', 'Sara'],
    });
    console.log('✅ Group created:', group._id);
    console.log('   Name:', group.name);
    console.log('   Members:', group.members);

    // 2. Create an Expense linked to that Group
    console.log('\n📝 Creating expense...');
    const expense = await Expense.create({
      groupId: group._id,
      paidBy: 'You',
      amount: 200000, // ₹2000 in paise
      description: 'Dinner',
      splitAmong: ['You', 'Raj', 'Sara'],
    });
    console.log('✅ Expense created:', expense._id);
    console.log('   Paid by:', expense.paidBy);
    console.log('   Amount (paise):', expense.amount);
    console.log('   Description:', expense.description);

    // 3. Fetch expenses for this group
    console.log('\n🔍 Fetching expenses for the group...');
    const expenses = await Expense.find({ groupId: group._id });
    console.log('✅ Found', expenses.length, 'expense(s)');

    // 4. Test validation — this should fail
    console.log('\n🧪 Testing validation (should fail)...');
    try {
      await Group.create({
        name: 'Bad Group',
        members: ['OnlyOne'], // less than 2
      });
      console.log('❌ Validation FAILED — bad data got saved!');
    } catch (err) {
      console.log('✅ Validation worked:', err.message);
    }

    // 5. Cleanup
    console.log('\n🧹 Cleaning up test data...');
    await Expense.deleteMany({ groupId: group._id });
    await Group.deleteOne({ _id: group._id });
    console.log('✅ Cleanup done');

    console.log('\n🎉 All tests passed!\n');
  } catch (err) {
    console.error('\n❌ Test failed:', err.message);
    console.error(err);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected\n');
  }
};

run();