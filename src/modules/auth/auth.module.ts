import { Global, Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { AuthController } from './controller/auth.controller';
import { AuthService } from './service';
import { JwtService } from '@nestjs/jwt';

@Global()
@Module({
  imports: [UserModule],
  controllers: [AuthController],
  providers: [AuthService, JwtService],
  exports: [AuthService],
})
export class AuthModule {}
