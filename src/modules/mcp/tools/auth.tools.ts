import { AuthService } from '../../auth/service/auth.service';
import { UserService } from '../../user/service/user.service';
import { SignInDto } from '../../auth/dto';
import { CreateUserDto } from '../../user/dto';
import { McpTool } from 'src/core/interface';
import { McpToolNotFoundException } from 'src/core/error/exception/mcp-tool-not-found.exception';

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
        inputSchema: {
          type: 'object',
          properties: {
            fullname: {
              type: 'string',
              description: 'User full name',
            },
            nickname: {
              type: 'string',
              description: 'User nickname',
            },
            password: {
              type: 'string',
              description: 'User password',
            },
          },
          required: ['fullname', 'nickname', 'password'],
        },
      },
      {
        name: McpTool.AUTH_LOGIN.name,
        description: McpTool.AUTH_LOGIN.description,
        inputSchema: {
          type: 'object',
          properties: {
            nickname: {
              type: 'string',
              description: 'User nickname',
            },
            password: {
              type: 'string',
              description: 'User password',
            },
          },
          required: ['nickname', 'password'],
        },
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

  private async register(args: CreateUserDto) {
    const result = await this.userService.create(args);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            message: 'User registered successfully',
            data: {
              id: result.id,
            },
          }),
        },
      ],
    };
  }

  private async login(args: SignInDto) {
    const result = await this.authService.signIn(args);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            message: 'Login successful',
            data: {
              accessToken: result.accessToken,
              refreshToken: result.refreshToken,
            },
          }),
        },
      ],
    };
  }
}
