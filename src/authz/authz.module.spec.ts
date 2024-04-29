import { Test, TestingModule } from '@nestjs/testing';
import { AuthzModule } from './authz.module';
import { JwtStrategy } from './jwt.strategy';
import { GqlAuthGuard } from './gqlAuth.guard';
import { AuthzService } from './authz.service';
import { DatabaseModule } from '../common/database/database.module';
import { DatabaseEnvE } from '../common/database/database.constants-enums';
import { UserMeService } from '../common/user-me/user-me.service';
import { AppLogger } from '../common/logger/logger.service';

describe('AuthzModule', () => {
  let module: TestingModule;
  let jwtStrategy: JwtStrategy;
  let gqlAuthGuard: GqlAuthGuard;
  let authzService: AuthzService;
  let userMeService: UserMeService;
  let appLogger: AppLogger;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [DatabaseModule.register(DatabaseEnvE.TEST_ROLLBACK), AuthzModule],
    }).compile();

    jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
    gqlAuthGuard = module.get<GqlAuthGuard>(GqlAuthGuard);
    authzService = module.get<AuthzService>(AuthzService);
    userMeService = module.get<UserMeService>(UserMeService);
    appLogger = await module.resolve<AppLogger>(AppLogger);
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
    expect(jwtStrategy).toBeDefined();
    expect(gqlAuthGuard).toBeDefined();
    expect(authzService).toBeDefined();
    expect(userMeService).toBeDefined();
    expect(appLogger).toBeDefined();
  });
});