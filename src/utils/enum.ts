export enum ActionE {
  READ = 'Read',
  WRITE = 'Write',
  DOWNLOAD = 'Download',
  UPLOAD = 'Upload',
  OWNER = 'Owner',
}

export enum SubjectE {
  DEFAULT = 'Default',
  ORDERS = 'Orders',
  LIMITS = 'Limits',
  CURVES = 'Curves',
  SESSIONS = 'Sessions',
  ME = 'Me',
  TEST = 'Test',
  DEMO = 'DEMO',
}

export enum SessionStateE {
  PLANNED = 'Planned',
  ACTIVE = 'Active',
  LOCKED = 'Locked',
  ORDER_LOCKED = 'OrderLocked',
  REPORTING = 'Reporting',
  COMPLETED = 'Completed',
}

export enum SessionRunStateE {
  DEFINED = 'Defined',
  INITIALIZED = 'Initialized',
  COMPLETED = 'Completed',
  REPORTING = 'Reporting',
  ARCHIVE = 'Archive',
}

export enum QTypeE {
  QUERY = 'QUERY',
  ADD = 'ADD',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

export function getEnumKeyByEnumValue(myEnum, enumValue) {
  let keys = Object.keys(myEnum).filter((x) => myEnum[x] == enumValue);
  return keys.length > 0 ? keys[0] : null;
}
