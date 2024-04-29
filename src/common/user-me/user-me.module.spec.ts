import { Test, TestingModule } from '@nestjs/testing';
import { UserMeService } from './user-me.service';
import { UserMeModule } from './user-me.module';
import { DatabaseModule } from '../database/database.module';
import { DatabaseEnvE } from '../database/database.constants-enums';

describe('UserMeModule', () => {
  let userMeService: UserMeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule.register(DatabaseEnvE.TEST_ROLLBACK), UserMeModule],
    }).compile();

    userMeService = module.get<UserMeService>(UserMeService);
  });

  it('should be defined', () => {
    expect(userMeService).toBeDefined();
  });
});