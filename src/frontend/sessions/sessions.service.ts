import { Injectable } from '@nestjs/common';
import * as path from 'path';
import { DatabaseService } from 'common/database/database.service';
import { QTypeE } from 'utils/enum';
import { Session, SessionInstrument } from 'frontend/graphql.schema';
import { InternalServerError } from 'common/custom-exceptions/custom-exceptions';
import * as pg from 'pg';

@Injectable()
export class SessionsService {
  queryConfigBuilder: Function; multiQueryConfigBuilder: Function;

  constructor(private readonly dbService: DatabaseService) {
    [this.queryConfigBuilder, this.multiQueryConfigBuilder] = this.dbService.queryConfigBuilderFactory(
      path.join(__dirname, 'sessions.queries.json'),
    );
  }

  async getSession(
    sessionId: number,
    client?: pg.PoolClient,
  ): Promise<Session> {
    const queryConfig = this.queryConfigBuilder(QTypeE.QUERY, 'GET_SESSION', [
      sessionId,
    ]);
    const response = await this.dbService.query(queryConfig, client);
    if (response.code != 200 || response.result.rowCount === 0) {
      return;
    }
    return response.result.rows[0];
  }

}
