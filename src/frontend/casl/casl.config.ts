import { ActionE, SessionStateE, SubjectE } from '../../utils/enum';

// TODO: Move below mapping to database
const _ACTIVE_MAP = new Map([
  [ActionE.READ, [ActionE.READ]],
  [ActionE.WRITE, [ActionE.READ, ActionE.WRITE]],
  [ActionE.DOWNLOAD, [ActionE.READ, ActionE.DOWNLOAD]],
  [
    ActionE.UPLOAD,
    [ActionE.READ, ActionE.DOWNLOAD, ActionE.WRITE, ActionE.UPLOAD],
  ],
]);

const _READ_ONLY_MAP = new Map([
  [ActionE.READ, [ActionE.READ]],
  [ActionE.WRITE, [ActionE.READ]],
  [ActionE.DOWNLOAD, [ActionE.READ, ActionE.DOWNLOAD]],
  [ActionE.UPLOAD, [ActionE.READ, ActionE.DOWNLOAD]],
]);

export const SESSION_TO_ACTION_MAPPER = new Map([
  [SessionStateE.PLANNED, { [SubjectE.DEFAULT]: _READ_ONLY_MAP }],
  [SessionStateE.ACTIVE, { [SubjectE.DEFAULT]: _ACTIVE_MAP }],
  [SessionStateE.LOCKED, { [SubjectE.DEFAULT]: _READ_ONLY_MAP }],
  [
    SessionStateE.ORDER_LOCKED,
    { [SubjectE.DEFAULT]: _ACTIVE_MAP, [SubjectE.ORDERS]: _READ_ONLY_MAP },
  ],
  [SessionStateE.REPORTING, { [SubjectE.DEFAULT]: _READ_ONLY_MAP }],
  [SessionStateE.COMPLETED, { [SubjectE.DEFAULT]: _READ_ONLY_MAP }],
]);

export const SUBJECT_TO_ARGS_MAPPER = new Map([
  [SubjectE.ORDERS, ['trader_id', 'book_id', 'session_id']],
  [SubjectE.CURVES, ['trader_id', 'book_id', 'session_id']],
  [SubjectE.LIMITS, ['trader_id', 'book_id', 'session_id']],
  [SubjectE.SESSIONS, ['trader_id', 'book_id', 'session_id']],
  [SubjectE.DEMO, ['session_id']],
]);

export const DEFAULT_ABILITIES = [[SubjectE.ME, [ActionE.READ]]];

export const TRADER_ID_FOR_BOOK_LEVEL = -1;

export const DEMO_ORG_ID = 0;
