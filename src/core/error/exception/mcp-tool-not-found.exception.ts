import { ErrorCode } from '../error-code';
import { NotFoundException } from './not-found.exception';

export class McpToolNotFoundException extends NotFoundException {
  constructor(toolName: string) {
    super(
      `MCP tool '${toolName}' not found`,
      ErrorCode.MCP_TOOL_NOT_FOUND,
      `Tool '${toolName}' is not available`,
    );
  }
}
