import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from '../../common/database/database.service';
import { FeSettingsService } from './fe-settings.service';
import { FeSettingsModule } from './fe-settings.module';
import { DatabaseModule } from '../../common/database/database.module';
import { DatabaseEnvE } from '../../common/database/database.constants-enums';
import { AppLogger } from '../../common/logger/logger.service';

jest.useRealTimers();

describe('FeSettingsService', () => {
  let feSettingsService: FeSettingsService;
  let dbService: DatabaseService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [FeSettingsModule, DatabaseModule.register(DatabaseEnvE.TEST_ROLLBACK)],
      providers: [DatabaseService, FeSettingsService, AppLogger],
    }).compile();
    feSettingsService = module.get<FeSettingsService>(FeSettingsService);
    dbService = module.get<DatabaseService>(DatabaseService);
    await dbService.onModuleInit();
  });

  afterAll(async () => {
    await dbService.onModuleDestroy();
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(feSettingsService).toBeDefined();
    expect(feSettingsService).toBeInstanceOf(FeSettingsService);
  });

  it('should return correct object for getAllFeSettings', async () => {
    const expectedValue = [
      'GET_SESSION_FE_SETTINGS',
      'GET_SESSION_BOOK_FE_SETTINGS',
      'GET_SESSION_USER_FE_SETTINGS',
      'GET_SESSION_BOOK_USER_FE_SETTINGS',
    ];
    const receivedValue = await feSettingsService.getAllFeSettings(2, 3, 2);
    expect(Object.getOwnPropertyNames(receivedValue)).toStrictEqual(
      expectedValue,
    );
  });
});
