import { ErrorCode } from '../error-code';
import { NotFoundException } from './not-found.exception';

export class TodoNotFoundException extends NotFoundException {
  constructor(message = 'Todo not found or access denied') {
    super(message, ErrorCode.TODO_NOT_FOUND, message);
  }
}
