import { ErrorCode } from '../error-code';
import { BadInputException } from './bad-input.exception';

export class NicknameAlreadyTakenException extends BadInputException {
  constructor() {
    super('Nickname already taken', ErrorCode.NICKNAME_ALREADY_TAKEN);
  }
}
