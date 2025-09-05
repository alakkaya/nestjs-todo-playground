import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TodoFactory } from './model/todo.model';
import { TodoController } from './controller/todo.controller';
import { TodoService } from './service/todo.service';
import { TodoRepository } from './repository/todo.repository';
import { ElasticSearchModule } from '../utils/elastic-search/elastic-search.module';
import { TodoSearchService } from '../utils/elastic-search/services/todo-search.service';
import { RabbitmqModule } from '../utils/rabbitmq/rabbitmq.module';
import { BullMQModule } from '../utils/bullmq/bullmq.module';

@Global()
@Module({
  imports: [
    MongooseModule.forFeatureAsync([TodoFactory]),
    ElasticSearchModule,
    RabbitmqModule,
    BullMQModule,
  ],
  controllers: [TodoController],
  providers: [TodoService, TodoRepository, TodoSearchService],
  exports: [TodoService, TodoRepository], // TodoRepository'yi de export edelim
})
export class TodoModule {}
