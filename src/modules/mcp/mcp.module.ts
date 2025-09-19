import { Module } from '@nestjs/common';
import { McpServer } from './server/mcp.server';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [AuthModule, UserModule],
  providers: [McpServer],
  exports: [McpServer],
})
export class McpModule {}
