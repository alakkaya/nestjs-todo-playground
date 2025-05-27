import {
  closeMongoDb,
  closeRedis,
  connectMongoDb,
  connectRedis,
  resetMongoDb,
} from './common';
import mongoose from 'mongoose';

// Track test users for cleanup
export const testUsers: string[] = [];

beforeEach(async () => {
  await Promise.all([connectRedis(), connectMongoDb()]);
});

afterEach(async () => {
  // Her test sonrası veritabanını temizle
  await resetMongoDb();
  testUsers.length = 0; // Test kullanıcıları listesini temizle
});

// Clean up and close connection
afterAll(async () => {
  await Promise.all([closeMongoDb(), closeRedis()]);
});
