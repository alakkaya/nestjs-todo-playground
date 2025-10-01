import { Injectable } from '@nestjs/common';
import { TodoRepository } from '../repository/todo.repository';
import { CreateTodoAck, CreateTodoDto } from '../dto/create-todo.dto';
import { GetTodoAck, GetTodoDto } from '../dto/get-todo.dto';
import {
  SearchTodoAck,
  SearchTodoDto,
  UpdateTodoAck,
  UpdateTodoDto,
  DeleteTodoAck,
  CancelDeletionAck,
  DeleteTodoDto,
  CancelDeletionDto,
} from '../dto';
import { Todo } from 'src/core/interface';
import {
  TodoNotFoundException,
  TodoDeletionPendingException,
} from 'src/core/error';
import { TodoElastic } from 'src/modules/utils/elastic-search/interface';
import { TodoSearchService } from 'src/modules/utils/elastic-search/services/todo-search.service';
import { RabbitmqService } from 'src/modules/utils/rabbitmq/services/rabbitmq.service';
import { TodoEvent } from 'src/modules/utils/rabbitmq/enum/todo-event';
import { TodoDeletionJobService } from 'src/modules/utils/bullmq/services/todo-deletion-job.service';
import { cacheKeys } from 'src/core/cache';
import { RedlockService } from 'src/core/cache/lock/redlock.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TodoService {
  private readonly todoDeletionLockTTL: number;

  constructor(
    private readonly todoRepository: TodoRepository,
    private readonly todoSearchService: TodoSearchService,
    private readonly rabbitmqService: RabbitmqService,
    private readonly todoDeletionJobService: TodoDeletionJobService,
    private readonly redlockService: RedlockService,
    private readonly configService: ConfigService,
  ) {
    this.todoDeletionLockTTL = this.configService.get(
      'TODO_DELETION_LOCK_TTL',
      15000,
    );
  }

  async create(todo: CreateTodoDto): Promise<CreateTodoAck> {
    const todoData = {
      ...todo,
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
    this.rabbitmqService.publishTodoEvent(TodoEvent.TODO_CREATED, todoElastic);

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
    this.rabbitmqService.publishTodoEvent(TodoEvent.TODO_UPDATED, todoElastic);

    return updatedTodo;
  }

  async delete(deleteTodoDto: DeleteTodoDto): Promise<DeleteTodoAck> {
    const lockKey = cacheKeys.locks.todoDeletion(deleteTodoDto.todoId);

    return await this.redlockService.withLock(
      lockKey,
      async () => {
        // 1. Pending deletion kontrolü
        const isPending = await this.todoDeletionJobService.isPendingDeletion(
          deleteTodoDto.todoId,
          deleteTodoDto.userId,
        );
        if (isPending) {
          throw new TodoDeletionPendingException();
        }

        // 2. Check if todo exists
        const existingTodo = await this.todoRepository.findByIdAndUserId(
          deleteTodoDto.todoId,
          deleteTodoDto.userId,
        );
        if (!existingTodo) {
          throw new TodoNotFoundException();
        }

        // 3. Schedule delayed job
        const jobId = await this.todoDeletionJobService.scheduleDeletion(
          deleteTodoDto.todoId,
          deleteTodoDto.userId,
        );

        return {
          message: 'Todo deletion scheduled. You have 4 seconds to cancel.',
          jobId,
          remainingTime: 4000,
        };
      },
      this.todoDeletionLockTTL,
    );
  }

  async cancelDeletion(
    cancelDeletionDto: CancelDeletionDto,
  ): Promise<CancelDeletionAck> {
    const cancelled = await this.todoDeletionJobService.cancelDeletion(
      cancelDeletionDto.todoId,
      cancelDeletionDto.userId,
    );

    return {
      message: cancelled
        ? 'Todo deletion cancelled successfully.'
        : 'No pending deletion found or deletion already completed.',
      success: cancelled,
    };
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
