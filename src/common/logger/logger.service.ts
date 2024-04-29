import { DB_PORT, LOG_DB_HOST, LOG_DB_NAME, LOG_DB_PORT, LOG_FILE } from 'environments';
import { ExecutionContext, Injectable, Scope } from '@nestjs/common';
import { createLogger, Logger, transports, format } from 'winston';
import 'winston-mongodb';
import { UserMeInfo } from '../decorators/currentUser.decorator';
import { UserMe } from 'graphql.schema';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable({ scope: Scope.TRANSIENT })
export class AppLogger {
  private context?: string;
  private logger: Logger;

  public setContext(context: string): void {
    this.context = context;
  }

  constructor() {
    this.logger = createLogger({
      format: format.combine(
        format.colorize(),
        format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        format.printf(
          (info) =>
            `${info.timestamp} ${info.level}: ${info.contextName} ${info.message}`,
        ),
      ),
      transports: [
        new transports.Console({ level: 'debug' }),
        ...(process.env.NODE_ENV === 'production'
          ? [
              new transports.MongoDB({
                db: `mongodb://${LOG_DB_HOST}:${LOG_DB_PORT}/${LOG_DB_NAME}`,
                options: { useUnifiedTopology: true },
                collection: 'debug',
                format: format.json(),
                level: 'debug',
                metaKey: 'meta',
              }),
              new transports.MongoDB({
                db: `mongodb://${LOG_DB_HOST}:${LOG_DB_PORT}/${LOG_DB_NAME}`,
                options: { useUnifiedTopology: true },
                collection: 'logs',
                format: format.json(),
                level: 'info',
                metaKey: 'meta',
              }),
            ]
          : [new transports.File({ filename: LOG_FILE, level: 'debug' })]),
      ],
    });
  }

  error(message: string, meta?: Record<string, any>): Logger {
    return this.logger.error({
      message,
      contextName: this.context,
      meta,
    });
  }

  warn(message: string, meta?: Record<string, any>): Logger {
    return this.logger.warn({
      message,
      contextName: this.context,
      meta,
    });
  }

  debug(message: string, meta?: Record<string, any>): Logger {
    return this.logger.debug({
      message,
      contextName: this.context,
      meta,
    });
  }

  verbose(message: string, meta?: Record<string, any>): Logger {
    return this.logger.verbose({
      message,
      contextName: this.context,
      meta,
    });
  }

  log(message: string, meta?: Record<string, any>): Logger {
    return this.logger.info({
      message,
      contextName: this.context,
      meta,
    });
  }
}
