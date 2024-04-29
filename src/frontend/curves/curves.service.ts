import * as path from 'path';

import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'common/database/database.service';
import { QTypeE } from 'utils/enum';
import {
  AddMutationResponse,
  CurveMembersInput,
  CustomMembersInput,
  DeleteMutationResponse,
  MultiCurveIdMembers,
  SessionCurve,
} from 'frontend/graphql.schema';
import * as pg from 'pg';
import {
  validateFieldInObjectArray,
  validationObject,
} from 'common/validations/common.validations';
import { CurveMembersSchema } from 'common/validations/curves.validations';

@Injectable()
export class CurvesService {
  queryConfigBuilder: Function;
  multiQueryConfigBuilder: Function;

  constructor(private readonly dbService: DatabaseService) {
    [this.queryConfigBuilder, this.multiQueryConfigBuilder] =
      this.dbService.queryConfigBuilderFactory(
        path.join(__dirname, 'curves.queries.json'),
      );
  }

  async getSessionCurves(
    sessionId: number,
    bookId: number,
    traderId: number,
    client?: pg.PoolClient,
  ): Promise<SessionCurve[]> {
    const queryConfig = this.queryConfigBuilder(
      QTypeE.QUERY,
      'GET_BOOK_TRADER_CURVES',
      [sessionId, bookId, traderId],
    );
    const response = await this.dbService.query(queryConfig, client);
    if (response.code != 200 || response.result.rowCount === 0) {
      return [];
    }
    return response.result.rows;
  }

  async getSessionCurveById(
    sessionId: number,
    bookId: number,
    traderId: number,
    curveId: number,
    client?: pg.PoolClient,
  ): Promise<SessionCurve> {
    const queryConfig = this.queryConfigBuilder(
      QTypeE.QUERY,
      'GET_CURVE_BY_ID',
      [sessionId, bookId, traderId, curveId],
    );
    const response = await this.dbService.query(queryConfig, client);
    if (response.code != 200 || response.result.rowCount === 0) {
      return;
    }
    return response.result.rows[0];
  }

  async addSessionCurve(
    sessionId: number,
    bookId: number,
    traderId: number,
    instrumentId: number,
    curveMembers: CurveMembersInput,
    customMembers: CustomMembersInput,
    userId: number,
    client?: pg.PoolClient,
  ): Promise<AddMutationResponse> {
    const { status: validationStatus, errors: validationErrors } =
      validationObject(curveMembers, CurveMembersSchema);
    if (!validationStatus) {
      return {
        code: 400,
        message: 'Invalid Curve Members',
        metaData: validationErrors,
      };
    }
    const queryConfig = this.queryConfigBuilder(QTypeE.ADD, 'ADD_CURVE', [
      sessionId,
      bookId,
      traderId,
      instrumentId,
      curveMembers,
      customMembers,
      userId,
    ]);
    const response = await this.dbService.query(queryConfig, client);
    if (response.code != 200) {
      return { code: 500, message: 'Error Adding session Curve' };
    }
    return {
      code: 200,
      message: `Session Curve added successfully`,
      metaData: { curve: response.result.rows[0] },
    };
  }

  async addSessionCurves(
    sessionMultiCurves: any[],
    client?: pg.PoolClient,
  ): Promise<AddMutationResponse> {
    if (sessionMultiCurves.length === 0) {
      return { code: 200, message: 'No data to add to session Curve' };
    }
    const {
      status: validationStatus,
      errors: validationErrors,
      data: objArray,
    } = validateFieldInObjectArray(
      sessionMultiCurves,
      'curve_members',
      CurveMembersSchema,
    );
    if (!validationStatus) {
      return {
        code: 400,
        message: 'Invalid Curve Members',
        metaData: validationErrors,
      };
    }
    sessionMultiCurves = objArray;
    const queryConfig = this.multiQueryConfigBuilder(
      QTypeE.ADD,
      'ADD_MULTI_CURVE',
      [sessionMultiCurves],
    );
    const response = await this.dbService.query(queryConfig, client);
    if (response.code != 200) {
      return { code: 500, message: 'Error Adding session Curve' };
    }
    return {
      code: 200,
      message: `Session Curve added successfully`,
      metaData: { curve: response.result.rows },
    };
  }

  async updateSessionCurve(
    sessionId: number,
    bookId: number,
    traderId: number,
    curveId: number,
    curveMembers: CurveMembersInput,
    customMembers: CustomMembersInput,
    userId: number,
    client?: pg.PoolClient,
  ): Promise<AddMutationResponse> {
    const {
      status: validationStatus,
      errors: validationErrors,
      data: updatedObject,
    } = validationObject(curveMembers, CurveMembersSchema);
    if (!validationStatus) {
      return {
        code: 400,
        message: 'Invalid Curve Members',
        metaData: validationErrors,
      };
    }
    curveMembers = updatedObject;
    const queryConfig = this.queryConfigBuilder(QTypeE.UPDATE, 'UPDATE_CURVE', [
      sessionId,
      bookId,
      traderId,
      curveId,
      curveMembers,
      customMembers,
      userId,
    ]);
    const response = await this.dbService.query(queryConfig, client);
    if (response.code != 200 || response.result.rowCount === 0) {
      return { code: 500, message: 'Error updating Session Curve' };
    }
    return {
      code: 200,
      message: `Session Curve updated successfully`,
      metaData: { curve: response.result.rows[0] },
    };
  }

  async updateMultiSessionCurves(
    sessionId: number,
    bookId: number,
    traderId: number,
    userId: number,
    multiCurveIdMembers: MultiCurveIdMembers[],
    client?: pg.PoolClient,
  ): Promise<AddMutationResponse> {
    const {
      status: validationStatus,
      errors: validationErrors,
      data: objArray,
    } = validateFieldInObjectArray(
      multiCurveIdMembers,
      'curve_members',
      CurveMembersSchema,
    );
    if (!validationStatus) {
      return {
        code: 400,
        message: 'Invalid Curve Members',
        metaData: validationErrors,
      };
    }
    multiCurveIdMembers = objArray;
    const inputValues = [
      sessionId,
      bookId,
      traderId,
      userId,
      ...multiCurveIdMembers.flatMap((data) => [
        data.curve_id,
        data.curve_members,
      ]),
    ];
    const placeholder = multiCurveIdMembers
      .map(
        (_, index) => `($${index * 2 + 5}::integer, $${index * 2 + 6}::jsonb)`,
      )
      .join(', ');

    const queryConfig = this.queryConfigBuilder(
      QTypeE.UPDATE,
      'UPDATE_MULTI_CURVES',
      inputValues,
    );
    queryConfig.text = queryConfig.text.replace('{placeholder}', placeholder);

    const response = await this.dbService.query(queryConfig, client);
    if (response.code != 200) {
      return { code: 500, message: 'Error updating Session Curves' };
    }
    return {
      code: 200,
      message: `Session Curves updated successfully`,
      metaData: { curve: response.result.rows },
    };
  }

  async deleteSessionCurvesCustomColumn(
    sessionId: number,
    bookId: number,
    traderId: number,
    columnName: string,
    userId: number,
    client?: pg.PoolClient,
  ) {
    const queryConfig = this.queryConfigBuilder(
      QTypeE.DELETE,
      'DELETE_CURVES_CUSTOM_COLUMN',
      [sessionId, bookId, traderId, columnName, userId],
    );
    const response = await this.dbService.query(queryConfig, client);
    if (response.code != 200) {
      return {
        code: 500,
        message: 'Error deleting session curve custom column',
      };
    }
    return {
      code: 200,
      message: `No. of session curve custom column deleted: ${response.result.rowCount}`,
    };
  }

  async deleteSessionCurves(
    sessionId: number,
    bookId: number,
    traderId: number,
    curveIds: number[],
    userId: number,
    client?: pg.PoolClient,
  ): Promise<DeleteMutationResponse> {
    const queryConfig = this.queryConfigBuilder(
      QTypeE.DELETE,
      'DELETE_CURVES_BY_IDS',
      [sessionId, bookId, traderId, [...curveIds], userId],
    );
    const response = await this.dbService.query(queryConfig, client);
    if (response.code != 200) {
      return { code: 500, message: 'Error deleting session curves' };
    }
    return {
      code: 200,
      message: `No. of session curves deleted: ${response.result.rowCount}`,
    };
  }

  async deleteSessionCurvesRateAdj(
    sessionId: number,
    bookId: number,
    traderId: number,
    curveIds: number[],
    userId: number,
    client?: pg.PoolClient,
  ): Promise<DeleteMutationResponse> {
    const queryConfig = this.queryConfigBuilder(
      QTypeE.DELETE,
      'DELETE_CURVES_MEMBER_BY_KEY',
      [sessionId, bookId, traderId, 'rate_adj', curveIds, userId],
    );
    const response = await this.dbService.query(queryConfig, client);
    if (response.code != 200) {
      return { code: 500, message: 'Error deleting session curves rate adj' };
    }
    return {
      code: 200,
      message: `No. of session curves rate adj deleted: ${response.result.rowCount}`,
    };
  }

  async deleteAllSessionCurves(
    sessionId: number,
    bookId: number,
    traderId: number,
    userId: number,
    client?: pg.PoolClient,
  ): Promise<DeleteMutationResponse> {
    const queryConfig = this.queryConfigBuilder(
      QTypeE.DELETE,
      'DELETE_CURVE_FOR_SESSION',
      [sessionId, bookId, traderId, userId],
    );
    const response = await this.dbService.query(queryConfig, client);
    if (response.code != 200) {
      return { code: 500, message: 'Error deleting all session curves' };
    }
    return {
      code: 200,
      message: `No. of session curves deleted: ${response.result.rowCount}`,
    };
  }
}
