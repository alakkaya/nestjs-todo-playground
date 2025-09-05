import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { TodoRepository } from '../../../todo/repository/todo.repository';
import { RabbitmqService } from '../../rabbitmq/services/rabbitmq.service';
import { TodoEvent } from '../../rabbitmq/enum/todo-event';
import { TodoDeletionJobData } from 'src/core/interface';
import { TodoElastic } from '../../elastic-search/interface/todo-elastic.interface';

@Injectable()
@Processor('todo-deletion-jobs')
export class TodoDeletionJobProcessor extends WorkerHost {
  constructor(
    private readonly todoRepository: TodoRepository,
    private readonly rabbitmqService: RabbitmqService,
  ) {
    super();
  }

  async process(job: Job<TodoDeletionJobData>): Promise<void> {
    const { todoId, userId } = job.data;

    try {
      // Delete todo
      const deletedTodo = await this.todoRepository.findByIdAndUserId(
        todoId,
        userId,
      );

      if (deletedTodo) {
        await this.todoRepository.delete(todoId);

        // Send deletion event to RabbitMQ
        const todoElastic: TodoElastic = {
          id: deletedTodo._id,
          title: deletedTodo.title,
          description: deletedTodo.description,
          completed: deletedTodo.completed,
          userId: deletedTodo.userId,
          createdAt: deletedTodo.createdAt,
          updatedAt: deletedTodo.updatedAt,
        };

        await this.rabbitmqService.publishTodoEvent(
          TodoEvent.TODO_DELETED,
          todoElastic,
        );
      }
    } catch (error) {
      throw error;
    }
  }
}
