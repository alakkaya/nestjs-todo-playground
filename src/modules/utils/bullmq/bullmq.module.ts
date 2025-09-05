import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { TodoDeletionJobService } from './services/todo-deletion-job.service';
import { TodoDeletionJobProcessor } from './processors/todo-deletion-job.processor';
import { TodoRepository } from '../../todo/repository/todo.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { TodoFactory } from '../../todo/model/todo.model';
import { RabbitmqModule } from '../rabbitmq/rabbitmq.module';
import { RedisModule } from 'src/core/cache/redis.module';

@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
        },
      }),
    }),
    BullModule.registerQueue({
      name: 'todo-deletion-jobs',
    }),
    MongooseModule.forFeatureAsync([TodoFactory]),
    RabbitmqModule,
    RedisModule,
  ],
  providers: [TodoDeletionJobService, TodoDeletionJobProcessor, TodoRepository],
  exports: [TodoDeletionJobService],
})
export class BullMQModule {}
