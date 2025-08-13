import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
import { Environment } from 'src/core/interface';
import { TodoSearchService } from '../../elastic-search/services/todo-search.service';
import { TodoElastic } from '../../elastic-search/interface';

@Injectable()
export class TodoEventConsumerService implements OnModuleInit {
  private connection: amqp.Connection;
  private channel: amqp.Channel;

  constructor(
    private readonly configService: ConfigService<Environment>,
    private readonly todoSearchService: TodoSearchService,
  ) {}

  async onModuleInit() {
    await this.connect();
    await this.consume();
  }

  private async connect(): Promise<void> {
    try {
      this.connection = await amqp.connect(
        this.configService.get<string>('RABBITMQ_URL'),
      );
      this.channel = await this.connection.createChannel();

      await this.channel.assertQueue(
        this.configService.get<string>('RABBITMQ_QUEUE_TODO_EVENTS'),
        { durable: true },
      );
    } catch (error) {
      console.error('RabbitMQ consumer connection failed:', error);
      throw error;
    }
  }

  private async consume(): Promise<void> {
    this.channel.consume(
      this.configService.get<string>('RABBITMQ_QUEUE_TODO_EVENTS'),
      async (message) => {
        if (message) {
          try {
            const { event, data } = JSON.parse(message.content.toString());
            await this.handleTodoEvent(event, data);
            this.channel.ack(message);
          } catch (error) {
            console.error('Error processing todo event:', error);
            this.channel.nack(message, false, false); // Send to dead letter queue
          }
        }
      },
    );
  }

  private async handleTodoEvent(
    event: string,
    data: TodoElastic,
  ): Promise<void> {
    switch (event) {
      case 'TODO_CREATED':
        await this.todoSearchService.insert(data);
        break;
      case 'TODO_UPDATED':
        await this.todoSearchService.update(data);
        break;
      case 'TODO_DELETED':
        await this.todoSearchService.delete(data.id);
        break;
      default:
        console.warn(`Unknown event type: ${event}`);
    }
  }
}
