import * as path from 'path';
import * as pg from 'pg';
import { Injectable, Query } from '@nestjs/common';
import { DatabaseService } from 'common/database/database.service';
import { AddMutationResponse } from 'graphql.schema';
import { FileTypeIdE } from './enums_constants';
import { QTypeE } from 'utils/enum';

@Injectable()
export class FmsService {
  queryConfigBuilder: Function;
  multiQueryConfigBuilder: Function;

  constructor(private readonly dbService: DatabaseService) {
    [this.queryConfigBuilder, this.multiQueryConfigBuilder] =
      this.dbService.queryConfigBuilderFactory(
        path.join(__dirname, 'fms.queries.json'),
      );
  }

  private async addFile(
    sessionId: number,
    fileTypeId: number,
    uploadFileData: any,
    uploadFilePath: string,
    userId: number,
    client?: pg.PoolClient,
  ): Promise<AddMutationResponse> {
    const queryConfig = this.queryConfigBuilder(QTypeE.ADD, 'ADD_FILE', [
      sessionId,
      fileTypeId,
      uploadFileData,
      uploadFilePath,
      userId,
    ]);
    const response = await this.dbService.query(queryConfig, client);
    if (response.code != 200) {
      return {
        code: response.code,
        message: 'Error in adding file',
      };
    } else {
      return {
        code: response.code,
        message: 'File added successfully',
      };
    }
  }

  async addMMWJson(
    sessionId: number,
    uploadFileData: any,
    userId: number,
    client?: pg.PoolClient,
  ): Promise<AddMutationResponse> {
    return await this.addFile(
      sessionId,
      FileTypeIdE.MMWJson,
      uploadFileData,
      null,
      userId,
      client,
    );
  }
}
