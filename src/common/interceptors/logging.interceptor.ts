import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AppLogger } from '../logger/logger.service';
import * as chalk from 'chalk';
import { PRIMARY_COLOR } from 'environments';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly Logger: AppLogger) {
    this.Logger.setContext(LoggingInterceptor.name);
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = GqlExecutionContext.create(context);
    if (context.getArgs()[3]) {
      const parentType = context.getArgs()[3]['parentType'];
      const fieldName = chalk
        .hex(PRIMARY_COLOR)
        .bold(`${context.getArgs()[3]['fieldName']}`);
      return next.handle().pipe(
        tap(() => {
          this.Logger.log(`⛩  ${parentType} » ${fieldName}`, ctx.getContext().req);
        }),
      );
    } else {
      const parentType = chalk
        .hex(PRIMARY_COLOR)
        .bold(`${context.getArgs()[0].route.path}`);
      const fieldName = chalk
        .hex(PRIMARY_COLOR)
        .bold(`${context.getArgs()[0].route.stack[0].method}`);
      return next.handle().pipe(
        tap(() => {
          this.Logger.log(`⛩  ${parentType} » ${fieldName}`, ctx.getContext().req);
        }),
      );
    }
  }
}
