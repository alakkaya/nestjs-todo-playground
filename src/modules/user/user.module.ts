import { Module } from '@nestjs/common';
import { UserService } from './service/user.service';
import { UserController } from './controller/user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserFactory } from './model/user.model';
import { UserRepository } from './repository';

@Module({
  imports: [MongooseModule.forFeatureAsync([UserFactory])],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserService],
})
export class UserModule {}
