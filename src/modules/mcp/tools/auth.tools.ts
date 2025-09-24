import { AuthService } from '../../auth/service/auth.service';
import { UserService } from '../../user/service/user.service';
import { SignInDto } from '../../auth/dto';
import { CreateUserDto } from '../../user/dto';
import { McpTool } from 'src/core/interface';
import { McpToolNotFoundException } from 'src/core/error/exception/mcp-tool-not-found.exception';
import { validationMetadatasToSchemas } from 'class-validator-jsonschema';
import { formatMcpToolResponse } from 'src/core/helper';

export class AuthTools {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  getToolDefinitions() {
    const schemas = validationMetadatasToSchemas();

    return [
      {
        name: McpTool.AUTH_REGISTER.name,
        description: McpTool.AUTH_REGISTER.description,
        inputSchema: schemas.CreateUserDto,
      },
      {
        name: McpTool.AUTH_LOGIN.name,
        description: McpTool.AUTH_LOGIN.description,
        inputSchema: schemas.SignInDto,
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
    return formatMcpToolResponse('User registered successfully', {
      userId: result.id,
    });
  }

  private async login(args: SignInDto) {
    const result = await this.authService.signIn(args);
    return formatMcpToolResponse('User logged in successfully', {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  }
}
