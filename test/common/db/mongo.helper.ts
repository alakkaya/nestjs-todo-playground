import { testConfig } from '../../test-config';
import mongoose, { Model } from 'mongoose';
import {
  UserModel,
  UserSchema,
} from '../../../src/modules/user/model/user.model';

export const mongoDb = mongoose.connection;

export const connectMongoDb = async (): Promise<void> => {
  await mongoose.connect(testConfig.mongoConnectionUrl);
  await resetMongoDb();
};

export const resetMongoDb = async (): Promise<void> => {
  // Tüm koleksiyonları temizle
  const collections = mongoose.connection.collections;

  await Promise.all(
    Object.values(collections).map((collection) => collection.deleteMany({})),
  );
};

export const closeMongoDb = async (): Promise<void> => {
  await mongoDb.close();
};

export const UserMongoModel = <Model<UserModel>>(
  (mongoose.models.UserModel || mongoose.model('UserModel', UserSchema, 'user'))
);
