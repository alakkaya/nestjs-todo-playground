import { ErrorCode } from '../error-code';
import { UnauthorizedException } from './unauthorized.exception';

export class InvalidRefreshTokenException extends UnauthorizedException {
  constructor() {
    super();
    this.errorCode = ErrorCode.INVALID_REFRESH_TOKEN;
    this.message = 'Invalid refresh token';
    this.errorMessage = 'Invalid or expired refresh token';
  }
}
