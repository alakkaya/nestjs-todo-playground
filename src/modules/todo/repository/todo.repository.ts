import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TodoDocument, TodoModel } from '../model/todo.model';
import { Model } from 'mongoose';
import { CreateTodoAck, CreateTodoDto } from '../dto/create-todo.dto';
import { Todo } from 'src/core/interface';
import { UpdateTodoAck, UpdateTodoDto } from '../dto/update-todo.dto';

@Injectable()
export class TodoRepository {
  constructor(
    @InjectModel(TodoModel.name)
    private readonly todoModel: Model<TodoDocument>,
  ) {}

  async create(createTodoDto: CreateTodoDto): Promise<CreateTodoAck> {
    const newTodo = new this.todoModel({ ...createTodoDto });
    await newTodo.save();
    return {
      id: newTodo._id.toString(),
      title: newTodo.title,
      description: newTodo.description,
      completed: newTodo.completed,
      userId: newTodo.userId.toString(),
      createdAt: newTodo.createdAt,
      updatedAt: newTodo.updatedAt,
    };
  }

  async findByUserId(
    userId: string,
    options?: {
      page?: number;
      limit?: number;
      completed?: boolean;
    },
  ): Promise<Todo[]> {
    const { page = 1, limit = 10, completed } = options || {};

    const filter: any = { userId };
    if (completed !== undefined) {
      filter.completed = completed;
    }

    return this.todoModel
      .find(filter)
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  async countByUserId(userId: string, completed?: boolean): Promise<number> {
    const filter: any = { userId };
    if (completed !== undefined) {
      filter.completed = completed;
    }
    // if completed == false then it will return only uncompleted todos with filter.completed= completed from params

    return this.todoModel.countDocuments(filter).exec();
  }

  async findByIdAndUserId(
    todoId: string,
    userId: string,
  ): Promise<Todo | null> {
    return this.todoModel.findOne({ _id: todoId, userId }).lean().exec();
  }

  async update(
    todoId: string,
    updateData: UpdateTodoDto,
  ): Promise<UpdateTodoAck> {
    const updatedTodo = await this.todoModel
      .findByIdAndUpdate(todoId, updateData, { new: true })
      .lean()
      .exec();

    return {
      id: updatedTodo._id.toString(),
      title: updatedTodo.title,
      description: updatedTodo.description,
      completed: updatedTodo.completed,
      userId: updatedTodo.userId.toString(),
      createdAt: updatedTodo.createdAt,
      updatedAt: updatedTodo.updatedAt,
    };
  }

  async delete(todoId: string): Promise<void> {
    await this.todoModel.findByIdAndDelete(todoId).exec();
  }
}
