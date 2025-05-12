import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { GeneralServerException } from '../error';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost): any {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    // Eğer custom error değilse ama NestJS HttpException ise
    if (!exception.isCustomError && exception instanceof HttpException) {
      const status = exception.getStatus();
      const responseBody = exception.getResponse();
      response.status(status).json({
        meta: {
          headers: request.headers,
          params: request.params,
          status,
          errorCode: null,
          errorMessage:
            typeof responseBody === 'string'
              ? responseBody
              : responseBody['message'],
          timestamp: new Date().toISOString(),
        },
        result: responseBody,
      });
      return;
    }

    if (!exception.isCustomError) {
      exception = new GeneralServerException();
    }

    response.status(exception.httpStatusCode ?? 500).json({
      meta: {
        headers: request.headers,
        params: request.params,
        status: request.status,
        errorCode: exception.errorCode,
        errorMessage: exception.message,
        timestamp: new Date().toISOString(),
        // may be add "requestId" for trackging based on request
      },
      result: exception,
    });
  }
}
