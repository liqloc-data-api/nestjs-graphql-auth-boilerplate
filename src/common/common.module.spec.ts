import { Test, TestingModule } from '@nestjs/testing';
import { CommonModule } from './common.module';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { AppLogger } from './logger/logger.service';
import { DatabaseModule } from './database/database.module';
import { DatabaseEnvE } from './database/database.constants-enums';

describe('CommonModule', () => {
  let module: TestingModule;
  let loggingInterceptor: LoggingInterceptor;
  let appLogger: AppLogger;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [CommonModule, DatabaseModule.register(DatabaseEnvE.TEST_ROLLBACK)],
    }).compile();

    loggingInterceptor = module.get<LoggingInterceptor>(LoggingInterceptor);
    appLogger = await module.resolve<AppLogger>(AppLogger);
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
    expect(loggingInterceptor).toBeDefined();
    expect(appLogger).toBeDefined();
  });
});
