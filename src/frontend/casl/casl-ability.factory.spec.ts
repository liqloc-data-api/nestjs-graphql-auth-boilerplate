import { Test, TestingModule } from '@nestjs/testing';
import { CASLAbilityFactory } from './casl-ability.factory';
import { CaslService } from './casl.service';
import { ActionE, SessionStateE, SubjectE } from '../../utils/enum';
import { AppLogger } from '../../common/logger/logger.service';


describe('CASLAbilityFactory', () => {
  let caslAbilityFactory: CASLAbilityFactory;
  let caslService: CaslService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CASLAbilityFactory, AppLogger, CaslService],
    }).compile();

    caslAbilityFactory = module.get<CASLAbilityFactory>(CASLAbilityFactory);
    caslService = module.get<CaslService>(CaslService);
  });

  it('should be defined', () => {
    expect(caslAbilityFactory).toBeDefined();
  });

  describe('createForUser', () => {
    it('should create abilities for user', () => {
      const user = {
        userMe: { active_session_books: [{}], permissions: [{}] },
      };
      const argContext = {};

      jest.spyOn(caslService, 'getSessionStatus').mockReturnValue(undefined);
      jest.spyOn(caslService, 'isValidPermission').mockReturnValue(false);
      jest
        .spyOn(caslService, 'getActionAndSubject')
        .mockReturnValue([[ActionE.READ], SubjectE.ORDERS]);

      const result = caslAbilityFactory.createForUser(user, argContext);

      expect(caslService.getSessionStatus).toHaveBeenCalledWith(
        user.userMe.active_session_books,
        argContext,
      );
      expect(caslService.isValidPermission).not.toHaveBeenCalledWith(
        argContext,
        {},
      );
      expect(caslService.getActionAndSubject).not.toHaveBeenCalledWith(
        user.userMe.permissions,
      );
      expect(result).toBeDefined(); // Add more specific expectations based on your implementation
    });

    it('should have session access but no valid permission', () => {
      const user = { userMe: { active_session_books: [], permissions: [{}] } };
      const argContext = {};

      jest.spyOn(caslService, 'getSessionStatus').mockReturnValue(SessionStateE.LOCKED);
      jest.spyOn(caslService, 'isValidPermission').mockReturnValue(false);

      const result = caslAbilityFactory.createForUser(user, argContext);

      expect(caslService.getSessionStatus).toHaveBeenCalledWith(
        user.userMe.active_session_books,
        argContext,
      );
      expect(caslService.isValidPermission).toHaveBeenCalledWith(
        argContext,
        {},
      );
      expect(result.rules).toEqual([
        { action: [ActionE.READ], subject: SubjectE.ME },
        { action: [ActionE.READ], subject: SubjectE.SESSIONS },
      ]); // Add more specific expectations based on your implementation
    });

    it('should handle valid session and permission scenario', () => {
      const user = { userMe: { active_session_books: [], permissions: [{}] } };
      const argContext = {};

      jest.spyOn(caslService, 'getSessionStatus').mockReturnValueOnce(SessionStateE.LOCKED);
      jest.spyOn(caslService, 'isValidPermission').mockReturnValue(true);
      jest
        .spyOn(caslService, 'getActionAndSubject')
        .mockReturnValue([[ActionE.WRITE], SubjectE.ORDERS]);

      const result = caslAbilityFactory.createForUser(user, argContext);

      expect(caslService.getSessionStatus).toHaveBeenCalledWith(
        user.userMe.active_session_books,
        argContext,
      );
      expect(caslService.isValidPermission).toHaveBeenCalledWith(
        argContext,
        user.userMe.permissions[0],
      );
      expect(caslService.getActionAndSubject).toHaveBeenCalledWith(
        user.userMe.permissions[0],
        "Locked",
      );
      expect(result.rules).toEqual([
        { action: [ActionE.READ], subject: SubjectE.ME },
        { action: [ActionE.READ], subject: SubjectE.SESSIONS },
        { action: [ActionE.WRITE], subject: SubjectE.ORDERS },
      ]); // Add more specific expectations based on your implementation
    });
  });
});
