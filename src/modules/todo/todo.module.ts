import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TodoFactory } from './model/todo.model';
import { TodoController } from './controller/todo.controller';
import { TodoService } from './service/todo.service';
import { TodoRepository } from './repository/todo.repository';
import { ElasticSearchModule } from '../utils/elastic-search/elastic-search.module';
import { TodoSearchService } from '../utils/elastic-search/services/todo-search.service';

@Global()
@Module({
  imports: [MongooseModule.forFeatureAsync([TodoFactory]), ElasticSearchModule],
  controllers: [TodoController],
  providers: [TodoService, TodoRepository, TodoSearchService],
  exports: [TodoService],
})
export class TodoModule {}
