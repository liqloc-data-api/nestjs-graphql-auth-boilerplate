import { Test, TestingModule } from '@nestjs/testing';
import { SessionsResolver } from './sessions.resolver';
import { SessionsService } from './sessions.service';
import { AppLogger } from '../../common/logger/logger.service';
import { DatabaseService } from '../../common/database/database.service';
import { SessionsModule } from './sessions.module';
import { DatabaseModule } from '../../common/database/database.module';
import { DatabaseEnvE } from '../../common/database/database.constants-enums';

describe('SessionsResolver', () => {
  let sessionsResolver: SessionsResolver;
  let sessionsService: any;

  beforeAll(async () => {
    sessionsService = {getSession: jest.fn(), getSessionInstruments: jest.fn()}
    sessionsResolver = new SessionsResolver(sessionsService);
  });

  it('should be defined', async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [SessionsModule, DatabaseModule.register(DatabaseEnvE.TEST_ROLLBACK)],
      providers: [SessionsService, DatabaseService, AppLogger],
    }).compile();

    const resolver = module.get<SessionsResolver>(SessionsResolver);
    expect(resolver).toBeDefined();
  });

  it('should pass the correct arguments to sessionsService.getSession', async () => {
    const sessionId = 1;
    sessionsResolver.getSession(sessionId);
    expect(sessionsService.getSession).toHaveBeenCalledWith(sessionId);
  });

});