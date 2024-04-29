import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
  Inject,
  PayloadTooLargeException,
} from '@nestjs/common';
import { Pool, QueryConfig, QueryResult } from 'pg';
import * as fs from 'fs';
import * as crypto from 'crypto';
import * as pg from 'pg';

pg.types.setTypeParser(pg.types.builtins.DATE, (value) => value);
pg.types.setTypeParser(pg.types.builtins.TIMESTAMP, (value) => value);
pg.types.setTypeParser(pg.types.builtins.TIMESTAMPTZ, (value) => value);

import {
  DB_HOST,
  DB_NAME,
  DB_USERNAME,
  DB_PASSWORD,
  DB_PORT,
} from 'environments';
import { QTypeE } from 'utils/enum';
import { AppLogger } from '../logger/logger.service';
import { DB_ENV, DatabaseEnvE, QStatusE } from './database.constants-enums';
import {
  TransactionManager,
  dbClientClose,
  placeholderFn,
} from './database.utils';

interface QDBResultI {
  result: QueryResult<any> | null;
  code: number;
  message: string;
}

export interface TDBResultI {
  result: Record<string, QueryResult> | null;
  code: number;
  message: string;
}

export interface QueryI {
  sql: string;
  values: any[];
  name: string;
}

export interface QueryListI {
  name: string;
  query: QueryConfig;
}

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;
  private _queriesListing: {};

  constructor(
    @Inject(DB_ENV) private readonly _dbEnv: DatabaseEnvE,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(DatabaseService.name);
    this._queriesListing = {};
  }

  hashString(input: string): string {
    return crypto
      .createHash('sha256')
      .update(input)
      .digest('hex')
      .substring(0, 63);
  }

  async onModuleInit() {
    const databaseSettings = {
      user: DB_USERNAME,
      host: DB_HOST,
      database: DB_NAME,
      password: DB_PASSWORD,
      port: DB_PORT,
    }
    this.pool = new Pool(databaseSettings);
    this.logger.log(`DB connection established: ${JSON.stringify(this.pool)}`, this.pool);
  }

  async onModuleDestroy() {
    await this.pool.end();
  }

  addQueriesListing(filePath: string) {
    const data = fs.readFileSync(filePath, 'utf-8');
    const temp_data: Record<string, any> = JSON.parse(data);
    this._queriesListing[filePath] = temp_data;
    this.logger.debug(`Queries listing loaded for: ${filePath}`, temp_data);
  }

  queryConfigBuilderFactory(path: string): Function[] {
    this.addQueriesListing(path);
    const queriesListing = this._queriesListing;
    const hashString = this.hashString;
    return [
      function queryConfigBuilder(
        type: QTypeE,
        queryName: string,
        variables: any[],
      ): QueryConfig {
        const sqlTemplate: string = queriesListing?.[path]?.[type]?.[queryName];
        const queryConfig: QueryConfig = {
          name: hashString(path.slice(-20) + type + queryName),
          text: sqlTemplate,
          values: variables,
        };
        return queryConfig;
      },
      function multiQueryConfigBuilder(
        type: QTypeE,
        queryName: string,
        variables: any[],
      ): QueryConfig {
        const placeholder = placeholderFn(
          variables.length,
          variables[variables.length - 1],
        );
        variables = [
          ...variables.slice(0, variables.length - 1),
          ...variables[variables.length - 1].flatMap((obj) =>
            Object.values(obj),
          ),
        ];
        const text = queriesListing?.[path]?.[type]?.[queryName]?.replace(
          '{placeholder}',
          placeholder,
        );
        const queryConfig: QueryConfig = {
          text: text,
          values: variables,
        };
        return queryConfig;
      },
    ];
  }

  async query(
    query: QueryConfig,
    client: pg.PoolClient | undefined,
  ): Promise<QDBResultI> {
    let output: any = null;
    let code: number = 200;
    let message: string = 'Successfully executed query';

    let _client: pg.PoolClient;
    let clientCloseFlag = true;

    if (client) {
      _client = client;
      clientCloseFlag = false;
    } else {
      (_client = await this.pool.connect()), _client.query('BEGIN');
    }

    try {
      output = await this._query(query, _client);
      await dbClientClose(
        _client,
        clientCloseFlag,
        QStatusE.SUCCESS,
        this._dbEnv,
      );
    } catch (err) {
      await dbClientClose(
        _client,
        clientCloseFlag,
        QStatusE.ERROR,
        this._dbEnv,
      );
      this.logger.error(`DB Error - ${query.text}: ${err.stack}`, query);
      code = 500;
      message = `Error: ${err.stack}`;
    } finally {
      return {
        result: output,
        code: code,
        message: message,
      };
    }
  }

  async _query(query: QueryConfig, client: pg.PoolClient): Promise<any> {
    //use for single query
    this.logger.debug(`DB query requested: ${query.text}`, query);
    const result = await client.query(query);
    this.logger.debug(`DB query result row count: ${result.rowCount}`, result);
    return result;
  }

  async getTransactionManager(client: pg.PoolClient) {
    let _client: pg.PoolClient;
    let clientCloseFlag = true;
    if (client) {
      _client = client;
      clientCloseFlag = false;
    } else {
      (_client = await this.pool.connect()), _client.query('BEGIN');
    }
    return new TransactionManager(_client, this._dbEnv, clientCloseFlag);
  }
}
