import { Test, TestingModule } from '@nestjs/testing';
import { UserMeService } from './user-me.service';
import { DatabaseService } from '../database/database.service';
import { DatabaseModule } from '../database/database.module';
import { AppLogger } from '../logger/logger.service';
import { DatabaseEnvE } from '../database/database.constants-enums';


describe('UserMeService', () => {
  let service: UserMeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports : [DatabaseModule.register(DatabaseEnvE.TEST_ROLLBACK)],
      providers: [AppLogger, UserMeService, DatabaseService], // Add DatabaseService to the providers
    }).compile();

    service = module.get<UserMeService>(UserMeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
