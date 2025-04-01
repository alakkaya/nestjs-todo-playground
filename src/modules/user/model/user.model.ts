import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { hashSync } from 'bcryptjs';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { User } from 'src/core/interface/mongo-model';

export type UserDocument = UserModel & Document;

@Schema({ timestamps: true })
export class UserModel implements User {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    required: false,
    default: Types.ObjectId,
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

export function preSave(next: any) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = hashSync(this.password, 12); // salt rounds: 12
  next();
}

UserSchema.pre('save', preSave);
