import {
  AsyncModelFactory,
  Prop,
  Schema,
  SchemaFactory,
} from '@nestjs/mongoose';
import { Schema as MongooseSchema, Document, Types } from 'mongoose';
import { leanObjectId, leanObjectsId } from 'src/core/helper';
import { CollectionName, Todo } from 'src/core/interface';

export type TodoDocument = TodoModel & Document;

@Schema({ timestamps: true })
export class TodoModel implements Todo {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    required: false,
    default: () => new Types.ObjectId(),
  })
  public _id: string;

  @Prop({ type: String, required: true })
  title: string;
  @Prop({ type: String, required: true })
  description: string;
  @Prop({ type: Boolean, default: false })
  completed: boolean;
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  userId: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const TodoSchema = SchemaFactory.createForClass(TodoModel);

export const TodoFactory: AsyncModelFactory = {
  collection: CollectionName.TODO,
  name: TodoModel.name,
  useFactory: () => {
    TodoSchema.post('find', leanObjectsId);
    TodoSchema.post('findOne', leanObjectId);
    TodoSchema.post('findOneAndUpdate', leanObjectId);
    return TodoSchema;
  },
};
