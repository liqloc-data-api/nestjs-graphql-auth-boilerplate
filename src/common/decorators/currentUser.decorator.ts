import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const UserMeInfo = createParamDecorator(
  (data: string | undefined, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    if (data) {
      return ctx.getContext().req.user?.[data]
    }
    return ctx.getContext().req.user;
  },
);
