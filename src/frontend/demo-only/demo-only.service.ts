import * as path from 'path';
import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'common/database/database.service';
import { QTypeE } from 'utils/enum';
import {
  DEFAULT_ORG_ID,
  DEFAULT_PARTICIPATION_TYPE_ID,
  DEFAULT_TRADER_FIRST_NAME,
  DEFAULT_TRADER_LAST_NAME,
  RoleIdE,
} from './enums_constants';
import { SessionsService } from 'frontend/sessions/sessions.service';
import * as pg from 'pg';

@Injectable()
export class DemoOnlyService {
  queryConfigBuilder: Function; multiQueryConfigBuilder: Function;

  constructor(
    private readonly dbService: DatabaseService,
    private readonly sessionsService: SessionsService,
  ) {
    [this.queryConfigBuilder, this.multiQueryConfigBuilder] = this.dbService.queryConfigBuilderFactory(
      path.join(__dirname, 'demo-only.queries.json'),
    );
  }

  async demoBookTraderInitiation(
    sessionId: number,
    email: string,
    traderId: number | undefined,
    bookName: string,
    bookId: number | undefined,
    userId: number,
    client?: pg.PoolClient,
  ) {
    const isExistingTrader = traderId ? true : false;
    const isExistingBook = bookId ? true : false;

    const transactionManager =
      await this.dbService.getTransactionManager(client);
    transactionManager.setCallback(async (client) => {
      if (!isExistingTrader) {
        const demoEmail = `${email}@demo.com`;
        const trader = await this.checkAndAddUserByEmail(
          demoEmail,
          userId,
          client,
        );
        if (!trader) {
          throw new Error('Unable to create trader');
        }
        traderId = trader.user_id;
      }
      if (!isExistingBook) {
        const sessionDetails = await this.sessionsService.getSession(
          sessionId,
          client,
        );
        const book = await this.checkAndAddBookByName(
          bookName,
          sessionDetails.product_id,
          userId,
          client,
        );
        if (!book) {
          throw new Error('Unable to create book');
        }
        bookId = book.book_id;
        const book_access = await this.addSessionAccessToBook(
          sessionId,
          bookId,
          userId,
          client,
        );
        if (!book_access) {
          throw new Error('Unable to create book access');
        }
      }

      const traderRole = await this.checkAndAddTraderRole(
        traderId,
        bookId,
        userId,
        client,
      );
      if (!traderRole) {
        throw new Error('Unable to create trader role');
      }
      const userRole = await this.checkAndGiveUserAccessToBookAndTrader(
        traderId,
        bookId,
        userId,
        client,
      );
      if (!userRole) {
        throw new Error('Unable to create user role');
      }
      return {
        trader_id: traderId,
        book_id: bookId,
      };
    });

    const result = await transactionManager.executeTransaction();
    return result;
  }

  async checkAndAddUserByEmail(
    email: string,
    userId: number,
    client?: pg.PoolClient,
  ) {
    const queryConfig = this.queryConfigBuilder(
      QTypeE.ADD,
      'CHECK_AND_ADD_DEMO_USER',
      [
        email,
        DEFAULT_TRADER_FIRST_NAME,
        DEFAULT_TRADER_LAST_NAME,
        DEFAULT_ORG_ID,
        userId,
      ],
    );
    const response = await this.dbService.query(queryConfig, client);
    if (response.code != 200) {
      return;
    }
    return response.result.rows[0];
  }

  async checkAndAddBookByName(
    bookName: string,
    productId: number,
    userId: number,
    client?: pg.PoolClient,
  ) {
    const queryConfig = this.queryConfigBuilder(
      QTypeE.ADD,
      'CHECK_AND_ADD_DEMO_BOOK',
      [bookName, productId, DEFAULT_ORG_ID, userId],
    );
    const response = await this.dbService.query(queryConfig, client);
    if (response.code != 200) {
      return;
    }
    return response.result.rows[0];
  }

  async addSessionAccessToBook(
    sessionId: number,
    bookId: number,
    userId: number,
    client?: pg.PoolClient,
  ) {
    const queryConfig = this.queryConfigBuilder(
      QTypeE.ADD,
      'ADD_SESSION_ACCESS_TO_BOOK',
      [sessionId, bookId, DEFAULT_PARTICIPATION_TYPE_ID, userId],
    );
    const response = await this.dbService.query(queryConfig, client);
    if (response.code != 200) {
      return;
    }
    return response.result.rows[0];
  }

  async checkAndAddUserRole(
    requesterId: number,
    bookId: number,
    traderId: number,
    roleId: number,
    userId: number,
    client?: pg.PoolClient,
  ) {
    const queryConfig = this.queryConfigBuilder(
      QTypeE.ADD,
      'ADD_USER_ROLE_ON_BOOK',
      [requesterId, bookId, traderId, roleId, userId],
    );
    const response = await this.dbService.query(queryConfig, client);
    if (response.code != 200) {
      return;
    }
    return response.result.rows[0];
  }

  async checkAndAddTraderRole(
    traderId: number,
    bookId: number,
    userId: number,
    client?: pg.PoolClient,
  ) {
    const traderRole = await this.checkAndAddUserRole(
      traderId,
      bookId,
      traderId,
      RoleIdE.TRADER,
      userId,
      client,
    );
    return traderRole;
  }

  async checkAndGiveUserAccessToBookAndTrader(
    traderId: number,
    bookId: number,
    userId: number,
    client?: pg.PoolClient,
  ) {
    const traderRole = await this.checkAndAddUserRole(
      userId,
      bookId,
      traderId,
      RoleIdE.TRADER,
      userId,
      client,
    );
    const riskManagerRole = await this.checkAndAddUserRole(
      userId,
      bookId,
      traderId,
      RoleIdE.RISK_MANAGER,
      userId,
      client,
    );
    if (!traderRole || !riskManagerRole) {
      return;
    }

    return [traderRole, riskManagerRole];
  }
}
