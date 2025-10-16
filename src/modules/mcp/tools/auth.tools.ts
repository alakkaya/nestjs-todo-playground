import { AuthService } from '../../auth/service/auth.service';
import { UserService } from '../../user/service/user.service';
import { McpTool } from 'src/core/interface';
import { McpToolNotFoundException } from 'src/core/error/exception/mcp-tool-not-found.exception';
import { formatMcpToolResponse } from 'src/core/helper';
import { AuthSchemas } from '../schemas';

export class AuthTools {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  getToolDefinitions() {
    return [
      {
        name: McpTool.AUTH_REGISTER.name,
        description: McpTool.AUTH_REGISTER.description,
        inputSchema: AuthSchemas.register,
      },
      {
        name: McpTool.AUTH_LOGIN.name,
        description: McpTool.AUTH_LOGIN.description,
        inputSchema: AuthSchemas.login,
      },
    ];
  }

  async handleToolCall(toolName: string, args: any) {
    switch (toolName) {
      case McpTool.AUTH_REGISTER.name:
        return await this.register(args);
      case McpTool.AUTH_LOGIN.name:
        return await this.login(args);
      default:
        throw new McpToolNotFoundException(toolName);
    }
  }

  private async register(args: any) {
    const result = await this.userService.create({
      fullname: args.fullname,
      nickname: args.nickname,
      password: args.password,
    });

    return formatMcpToolResponse('User registered successfully', {
      userId: result.id,
    });
  }

  private async login(args: any) {
    const result = await this.authService.signIn({
      nickname: args.nickname,
      password: args.password,
    });

    return formatMcpToolResponse('User logged in successfully', {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  }
}
