import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ElasticSearchModule } from '../elastic-search/elastic-search.module';
import { TodoSearchService } from '../elastic-search/services/todo-search.service';
import { RabbitmqService } from './services/rabbitmq.service';
import { TodoEventConsumerService } from './consumers/todo-event.consumer';

@Module({
  imports: [ConfigModule, ElasticSearchModule],
  providers: [RabbitmqService, TodoEventConsumerService, TodoSearchService],
  exports: [RabbitmqService],
})
export class RabbitmqModule {}
