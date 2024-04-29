import { DynamicModule, Global, Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { LoggerModule } from '../logger/logger.module';
import { AppLogger } from '../logger/logger.service';
import { DB_ENV, DatabaseEnvE } from './database.constants-enums';

@Global()
@Module({})
export class DatabaseModule {
  static register(dbEnv: DatabaseEnvE): DynamicModule {
    return {
      module: DatabaseModule,
      imports: [LoggerModule],
      providers: [
        { provide: DB_ENV, useValue: dbEnv },
        DatabaseService,
        AppLogger,
      ],
      exports: [DB_ENV, DatabaseService],
    };
  }
}
