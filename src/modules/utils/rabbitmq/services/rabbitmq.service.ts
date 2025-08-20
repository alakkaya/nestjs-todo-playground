import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
import { Environment } from 'src/core/interface';

@Injectable()
export class RabbitmqService {
  private connection: amqp.Connection;
  private channel: amqp.Channel;

  constructor(private readonly configService: ConfigService<Environment>) {}

  async connect(): Promise<void> {
    try {
      this.connection = await amqp.connect(
        this.configService.get<string>('RABBITMQ_URL'),
      );
      this.channel = await this.connection.createChannel();

      // Queue'yu oluştur
      await this.channel.assertQueue(
        this.configService.get<string>(
          'RABBITMQ_QUEUE_TODO_ELASTICSEARCH_SYNC',
        ),
        { durable: true },
      );
    } catch (error) {
      console.error('RabbitMQ connection failed:', error);
      throw error;
    }
  }

  async publishTodoEvent(event: string, data: any): Promise<void> {
    if (!this.channel) {
      await this.connect();
    }

    const message = {
      event,
      data,
      timestamp: new Date().toISOString(),
    };

    this.channel.sendToQueue(
      this.configService.get<string>('RABBITMQ_QUEUE_TODO_ELASTICSEARCH_SYNC'),
      Buffer.from(JSON.stringify(message)),
      { persistent: true },
    );
  }

  async close(): Promise<void> {
    if (this.channel) await this.channel.close();
    if (this.connection) await this.connection.close();
  }
}
