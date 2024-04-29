import { Injectable } from '@nestjs/common';
import * as path from 'path';
import { DatabaseService } from 'common/database/database.service';
import { UserActiveSessionBook, UserMe, UserPermission } from 'graphql.schema';
import { QTypeE } from 'utils/enum';
import { DEMO_ORG_ID } from 'frontend/casl/casl.config';
import * as pg from 'pg';

@Injectable()
export class UserMeService {
  queryConfigBuilder: Function; multiQueryConfigBuilder: Function;

  constructor(private readonly dbService: DatabaseService) {
    {
      [this.queryConfigBuilder, this.multiQueryConfigBuilder] = this.dbService.queryConfigBuilderFactory(
        path.join(__dirname, 'user-me.queries.json'),
      );
    }
  }
  async getMe(email: string, client?: pg.PoolClient): Promise<UserMe | null> {
    const queryConfig = this.queryConfigBuilder(
      QTypeE.QUERY,
      'GET_USER_FROM_EMAIL_Q',
      [email],
    ); // separated from query call for ease of debugging
    const response = await this.dbService.query(queryConfig, client);
    if (response.code != 200 || response.result.rowCount === 0) {
      return null;
    }
    return response.result.rows[0];
  }

  async getPermissions(
    user_id: number,
    client?: pg.PoolClient,
  ): Promise<UserPermission[]> {
    const queryConfig = this.queryConfigBuilder(
      QTypeE.QUERY,
      'GET_USER_PERMISSIONS_Q',
      [user_id],
    ); // separated from query call for ease of debugging
    const response = await this.dbService.query(queryConfig, client);
    if (response.code != 200 || response.result.rowCount === 0) {
      return [];
    }
    return response.result.rows;
  }

  async getActiveSessionBooks(
    user_id: number,
    client?: pg.PoolClient,
  ): Promise<UserActiveSessionBook[]> {
    const queryConfig = this.queryConfigBuilder(
      QTypeE.QUERY,
      'GET_USER_SESSION_Q',
      [user_id],
    ); // separated from query call for ease of debugging
    const response = await this.dbService.query(queryConfig, client);
    if (response.code != 200 || response.result.rowCount === 0) {
      return [];
    }
    return response.result.rows;
  }

  async isLLGMAdmin(user_id: number, client?: pg.PoolClient): Promise<boolean> {
    const queryConfig = this.queryConfigBuilder(
      QTypeE.QUERY,
      'IS_DEMO_PERMISSION_Q',
      [user_id, DEMO_ORG_ID],
    ); // separated from query call for ease of debugging
    const response = await this.dbService.query(queryConfig, client);
    if (response.code != 200 || response.result.rowCount === 0) {
      return false;
    }
    return response.result.rows[0].is_demo_user;
  }
}
