import { Injectable } from '@nestjs/common';
import { InternalServerError } from 'common/custom-exceptions/custom-exceptions';
import { DatabaseService } from 'common/database/database.service';
import { SessionInstrument } from 'frontend/graphql.schema';
import { QTypeE } from 'utils/enum';
import * as pg from 'pg';
import * as path from 'path';

@Injectable()
export class SessionInstrumentsService {
  queryConfigBuilder: Function; multiQueryConfigBuilder: Function;

  constructor(private readonly dbService: DatabaseService) {
    [this.queryConfigBuilder, this.multiQueryConfigBuilder] = this.dbService.queryConfigBuilderFactory(
      path.join(__dirname, 'session-instruments.queries.json'),
    );
  }

  async getSessionInstruments(
    sessionId: number,
    client?: pg.PoolClient,
  ): Promise<SessionInstrument[]> {
    const queryConfig = this.queryConfigBuilder(
      QTypeE.QUERY,
      'GET_SESSION_INSTRUMENTS',
      [sessionId],
    );
    const response = await this.dbService.query(queryConfig, client);
    if (response.code != 200 || response.result.rowCount === 0) {
      throw InternalServerError;
    }
    return response.result.rows;
  }

  async getSessionInstrumentSymbolMapper(
    sessionId: number,
    sessionInstruments?: SessionInstrument[],
    client?: pg.PoolClient,
  ): Promise<Map<number, string>> {
    const _sessionInstruments =
      sessionInstruments ||
      (await this.getSessionInstruments(sessionId, client));
    const instrumentMap = _sessionInstruments.reduce(
      (map, sessionInstrument) => {
        map.set(sessionInstrument.instrument_id, sessionInstrument.symbol);
        return map;
      },
      new Map(),
    );
    return instrumentMap;
  }
}
