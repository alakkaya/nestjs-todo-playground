import { ErrorCode } from '../error-code';
import { CustomException } from './custom.exception';

export class BadInputException extends CustomException {
  constructor(
    message: string,
    errorCode: ErrorCode = ErrorCode.BAD_INPUT,
    errorMessage: string = 'Bad input',
  ) {
    super(message, 400, errorCode, errorMessage);
  }
}
