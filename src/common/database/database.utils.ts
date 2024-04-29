import { AppLogger } from 'common/logger/logger.service';
import * as pg from 'pg';
import { DatabaseEnvE, QStatusE } from './database.constants-enums';

export class TransactionManager {
  callback: (client: pg.PoolClient) => any;
  logger = new AppLogger();

  constructor(
    readonly _client: pg.PoolClient,
    readonly _dbEnv: DatabaseEnvE,
    readonly _clientCoseFlag: boolean,
  ) {
    this.logger.setContext('DataBaseTransactionManager');
  }

  setCallback(callback: (client: pg.PoolClient) => any) {
    this.callback = callback;
  }

  async query(query: pg.QueryConfig) {
    this.logger.debug(`DB query requested: ${query.text}`, query);
    return await this._client.query(query);
  }

  async executeTransaction() {
    try {
      const output = await this._executeTransaction();
      await dbClientClose(
        this._client,
        this._clientCoseFlag,
        QStatusE.SUCCESS,
        this._dbEnv,
      );
      return output;
    } catch (err) {
      await dbClientClose(
        this._client,
        this._clientCoseFlag,
        QStatusE.ERROR,
        this._dbEnv,
      );
      this.logger.error(`DB Error: ${err.stack}`);
      throw new Error(`Error: ${err.stack}`);
    }
  }

  async _executeTransaction() {
    this.logger.log('Executing transaction');
    const output = await this.callback(this._client);
    this.logger.log('Transaction executed Successfully', output);
    return output;
  }
}

export async function dbClientClose(
  client: pg.PoolClient,
  clientCoseFlag: boolean,
  queryStatus: QStatusE,
  dbEnv: DatabaseEnvE,
) {
  if (clientCoseFlag) {
    if (queryStatus === QStatusE.SUCCESS) {
      if (dbEnv === DatabaseEnvE.TEST_ROLLBACK) {
        await client.query('ROLLBACK');
      }
      await client.query('COMMIT');
    } else {
      await client.query('ROLLBACK');
    }
    client.release();
  }
}

export function placeholderFn<T>(
  startingIndex: number,
  valuesObjectArray: T[],
): string {
  
  const rows = [];
  for (let i = 0; i < valuesObjectArray.length; i++) {
    const valueTypes = getTypeArray<T>(valuesObjectArray[i]);
    const row = valueTypes.map(
      (typeName, index) =>
        '$' +
        String(i * valueTypes.length + index + startingIndex) +
        (typeName ? '::' + typeName : ''),
    );
    const row_str = '(' + row.join(', ') + ')';
    rows.push(row_str);
  }
  return rows.join(', ');
}

function getTypeArray<T>(obj: T): string[] {
  const typeMapper = new Map<string, string>([
    ['number', 'NUMERIC'],
    ['string', 'TEXT'],
    ['boolean', 'BOOLEAN'],
    ['object', 'JSONB'],
    ['undefined', null],
  ]);
  const types: string[] = [];
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (obj[key] === null) {
        types.push(null);
        continue;
      }
      const keyType: string = typeof obj[key];
      types.push(typeMapper.get(keyType));
    }
  }
  return types;
}
