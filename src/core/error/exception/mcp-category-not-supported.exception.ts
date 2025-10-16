import { ErrorCode } from '../error-code';
import { BadInputException } from './bad-input.exception';

export class McpCategoryNotSupportedException extends BadInputException {
  constructor(category: string) {
    super(
      `MCP tool category '${category}' is not supported`,
      ErrorCode.MCP_CATEGORY_NOT_SUPPORTED,
      `Category '${category}' is not available`,
    );
  }
}
