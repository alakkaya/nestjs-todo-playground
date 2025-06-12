import { applyDecorators, Type } from '@nestjs/common';
import { ApiResponse, getSchemaPath, ApiExtraModels } from '@nestjs/swagger';

interface ApiResponseSchemaOptions<TModel> {
  model?: TModel;
  status?: number;
  description?: string;
}

export const ApiResponseSchema = <TModel extends Type<any>>(
  modelOrOptions?: TModel | ApiResponseSchemaOptions<TModel>,
): MethodDecorator => {
  let model: TModel | undefined;
  let status = 200;
  let description: string | undefined;

  if (typeof modelOrOptions === 'object' && 'model' in modelOrOptions) {
    model = modelOrOptions.model;
    status = modelOrOptions.status ?? 200;
    description = modelOrOptions.description;
  } else {
    model = modelOrOptions as TModel;
  }

  const decorators = [];

  if (model) {
    decorators.push(ApiExtraModels(model));
  }

  decorators.push(
    ApiResponse({
      status,
      description,
      schema: {
        allOf: [
          {
            properties: {
              meta: {
                type: 'object',
                properties: {
                  requestId: { type: 'string', example: 'abc123' },
                  headers: { type: 'object' },
                  params: { type: 'object' },
                  status: { type: 'number', example: status },
                  timestamp: {
                    type: 'string',
                    example: new Date().toISOString(),
                  },
                },
              },
              ...(model && {
                result: { $ref: getSchemaPath(model) },
              }),
            },
          },
        ],
      },
    }),
  );

  return applyDecorators(...decorators);
};
