import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TodoFactory } from './model/todo.model';
import { TodoController } from './controller/todo.controller';
import { TodoService } from './service/todo.service';
import { TodoRepository } from './repository/todo.repository';

@Global()
@Module({
  imports: [MongooseModule.forFeatureAsync([TodoFactory])],
  controllers: [TodoController],
  providers: [TodoService, TodoRepository],
  exports: [TodoService],
})
export class TodoModule {}
