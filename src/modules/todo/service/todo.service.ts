import { Injectable } from '@nestjs/common';
import { TodoRepository } from '../repository/todo.repository';
import { CreateTodoAck, CreateTodoDto } from '../dto/create-todo.dto';
import { GetTodoAck, GetTodoDto } from '../dto/get-todo.dto';
import { UpdateTodoAck, UpdateTodoDto } from '../dto';
import { Todo } from 'src/core/interface';
import { TodoNotFoundException } from 'src/core/error';

@Injectable()
export class TodoService {
  constructor(private readonly todoRepository: TodoRepository) {}

  async create(todo: CreateTodoDto, userId: string): Promise<CreateTodoAck> {
    const todoData = {
      ...todo,
      userId,
      completed: false, // Default to false when creating a new todo
    };
    return this.todoRepository.create(todoData);
  }

  async findByUserId(
    userId: string,
    getTodoDto: GetTodoDto,
  ): Promise<GetTodoAck> {
    const { page = 1, limit = 10, completed } = getTodoDto;
    const todos = await this.todoRepository.findByUserId(userId, {
      page,
      limit,
      completed,
    });

    const total = await this.todoRepository.countByUserId(userId, completed);
    const totalPages = Math.ceil(total / limit);

    return {
      todos,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async update(
    todoId: string,
    userId: string,
    updateTodoDto: UpdateTodoDto,
  ): Promise<UpdateTodoAck> {
    const existingTodo = await this.todoRepository.findByIdAndUserId(
      todoId,
      userId,
    );

    if (!existingTodo) {
      throw new TodoNotFoundException();
    }

    return this.todoRepository.update(todoId, updateTodoDto);
  }

  async delete(todoId: string, userId: string): Promise<void> {
    const existingTodo = await this.todoRepository.findByIdAndUserId(
      todoId,
      userId,
    );

    if (!existingTodo) {
      throw new TodoNotFoundException();
    }

    await this.todoRepository.delete(todoId);
  }

  async findById(todoId: string, userId: string): Promise<Todo> {
    const todo = await this.todoRepository.findByIdAndUserId(todoId, userId);

    if (!todo) {
      throw new TodoNotFoundException();
    }

    return todo;
  }
}
