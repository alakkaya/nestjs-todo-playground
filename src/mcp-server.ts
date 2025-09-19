import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { McpServer } from './modules/mcp/server/mcp.server';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const mcpServer = app.get(McpServer);

  await mcpServer.start();
}

bootstrap();
