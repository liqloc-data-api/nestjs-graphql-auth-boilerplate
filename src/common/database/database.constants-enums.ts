export enum DatabaseEnvE {
    TEST_ROLLBACK = 'test_rollback',
    TEST_COMMIT = 'test_commit',
    PROD = 'production',
}

export enum QStatusE {
    SUCCESS = 1,
    ERROR = 0,
}

export const DB_ENV = 'DB_ENV';