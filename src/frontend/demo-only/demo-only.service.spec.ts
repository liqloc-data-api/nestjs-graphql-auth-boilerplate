import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from '../../common/database/database.service';
import { DatabaseModule } from '../../common/database/database.module';
import { DatabaseEnvE } from '../../common/database/database.constants-enums';
import { AppLogger } from '../../common/logger/logger.service';
import { DemoOnlyService } from './demo-only.service';
import { DemoOnlyModule } from './demo-only.module';
import { SessionsService } from '../sessions/sessions.service';

jest.useRealTimers();

describe('FeSettingsService', () => {
  let demoOnlyService: DemoOnlyService;
  let dbService: DatabaseService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        DemoOnlyModule,
        DatabaseModule.register(DatabaseEnvE.TEST_ROLLBACK),
      ],
      providers: [SessionsService, DatabaseService, DemoOnlyService, AppLogger],
    }).compile();
    demoOnlyService = module.get<DemoOnlyService>(DemoOnlyService);
    dbService = module.get<DatabaseService>(DatabaseService);
    await dbService.onModuleInit();
  });

  afterAll(async () => {
    await dbService.onModuleDestroy();
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(demoOnlyService).toBeDefined();
    expect(demoOnlyService).toBeInstanceOf(DemoOnlyService);
  });

  it('should return correct object for getAllFeSettings', async () => {
    const expectedValue = ["trader_id", "book_id"];
    const receivedValue = await demoOnlyService.demoBookTraderInitiation(
      2,
      'test@user.com',
      undefined,
      'testBook',
      undefined,
      4,
    );
    expect(Object.getOwnPropertyNames(receivedValue)).toStrictEqual(
      expectedValue,
    );
  });
});
