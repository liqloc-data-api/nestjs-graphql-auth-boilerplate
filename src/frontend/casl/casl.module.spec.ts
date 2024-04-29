import { Test, TestingModule } from '@nestjs/testing';
import { CASLAbilityFactory } from './casl-ability.factory';
import { CaslService } from './casl.service';
import { CaslModule } from './casl.module';
import { UserMeModule } from '../../common/user-me/user-me.module';
import { UserMeService } from '../../common/user-me/user-me.service';
import { DatabaseModule } from '../../common/database/database.module';
import { DatabaseEnvE } from '../../common/database/database.constants-enums';

describe('CaslModule', () => {
  let caslAbilityFactory: CASLAbilityFactory;
  let caslService: CaslService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule.register(DatabaseEnvE.TEST_ROLLBACK) ,CaslModule, UserMeModule],
      providers: [UserMeService],
    }).compile();

    caslAbilityFactory = module.get<CASLAbilityFactory>(CASLAbilityFactory);
    caslService = module.get<CaslService>(CaslService);
  });

  it('should be defined', () => {
    expect(caslAbilityFactory).toBeDefined();
    expect(caslService).toBeDefined();
  });
});
