import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { GeneralServerException } from '../error';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost): any {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    if (!exception.isCustomError) {
      exception = new GeneralServerException();
    }

    response.status(500).json({
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
