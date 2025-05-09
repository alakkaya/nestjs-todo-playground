import { closeMongoDb, connectMongoDb } from './common';
import mongoose from 'mongoose';

// Track test users for cleanup
export const testUsers: string[] = [];

beforeEach(async () => {
  await connectMongoDb();
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

  await closeMongoDb();
});
