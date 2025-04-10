export class CustomException extends Error {
  message: string; // messsage for the developers
  httpStatusCode: number;
  errorCode: number; // specific error code for the error.
  isCustomError = true;
  errorMessage: string; // errorMessage for the last users

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
