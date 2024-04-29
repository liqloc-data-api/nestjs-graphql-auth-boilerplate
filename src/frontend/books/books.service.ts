import * as path from 'path';
import * as pg from 'pg';
import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'common/database/database.service';
import { QTypeE } from 'utils/enum';
import { Book } from 'frontend/graphql.schema';

@Injectable()
export class BooksService {
  queryConfigBuilder: Function;
  multiQueryConfigBuilder: Function;

  constructor(private readonly dbService: DatabaseService) {
    [this.queryConfigBuilder, this.multiQueryConfigBuilder] =
      this.dbService.queryConfigBuilderFactory(
        path.join(__dirname, 'books.queries.json'),
      );
  }

  async getBook(bookId: number, client?: pg.PoolClient): Promise<Book> {
    const queryConfig = this.queryConfigBuilder(QTypeE.QUERY, 'GET_BOOK', [
      bookId,
    ]);
    const response = await this.dbService.query(queryConfig, client);
    if (response.code != 200 || response.result.rowCount === 0) {
      return;
    }
    return response.result.rows[0];
  }
  
}
