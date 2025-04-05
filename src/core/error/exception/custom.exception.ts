export class CustomException extends Error {
  message: string;
  httpStatusCode: number;
  errorCode: number;
  isCustomError = true;
  errorMessage: string;

  constructor(
    message: string,
    httpStatusCode: number,
    errorCode: number,
    errorMessage: string,
  ) {
    super();
    this.message = message;
    this.httpStatusCode = httpStatusCode;
    this.errorCode = errorCode;
    this.errorMessage = errorMessage;
    this.isCustomError = true;
  }
}
