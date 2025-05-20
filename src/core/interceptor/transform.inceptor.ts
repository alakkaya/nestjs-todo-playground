import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { maskHelper } from '../helper';
import { Request, Response as ExpressResponse } from 'express';

export interface MetaInterface {
  headers: Record<string, any>;
  params: Record<string, any>;
  status: number;
  errorCode?: string;
  timestamp: string;
  requestId: string;
}

export interface Response<T> {
  meta: MetaInterface;
  result: T;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<ExpressResponse>();

    const requestId = (Math.random() + 1).toString(36).substring(2);
    const startTime = Date.now();

    // Request nesnesine değerleri ekle
    request['requestId'] = requestId;

    console.log({
      type: 'REQ',
      method: request.method,
      url: request.url,
      body: maskHelper(request.body || {}, ['password']),
      requestId,
      user: request['user'],
    });

    return next.handle().pipe(
      map((data: T) => {
        // Yanıtı hazırla
        const responseObject = {
          meta: {
            headers: request.headers as Record<string, any>,
            params: request.params,
            status: response.statusCode,
            timestamp: new Date().toISOString(),
            requestId: requestId,
          },
          result: data,
        };

        console.log({
          type: 'RES',
          method: request.method,
          url: request.url,
          requestId,
          responseTime: `${Date.now() - startTime}ms`,
          body: maskHelper({ ...responseObject }, ['password']),
          user: request['user'],
        });

        return responseObject;
      }),
    );
  }
}
