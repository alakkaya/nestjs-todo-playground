import {
  AsyncModelFactory,
  Prop,
  Schema,
  SchemaFactory,
} from '@nestjs/mongoose';
import { hashSync } from 'bcryptjs';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { leanObjectId, leanObjectsId, preSave } from 'src/core/helper';
import { CollectionName, User } from 'src/core/interface/mongo-model';

export type UserDocument = UserModel & Document;

@Schema({ timestamps: true })
export class UserModel implements User {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    required: false,
    default: () => new Types.ObjectId(),
  })
  public _id: string;

  @Prop({ type: String, required: true })
  fullname: string;

  @Prop({ type: String, unique: true, required: true })
  nickname: string;

  @Prop({
    type: String,
    select: false, // Do not include password in the response
    minlength: 6,
    maxlength: 50,
    required: true,
  })
  password: string;
}

export const UserSchema = SchemaFactory.createForClass(UserModel);

export const UserFactory: AsyncModelFactory = {
  collection: CollectionName.USER,
  name: UserModel.name,
  useFactory: () => {
    UserSchema.pre('save', preSave);
    UserSchema.post('find', leanObjectsId);
    UserSchema.post('findOne', leanObjectId);
    UserSchema.post('findOneAndUpdate', preSave);
    UserSchema.post('findOneAndUpdate', leanObjectId);
    return UserSchema;
  },
};
