import { Test, TestingModule } from '@nestjs/testing';
import { SessionsService } from './sessions.service';
import { DatabaseService } from '../../common/database/database.service';
import { SessionsModule } from './sessions.module';
import { DatabaseModule } from '../../common/database/database.module';
import { AppLogger } from '../../common/logger/logger.service';
import { DatabaseEnvE } from '../../common/database/database.constants-enums';

describe('SessionsService', () => {
  let sessionsService: SessionsService;
  let dbService: DatabaseService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [SessionsModule, DatabaseModule.register(DatabaseEnvE.TEST_ROLLBACK)],
      providers: [DatabaseService, SessionsService, AppLogger],
    }).compile();
    sessionsService = module.get<SessionsService>(SessionsService);
    dbService = module.get<DatabaseService>(DatabaseService);
    dbService.onModuleInit();
  });

  afterAll(() => {
    dbService.onModuleDestroy();
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(sessionsService).toBeDefined();
    expect(sessionsService).toBeInstanceOf(SessionsService);
  });

  it('should return correct object for getSession', async () => {
    const expectedValue = {
      deleted: false,
      instrument_csv: null,
      meta_data: null,
      product_id: 2,
      session_date: '2024-02-02', // Convert date string to date object
      session_id: 7,
      session_name: 'MMAQ_integration',
      session_state: 'Active',
      session_time: '11:00:00+00',
      status: true,
      updated_at: '2024-02-01 22:40:46.763671+00', 
      updated_by: 1,
    };
  
    const receivedValue = await sessionsService.getSession(7);
    expect(receivedValue).toStrictEqual(expectedValue);
  });
  
});
