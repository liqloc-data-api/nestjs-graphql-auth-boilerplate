import * as path from 'path';
import { Injectable } from '@nestjs/common';
import { DatabaseService, TDBResultI } from 'common/database/database.service';
import { QTypeE } from 'utils/enum';
import { AddMutationResponse } from 'frontend/graphql.schema';
import * as pg from 'pg';

@Injectable()
export class FeSettingsService {
  queryConfigBuilder: Function; multiQueryConfigBuilder: Function;

  constructor(private readonly dbService: DatabaseService) {
    [this.queryConfigBuilder, this.multiQueryConfigBuilder] = this.dbService.queryConfigBuilderFactory(
      path.join(__dirname, 'fe-settings.queries.json'),
    );
  }

  async getAllFeSettings(
    sessionId: number,
    bookId: number,
    userId: number,
    client?: pg.PoolClient,
  ): Promise<any> {
    const queryConfig_session = this.queryConfigBuilder(
      QTypeE.QUERY,
      'GET_SESSION_FE_SETTINGS',
      [sessionId],
    );
    const queryConfig_session_book = this.queryConfigBuilder(
      QTypeE.QUERY,
      'GET_SESSION_BOOK_FE_SETTINGS',
      [sessionId, bookId],
    );
    const queryConfig_session_user = this.queryConfigBuilder(
      QTypeE.QUERY,
      'GET_SESSION_USER_FE_SETTINGS',
      [sessionId, userId],
    );
    const queryConfig_session_book_user = this.queryConfigBuilder(
      QTypeE.QUERY,
      'GET_SESSION_BOOK_USER_FE_SETTINGS',
      [sessionId, bookId, userId],
    );

    const transactionManager =
      await this.dbService.getTransactionManager(client);
    transactionManager.setCallback(async (client) => {
      const response = await transactionManager.query(queryConfig_session);
      const response2 = await transactionManager.query(
        queryConfig_session_book,
      );
      const response3 = await transactionManager.query(
        queryConfig_session_user,
      );
      const response4 = await transactionManager.query(
        queryConfig_session_book_user,
      );

      return {
        GET_SESSION_FE_SETTINGS: response?.rows,
        GET_SESSION_BOOK_FE_SETTINGS: response2?.rows,
        GET_SESSION_USER_FE_SETTINGS: response3?.rows,
        GET_SESSION_BOOK_USER_FE_SETTINGS: response4?.rows,
      };
    });
    const result = await transactionManager.executeTransaction();

    return result;
  }

  async getSessionFeSettingsByTypeId(
    sessionId: number,
    settingTypeId: number,
    client?: pg.PoolClient,
  ): Promise<any> {
    const queryConfig = this.queryConfigBuilder(
      QTypeE.QUERY,
      'GET_SESSION_FE_SETTINGS_BY_TYPE',
      [sessionId, settingTypeId],
    );
    const response = await this.dbService.query(queryConfig, client);
    if (response.code != 200) {
      return;
    }
    return response.result.rows[0];
  }

  async getSessionBookFeSettingsByTypeId(
    sessionId: number,
    bookId: number,
    settingTypeId: number,
    client?: pg.PoolClient,
  ): Promise<any> {
    const queryConfig = this.queryConfigBuilder(
      QTypeE.QUERY,
      'GET_SESSION_BOOK_FE_SETTINGS_BY_TYPE',
      [sessionId, bookId, settingTypeId],
    );
    const response = await this.dbService.query(queryConfig, client);
    if (response.code != 200) {
      return;
    }
    return response.result.rows[0];
  }

  async getSessionUserFeSettingsByTypeId(
    sessionId: number,
    userId: number,
    settingTypeId: number,
    client?: pg.PoolClient,
  ): Promise<any> {
    const queryConfig = this.queryConfigBuilder(
      QTypeE.QUERY,
      'GET_SESSION_USER_FE_SETTINGS_BY_TYPE',
      [sessionId, userId, settingTypeId],
    );
    const response = await this.dbService.query(queryConfig, client);
    if (response.code != 200) {
      return;
    }
    return response.result.rows[0];
  }

  async getSessionBookUserFeSettingsByTypeId(
    sessionId: number,
    bookId: number,
    userId: number,
    settingTypeId: number,
    client?: pg.PoolClient,
  ): Promise<any> {
    const queryConfig = this.queryConfigBuilder(
      QTypeE.QUERY,
      'GET_SESSION_BOOK_USER_FE_SETTINGS_BY_TYPE',
      [sessionId, bookId, userId, settingTypeId],
    );
    const response = await this.dbService.query(queryConfig, client);
    if (response.code != 200) {
      return;
    }
    return response.result.rows[0];
  }

  async addSessionBookFeSettingsByTypeId(
    sessionId: number,
    bookId: number,
    settingTypeId: number,
    settingMembers: JSON,
    userId: number,
    client?: pg.PoolClient,
  ): Promise<AddMutationResponse> {
    const queryConfig = this.queryConfigBuilder(
      QTypeE.ADD,
      'ADD_SESSION_BOOK_FE_SETTINGS_BY_TYPE',
      [sessionId, bookId, settingTypeId, settingMembers, userId],
    );
    const response = await this.dbService.query(queryConfig, client);
    if (response.code != 200) {
      return;
    }
    return response.result.rows[0];
  }

  async addSessionUserFeSettingsByTypeId(
    sessionId: number,
    userId: number,
    settingTypeId: number,
    settingMembers: JSON,
    client?: pg.PoolClient,
  ): Promise<AddMutationResponse> {
    const queryConfig = this.queryConfigBuilder(
      QTypeE.ADD,
      'ADD_SESSION_USER_FE_SETTINGS_BY_TYPE',
      [sessionId, userId, settingTypeId, settingMembers, userId],
    );
    const response = await this.dbService.query(queryConfig, client);
    if (response.code != 200) {
      return;
    }
    return response.result.rows[0];
  }

  async addSessionBookUserFeSettingsByTypeId(
    sessionId: number,
    bookId: number,
    userId: number,
    settingTypeId: number,
    settingMembers: JSON,
    client?: pg.PoolClient,
  ): Promise<AddMutationResponse> {
    const queryConfig = this.queryConfigBuilder(
      QTypeE.ADD,
      'ADD_SESSION_BOOK_USER_FE_SETTINGS_BY_TYPE',
      [sessionId, bookId, userId, settingTypeId, settingMembers, userId],
    );
    const response = await this.dbService.query(queryConfig, client);
    if (response.code != 200) {
      return;
    }
    return {
      code: response.code,
      message: response.message,
      metaData: { settings: response.result.rows[0] },
    };
  }

  async updateSessionBookFeSettingsByTypeId(
    sessionId: number,
    bookId: number,
    settingTypeId: number,
    settingMembers: JSON,
    userId: number,
    client?: pg.PoolClient,
  ): Promise<AddMutationResponse> {
    const queryConfig = this.queryConfigBuilder(
      QTypeE.UPDATE,
      'UPDATE_SESSION_BOOK_TABLE_FE_SETTINGS_BY_TYPE',
      [settingMembers, sessionId, bookId, settingTypeId, userId],
    );
    const response = await this.dbService.query(queryConfig, client);
    if (response.code != 200) {
      return;
    }
    return {
      code: response.code,
      message: response.message,
      metaData: { settings: response.result.rows[0] },
    };
  }

  async updateSessionUserFeSettingsByTypeId(
    sessionId: number,
    userId: number,
    settingTypeId: number,
    settingMembers: JSON,
    client?: pg.PoolClient,
  ): Promise<AddMutationResponse> {
    const queryConfig = this.queryConfigBuilder(
      QTypeE.UPDATE,
      'UPDATE_SESSION_USER_TABLE_FE_SETTINGS_BY_TYPE',
      [settingMembers, sessionId, userId, settingTypeId, userId],
    );
    const response = await this.dbService.query(queryConfig, client);
    if (response.code != 200) {
      return;
    }
    return {
      code: response.code,
      message: response.message,
      metaData: { settings: response.result.rows[0] },
    };
  }

  async updateSessionBookUserFeSettingsByTypeId(
    sessionId: number,
    bookId: number,
    userId: number,
    settingTypeId: number,
    settingMembers: JSON,
    client?: pg.PoolClient,
  ): Promise<AddMutationResponse> {
    const queryConfig = this.queryConfigBuilder(
      QTypeE.UPDATE,
      'UPDATE_SESSION_BOOK_USER_TABLE_FE_SETTINGS_BY_TYPE',
      [settingMembers, sessionId, bookId, userId, settingTypeId, userId],
    );
    const response = await this.dbService.query(queryConfig, client);
    if (response.code != 200) {
      return;
    }
    return {
      code: response.code,
      message: response.message,
      metaData: { settings: response.result.rows[0] },
    };
  }
}
