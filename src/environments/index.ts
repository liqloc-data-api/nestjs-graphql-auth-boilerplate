const NODE_ENV: string = process.env.NODE_ENV || 'development';

// application
const PORT: number = +process.env.PORT || 4001;
const PROD_PORT: number = +process.env.PROD_PORT || 4008;
const DOMAIN: string = process.env.DOMAIN || 'localhost';
const END_POINT: string = process.env.END_POINT || 'graphql';
const VOYAGER: string = process.env.VOYAGER || 'voyager';
const PRIMARY_COLOR: string = process.env.PRIMARY_COLOR || '#87e8de';
const RATE_LIMIT_MAX: number = +process.env.RATE_LIMIT_MAX || 1000;
const GRAPHQL_DEPTH_LIMIT: number = +process.env.GRAPHQL_DEPTH_LIMIT || 3;
const PAYLOAD_LIMIT: string = process.env.PAYLOAD_LIMIT || '100mb';

const LOG_FILE: string = process.env.LOG_FILE || 'debug.log';

const AUTH0_AUDIENCE: string =
  process.env.AUTH0_AUDIENCE || 'http://localhost:4000/graphql/';
const AUTH0_ISSUER_URL: string =
  process.env.AUTH0_ISSUER_URL || 'https://dev-cr.us.auth0.com/';

//database -> default values to be picked from system env not hardcoded.
const DB_HOST: string = process.env.DB_HOST || 'llgm-dev1';
const DB_PORT: number = +process.env.DB_PORT || 5432;
const DB_USERNAME: string = process.env.DB_USERNAME || 'postgres';
const DB_PASSWORD: string = process.env.DB_PASSWORD || 'admin';
const DB_NAME: string = 'testdb';

const LOG_DB_HOST: string = process.env.MONGO_HOST || 'llgm-dev1';
const LOG_DB_PORT: number = +process.env.MONGO_PORT || 27017;
const LOG_DB_NAME: string = process.env.MONGO_DB_NAME || 'dataAPILog';

const CERT_DIR: string = process.env.CERT_DIR || './secrets';

export {
  NODE_ENV,
  PROD_PORT,
  PORT,
  DOMAIN,
  END_POINT,
  VOYAGER,
  PRIMARY_COLOR,
  RATE_LIMIT_MAX,
  GRAPHQL_DEPTH_LIMIT,
  PAYLOAD_LIMIT,
  LOG_FILE,
  DB_HOST,
  DB_PASSWORD,
  DB_PORT,
  DB_USERNAME,
  DB_NAME,
  AUTH0_AUDIENCE,
  AUTH0_ISSUER_URL,
  LOG_DB_HOST,
  LOG_DB_PORT,
  LOG_DB_NAME,
  CERT_DIR,
};
