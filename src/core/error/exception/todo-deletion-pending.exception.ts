import { ErrorCode } from '../error-code';
import { CustomException } from './custom.exception';

export class TodoDeletionPendingException extends CustomException {
  constructor(message = 'Todo deletion is already pending') {
    super(message, 409, ErrorCode.TODO_DELETION_PENDING, message);
  }
}
