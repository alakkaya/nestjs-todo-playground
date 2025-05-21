import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../interface/mongo-model';

export const ReqUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
