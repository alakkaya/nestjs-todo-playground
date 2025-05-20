import {
  closeMongoDb,
  closeRedis,
  connectMongoDb,
  connectRedis,
} from './common';
import mongoose from 'mongoose';

// Track test users for cleanup
export const testUsers: string[] = [];

beforeEach(async () => {
  await Promise.all([connectRedis(), connectMongoDb()]);
});

// Clean up and close connection
afterAll(async () => {
  // Clean up specific test users
  if (testUsers.length > 0) {
    await Promise.all(
      testUsers.map((userId) =>
        mongoose.connection
          .collection('user')
          .deleteOne({ _id: new mongoose.Types.ObjectId(userId) }),
      ),
    );
    testUsers.length = 0;
  }

  await Promise.all([closeMongoDb(), closeRedis()]);
});
