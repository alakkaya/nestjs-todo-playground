import { Module } from '@nestjs/common';
import { UserModule } from './modules/user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { configDotenv } from 'dotenv';
import { UserService } from './modules/user/service';
import { UserRepository } from './modules/user/repository';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { RedisModule } from '@nestjs-modules/ioredis';
import { Environment } from './core/interface';
import { TodoModule } from './modules/todo/todo.module';
import { RabbitmqModule } from './modules/utils/rabbitmq/rabbitmq.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService<Environment>) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService<Environment>) => ({
        type: 'single',
        url: `redis://${configService.get('REDIS_HOST')}:${configService.get('REDIS_PORT')}`,
      }),
      inject: [ConfigService],
    }),
    UserModule,
    AuthModule,
    TodoModule,
    RabbitmqModule,
  ],

  controllers: [],
  providers: [],
})
export class AppModule {}
