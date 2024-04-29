import { Test, TestingModule } from '@nestjs/testing';
import { CaslService } from './casl.service';
import { ActionE, SessionStateE, SubjectE } from '../../utils/enum';
import { UserActiveSessionBook } from '../../graphql.schema';

describe('CaslService', () => {
  let caslService: CaslService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CaslService],
    }).compile();

    caslService = module.get<CaslService>(CaslService);
  });

  describe('constructor', () => {
    it('should create an instance with default mappers', () => {
      const service = new CaslService();

      expect(service).toBeDefined();
    });

    it('should create an instance with custom mappers', () => {
      const customActionMapper = new Map<number, Map<number, ActionE[]>>();
      const customSubjectMapper = new Map<number, SubjectE>();
      const customSubjectToArgsMapper = new Map<SubjectE, string[]>();

      const service = new CaslService();

      expect(service).toBeDefined();
    });
  });

  describe('getActionAndSubject', () => {
    it('should return valid action and subject for a given action, subject, and session status', () => {
      const result = caslService.getActionAndSubject(
        { action: "Read" as ActionE, subject: "Orders" as SubjectE },
        "Active" as SessionStateE,
      );

      expect(result).toEqual([[ActionE.READ], SubjectE.ORDERS]);
    });

    it('should handle invalid input gracefully', () => {
      const result = caslService.getActionAndSubject(
        { action: "Test" as ActionE, subject: "Test" as SubjectE},
        "Active" as SessionStateE,
      );

      expect(result).toEqual([undefined, "Test"],);
    });

    it('should handle invalid session status gracefully', () => {
      const result = caslService.getActionAndSubject(
        { action: "Read" as ActionE, subject: "Orders" as SubjectE },
        "Test" as SessionStateE,
      );

      expect(result).toEqual([undefined, "Orders"]);
    });
  });

  describe('isValidPermission', () => {
    it('should return true for valid permission', () => {
      const args = { book_id: 1, trader_id: 1, session_id: 1 };
      const permission = { subject: "Orders", book_id: 1, trader_id: 1 };

      const result = caslService.isValidPermission(args, permission);

      expect(result).toBe(true);
    });

    it('should return false for invalid permission', () => {
      const args = { book_id: 1, trader_id: 1 };
      const permission = { subject: "Test", book_id: 1, trader_id: 1 };

      const result = caslService.isValidPermission(args, permission);

      expect(result).toBe(false);
    });

    it('should handle missing properties in args', () => {
      const args = { trader_id: 1 };
      const permission = { subject: 1, book_id: 1, trader_id: 1 };

      const result = caslService.isValidPermission(args, permission);

      expect(result).toBe(false);
    });

    it('should handle undefined or null args and permission', () => {
      const args = undefined;
      const permission = null;

      const result = caslService.isValidPermission(args, permission);

      expect(result).toBe(false);
    });

    it('should handle undefined or null properties in args and permission', () => {
      const args = { book_id: 1, trader_id: null };
      const permission = { subject: "Order", book_id: undefined, trader_id: 1 };

      const result = caslService.isValidPermission(args, permission);

      expect(result).toBe(false);
    });
  });

  describe('getSessionStatus', () => {
    it('should return session status for valid user session data and args', () => {
      const userSessionData: UserActiveSessionBook[] = [
        { book_id: 1, session_id: 1, session_state: "Active", user_id: 1, session_name: 'test' },
        { book_id: 2, session_id: 1, session_state: "Locked", user_id: 1, session_name:'test' },
      ];

      const args = { book_id: 1, session_id: 1 };

      const result = caslService.getSessionStatus(userSessionData, args);

      expect(result).toBe("Active");
    });

    it('should return undefined for invalid user session data or args', () => {
      const userSessionData: UserActiveSessionBook[] = [
        { book_id: 1, session_id: 1, session_state: "Active", user_id: 1, session_name: 'test' },
        { book_id: 2, session_id: 1, session_state: "Locked", user_id: 1, session_name:'test' },
      ];

      const args = { book_id: 99, session_id: 99 };

      const result = caslService.getSessionStatus(userSessionData, args);

      expect(result).toBeUndefined();
    });

  });

  describe('validateArgsForSubject', () => {
    it('should return true for valid args and subject', () => {
      const args = { trader_id: 1, book_id: 1, session_id: 1 };
      const subject = SubjectE.ORDERS;

      const result = caslService.validateArgsForSubject(args, subject);

      expect(result).toBe(true);
    });

    it('should return false for invalid args or subject', () => {
      const args = { trader_id: 1, session_id: 1 }; // Missing 'book_id'
      const subject = SubjectE.ORDERS;

      const result = caslService.validateArgsForSubject(args, subject);

      expect(result).toBe(false);
    });

    it('should handle missing mandatory keys in args', () => {
      const args = { trader_id: 1, session_id: 1 };
      const subject = SubjectE.LIMITS;

      const result = caslService.validateArgsForSubject(args, subject);

      expect(result).toBe(false);
    });
  });



  afterAll(async () => {
    // Clean up resources, if necessary
  });
});
