import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as pg from 'pg';
import { DatabaseService } from 'common/database/database.service';
import {
  BookTraderPermissions,
  SessionPermission,
  User,
  UserActiveSessionBook,
  UserMe,
  UserMePermissions,
  UserPermission,
} from '../graphql.schema';
import { CaslService } from '../casl/casl.service';
import { ActionE, QTypeE, SessionStateE, SubjectE } from 'utils/enum';

@Injectable()
export class UsersService {
  queryConfigBuilder: Function;
  multiQueryConfigBuilder: Function;

  constructor(
    private readonly dbService: DatabaseService,
    private readonly caslService: CaslService,
  ) {
    [this.queryConfigBuilder, this.multiQueryConfigBuilder] =
      this.dbService.queryConfigBuilderFactory(
        path.join(__dirname, 'users.queries.json'),
      );
  }

  private transformSessionPermissions(
    sessionBooks: UserActiveSessionBook[],
  ): SessionPermission[] {
    let sessionMap = sessionBooks.reduce((acc, session_data) => {
      let key = `${session_data.session_id}`;
      if (acc[key]) {
        acc[key].book_id.add(session_data.book_id);
      } else {
        acc[key] = {
          session_id: session_data.session_id,
          session_name: session_data.session_name,
          status: session_data.session_state,
          book_id: new Set([session_data.book_id]),
        };
      }
      return acc;
    }, {});

    return Object.values(sessionMap);
  }

  private transformPermissions(
    userPermissions: UserPermission[],
    sessionPermissions: SessionPermission[],
  ): any[] {
    let acc = {};
    sessionPermissions.forEach((session) => {
      session.book_id.forEach((bookId) => {
        let sessionUserPermissionsBook = userPermissions.filter(
          (userPermission) => userPermission.book_id === bookId,
        );
        sessionUserPermissionsBook.forEach((userPermission) => {
          const key = `${session.session_id}_${bookId}_${userPermission.trader_id}`;
          const key_perm = key + `_${userPermission.subject}`;
          const [actions, subject] = this.caslService.getActionAndSubject(
            {
              action: userPermission.action as unknown as ActionE, // Update the type of 'action' property
              subject: userPermission.subject as unknown as SubjectE,
            },
            session.status as SessionStateE,
          );
          if (actions == null || subject == null) return;
          const temp_sub_act = {
            actions: new Set(actions),
            subject,
          };
          if (!acc[key]) {
            acc[key] = {
              session_id: session.session_id,
              book_id: bookId,
              book_name: userPermission.book_name,
              trader_id: userPermission.trader_id,
              trader_email: userPermission.trader_email,
              permissions: { [key_perm]: temp_sub_act },
            };
          } else if (!acc[key].permissions[key_perm]) {
            acc[key].permissions[key_perm] = temp_sub_act;
          } else {
            acc[key].permissions[key_perm].actions = new Set([
              ...acc[key].permissions[key_perm].actions,
              ...(actions || []),
            ]);
          }
        });
      });
    });
    Object.keys(acc).forEach((key) => {
      acc[key] = {
        ...acc[key],
        permissions: Object.values(acc[key].permissions),
      };
    });
    return Object.values(acc);
  }

  getFeUserMePermissions(userMe: UserMe): UserMePermissions {
    const {
      user_id,
      first_name,
      last_name,
      email,
      permissions,
      active_session_books,
      is_demo_user,
    } = userMe;
    const sessions = this.transformSessionPermissions(active_session_books);
    const book_trader = this.transformPermissions(permissions, sessions);
    return {
      user_id,
      first_name,
      last_name,
      email,
      sessions,
      book_trader,
      is_demo_user,
    };
  }

  async getUser(userId: number, client?: pg.PoolClient): Promise<User> {
    const queryConfig = this.queryConfigBuilder(QTypeE.QUERY, 'GET_USER', [
      userId,
    ]);
    const response = await this.dbService.query(queryConfig, client);
    if (response.code != 200 || response.result.rowCount === 0) {
      return;
    }
    return response.result.rows[0];
  }
}
