import { Injectable } from '@nestjs/common';
import { TodoRepository } from '../repository/todo.repository';
import { CreateTodoAck, CreateTodoDto } from '../dto/create-todo.dto';
import { GetTodoAck, GetTodoDto } from '../dto/get-todo.dto';
import {
  SearchTodoAck,
  SearchTodoDto,
  UpdateTodoAck,
  UpdateTodoDto,
} from '../dto';
import { Todo } from 'src/core/interface';
import { TodoNotFoundException } from 'src/core/error';
import { TodoElastic } from 'src/modules/utils/elastic-search/interface';
import { TodoSearchService } from 'src/modules/utils/elastic-search/services/todo-search.service';
import { RabbitmqService } from 'src/modules/utils/rabbitmq/services/rabbitmq.service';

@Injectable()
export class TodoService {
  constructor(
    private readonly todoRepository: TodoRepository,
    private readonly todoSearchService: TodoSearchService,
    private readonly rabbitmqService: RabbitmqService,
  ) {}

  async create(todo: CreateTodoDto, userId: string): Promise<CreateTodoAck> {
    const todoData = {
      ...todo,
      userId,
      completed: false, // Default to false when creating a new todo
    };

    const createdTodo = await this.todoRepository.create(todoData);

    // For sending to RabbitMQ
    const todoElastic: TodoElastic = {
      id: createdTodo.id,
      title: createdTodo.title,
      description: createdTodo.description,
      completed: createdTodo.completed,
      userId: createdTodo.userId,
      createdAt: createdTodo.createdAt,
      updatedAt: createdTodo.updatedAt,
    };

    // Fire-and-forget: User does not wait for Elasticsearch operation
    this.rabbitmqService.publishTodoEvent('TODO_CREATED', todoElastic);

    return createdTodo;
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
    const updatedTodo = await this.todoRepository.update(todoId, updateTodoDto);

    // For sending to RabbitMQ
    const todoElastic: TodoElastic = {
      id: updatedTodo.id,
      title: updatedTodo.title,
      description: updatedTodo.description,
      completed: updatedTodo.completed,
      userId: updatedTodo.userId,
      createdAt: updatedTodo.createdAt,
      updatedAt: updatedTodo.updatedAt,
    };

    // Fire-and-forget
    this.rabbitmqService.publishTodoEvent('TODO_UPDATED', todoElastic);

    return updatedTodo;
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

    const todoElastic: TodoElastic = {
      id: existingTodo._id,
      title: existingTodo.title,
      description: existingTodo.description,
      completed: existingTodo.completed,
      userId: existingTodo.userId,
      createdAt: existingTodo.createdAt,
      updatedAt: existingTodo.updatedAt,
    };

    this.rabbitmqService.publishTodoEvent('TODO_DELETED', todoElastic);
  }

  async findById(todoId: string, userId: string): Promise<Todo> {
    const todo = await this.todoRepository.findByIdAndUserId(todoId, userId);

    if (!todo) {
      throw new TodoNotFoundException();
    }

    return todo;
  }

  async search(
    searchDto: SearchTodoDto,
    userId: string,
  ): Promise<SearchTodoAck> {
    const { query, page = 1, limit = 10 } = searchDto;
    const { todos, total } = await this.todoSearchService.search(
      query,
      userId,
      page,
      limit,
    );

    return {
      todos,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
