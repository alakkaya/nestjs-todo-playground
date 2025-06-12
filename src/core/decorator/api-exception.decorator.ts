import { CustomException } from '../error/exception/custom.exception';
import { ApiResponseOptions } from '@nestjs/swagger';
import { DECORATORS } from '@nestjs/swagger/dist/constants';

export function ApiException(
  ...Exceptions: (new () => CustomException)[]
): MethodDecorator {
  const apiExceptions = Exceptions.map(
    (Exception): [number, ApiResponseOptions] => {
      const exception = new Exception() as CustomException;

      return [
        exception.httpStatusCode,
        {
          schema: {
            title: exception.constructor.name,
            properties: {
              meta: {
                type: 'object',
                properties: {
                  requestId: { type: 'string', example: 'abc123' },
                  headers: { type: 'object' },
                  params: { type: 'object' },
                  status: { type: 'number', example: exception.httpStatusCode },
                  errorCode: { type: 'number', example: exception.errorCode },
                  errorMessage: {
                    type: 'string',
                    example: exception.errorMessage,
                  },
                  timestamp: {
                    type: 'string',
                    example: new Date().toISOString(),
                  },
                },
                required: ['status', 'errorCode', 'errorMessage', 'timestamp'],
              },
              result: {
                type: 'object',
                example: {},
                description: 'Ek hata detayları veya orijinal hata objesi',
              },
            },
            required: ['meta', 'result'],
          },
          description: exception.errorMessage,
        },
      ];
    },
  );

  const groupedMetadata = {};
  apiExceptions.forEach(([statusCode, value]) => {
    groupedMetadata[statusCode] = groupedMetadata[statusCode] ?? {
      schema: { oneOf: [] },
    };
    groupedMetadata[statusCode].schema.oneOf.push(value['schema']);
    groupedMetadata[statusCode].description = value.description;
  });

  return (
    target: object,
    key?: string | symbol,
    descriptor?: PropertyDescriptor,
  ) => {
    const responses =
      Reflect.getMetadata(DECORATORS.API_RESPONSE, descriptor.value) || {};
    Reflect.defineMetadata(
      DECORATORS.API_RESPONSE,
      { ...responses, ...groupedMetadata },
      descriptor.value,
    );
    return descriptor;
  };
}
