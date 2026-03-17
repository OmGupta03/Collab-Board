import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config({ path: './server/.env' });

const createTestUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Delete existing test user first (for re-runs)
    await User.deleteOne({ email: 'om@test.com' });
    console.log('🗑️  Cleared existing test user');

    // Create new test user (passwordHash will be hashed by pre-save middleware)
    const user = await User.create({
      name: 'Test User',
      email: 'om@test.com',
      passwordHash: '123456'  // Plain text - auto hashed
    });

    console.log(`✅ Test user created: ${user.email} (ID: ${user._id})`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
};

createTestUser();
