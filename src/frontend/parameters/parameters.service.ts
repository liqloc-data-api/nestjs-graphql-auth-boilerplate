import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'common/database/database.service';
import {
  AddMutationResponse,
  DateRangeLimitMembers,
  DeleteMutationResponse,
  DlNetDV01RangeMembers,
  LiquidInstrumentsMembers,
  MultiSessionDateRangeLimit,
  MultiSessionLimit,
  MultiSessionSingleMaturityLimit,
  OtherParametersMembersWithId,
  OtherParametersMembersWithSubId,
  RelativeDateLimitSettingMembers,
  SessionLimit,
  SingleMaturityLimitMembers,
  SingleMaturityLimitSettingMembers,
} from 'frontend/graphql.schema';
import * as path from 'path';
import { QTypeE } from 'utils/enum';
import { ParameterSubTypeIdE } from './enums_constants';
import * as pg from 'pg';
import { SessionInstrumentsService } from 'frontend/session-instruments/session-instruments.service';
import {
  validateFieldInObjectArray,
  validationObject,
} from 'common/validations/common.validations';
import { SingleMaturityLimitMembersSchema } from 'common/validations/single-maturity.validations';
import { DateRangeLimitMembersSchema } from 'common/validations/date-range.validations';

@Injectable()
export class ParametersService {
  queryConfigBuilder: Function;
  multiQueryConfigBuilder: Function;

  constructor(
    private readonly dbService: DatabaseService,
    private readonly sessionInstrumentsService: SessionInstrumentsService,
  ) {
    {
      [this.queryConfigBuilder, this.multiQueryConfigBuilder] =
        this.dbService.queryConfigBuilderFactory(
          path.join(__dirname, 'parameters.queries.json'),
        );
    }
  }

  async getSessionParametersByParameterTypes(
    bookId: number,
    traderId: number,
    sessionId: number,
    limitTypeIds: number[],
    client?: pg.PoolClient,
  ): Promise<SessionLimit[]> {
    const queryConfig = this.queryConfigBuilder(
      QTypeE.QUERY,
      'GET_PARAMETER_BY_PARAMETER_TYPE',
      [sessionId, bookId, traderId, [...limitTypeIds]],
    );
    const response = await this.dbService.query(queryConfig, client);
    if (
      response.code != 200 ||
      response.result.rowCount == 0 ||
      response.result.rowCount == null
    ) {
      return [];
    }
    return response.result.rows;
  }

  async getSessionParameterById(
    sessionId: number,
    bookId: number,
    traderId: number,
    limitId: number,
    client?: pg.PoolClient,
  ): Promise<SessionLimit> {
    const queryConfig = this.queryConfigBuilder(
      QTypeE.QUERY,
      'GET_PARAMETER_BY_ID',
      [sessionId, bookId, traderId, limitId],
    );
    const response = await this.dbService.query(queryConfig, client);
    if (
      response.code != 200 ||
      response.result.rowCount == 0 ||
      response.result.rowCount == null
    ) {
      return;
    }
    return response.result.rows[0];
  }

  async addSessionLimit(
    limitSubTypeId: number,
    sessionId: number,
    bookId: number,
    traderId: number,
    limitKey: string,
    limitMembers: any,
    customMembers: any,
    userId: number,
    client?: pg.PoolClient,
  ): Promise<AddMutationResponse> {
    const queryConfig = this.queryConfigBuilder(QTypeE.ADD, 'ADD_PARAMETERS', [
      limitSubTypeId,
      sessionId,
      bookId,
      traderId,
      limitKey,
      limitMembers,
      customMembers,
      userId,
    ]);
    const response = await this.dbService.query(queryConfig, client);
    if (response.code != 200) {
      return { code: 500, message: 'Error adding session limit' };
    }
    return {
      code: 200,
      message: `Session limit added successfully`,
      metaData: { limit: response.result.rows[0] },
    };
  }

  async addSessionLimits(
    multiLimits: MultiSessionLimit[],
    client: pg.PoolClient,
  ): Promise<AddMutationResponse> {
    if (multiLimits.length === 0) {
      return {
        code: 200,
        message: `No session limits to add`,
      };
    }
    const queryConfig = this.multiQueryConfigBuilder(
      QTypeE.ADD,
      'ADD_MULTI_PARAMETERS',
      [multiLimits],
    );
    const response = await this.dbService.query(queryConfig, client);
    if (response.code != 200) {
      return { code: 500, message: 'Error adding session limits' };
    }
    return {
      code: 200,
      message: `Session limits added successfully`,
      metaData: { limits: response.result.rows },
    };
  }

  async updateSessionLimit(
    sessionId: number,
    bookId: number,
    traderId: number,
    limitSubTypeId: number,
    limitId: number,
    limitKey: string,
    limitMembers: any,
    customMembers: any,
    userId: number,
    client?: pg.PoolClient,
  ): Promise<AddMutationResponse> {
    const queryConfig = this.queryConfigBuilder(
      QTypeE.UPDATE,
      'UPDATE_PARAMETER',
      [
        limitId,
        sessionId,
        bookId,
        traderId,
        limitSubTypeId,
        limitKey,
        limitMembers,
        customMembers,
        userId,
      ],
    );
    const response = await this.dbService.query(queryConfig, client);
    if (response.code != 200) {
      return { code: 500, message: 'Error updating session limit' };
    }
    return {
      code: 200,
      message: `Session limit updated successfully`,
      metaData: { limit: response.result.rows[0] },
    };
  }

  async addSingleMaturityLimit(
    sessionId: number,
    bookId: number,
    traderId: number,
    limitMembers: SingleMaturityLimitMembers,
    customMembers: any,
    userId: number,
    client?: pg.PoolClient,
  ): Promise<AddMutationResponse> {
    const limitSubTypeId = ParameterSubTypeIdE.SM;
    const {
      status: validationStatus,
      errors: validationErrors,
      data: updatedObject,
    } = validationObject(limitMembers, SingleMaturityLimitMembersSchema);
    if (!validationStatus) {
      return {
        code: 400,
        message: 'Invalid Single Maturity Limit Members',
        metaData: validationErrors,
      };
    }
    limitMembers = updatedObject;
    const output = this.addSessionLimit(
      limitSubTypeId,
      sessionId,
      bookId,
      traderId,
      null,
      limitMembers,
      customMembers,
      userId,
      client,
    );
    return output;
  }

  async addSingleMaturityLimits(
    sessionId: number,
    bookId: number,
    traderId: number,
    limitMembers_array: SingleMaturityLimitMembers[],
    userId: number,
    client?: pg.PoolClient,
  ): Promise<AddMutationResponse> {
    const multiSingleMaturity = limitMembers_array.map((limitMembers) => ({
      parameter_subtype_id: ParameterSubTypeIdE.SM,
      session_id: sessionId,
      book_id: bookId,
      trader_id: traderId,
      parameter_key: null,
      parameter_members: limitMembers,
      custom_members: null,
      updated_by: userId,
    }));
    return this.addSingleMaturityLimitsInternal(multiSingleMaturity, client);
  }
  async addSingleMaturityLimitsInternal(
    multiSingleMaturity: MultiSessionSingleMaturityLimit[],
    client: pg.PoolClient,
  ): Promise<AddMutationResponse> {
    const {
      status: validationStatus,
      errors: validationErrors,
      data: objArray,
    } = validateFieldInObjectArray(
      multiSingleMaturity,
      'parameter_members',
      SingleMaturityLimitMembersSchema,
    );
    if (!validationStatus) {
      return {
        code: 400,
        message: 'Invalid Single Maturity Limit Members',
        metaData: validationErrors,
      };
    }
    multiSingleMaturity = objArray;
    return this.addSessionLimits(multiSingleMaturity, client);
  }

  async updateSingleMaturityLimit(
    sessionId: number,
    bookId: number,
    traderId: number,
    limitId: number,
    limitMembers: SingleMaturityLimitMembers,
    customMembers: any,
    userId: number,
    client?: pg.PoolClient,
  ): Promise<AddMutationResponse> {
    const limitSubTypeId = ParameterSubTypeIdE.SM;
    const {
      status: validationStatus,
      errors: validationErrors,
      data: updatedObject,
    } = validationObject(limitMembers, SingleMaturityLimitMembersSchema);
    if (!validationStatus) {
      return {
        code: 400,
        message: 'Invalid Single Maturity Limit Members',
        metaData: validationErrors,
      };
    }
    limitMembers = updatedObject;
    const output = this.updateSessionLimit(
      sessionId,
      bookId,
      traderId,
      limitSubTypeId,
      limitId,
      null,
      limitMembers,
      customMembers,
      userId,
      client,
    );
    return output;
  }

  async addSingleMaturityLimitSetting(
    sessionId: number,
    bookId: number,
    traderId: number,
    limitMembers: SingleMaturityLimitSettingMembers,
    userId: number,
    client?: pg.PoolClient,
  ): Promise<AddMutationResponse> {
    const limitSubTypeId = ParameterSubTypeIdE.SM_SETTING;
    const limitKey = await this.generateParameterSubTypeNameOrderKey(
      limitSubTypeId,
      client,
    );
    const output = this.addSessionLimit(
      limitSubTypeId,
      sessionId,
      bookId,
      traderId,
      limitKey,
      limitMembers,
      null,
      userId,
      client,
    );
    return output;
  }

  async updateSingleMaturityLimitSetting(
    sessionId: number,
    bookId: number,
    traderId: number,
    limitId: number,
    limitMembers: SingleMaturityLimitSettingMembers,
    userId: number,
    client?: pg.PoolClient,
  ): Promise<AddMutationResponse> {
    const limitSubTypeId = ParameterSubTypeIdE.SM_SETTING;
    const limitKey = await this.generateParameterSubTypeNameOrderKey(
      limitSubTypeId,
      client,
    );
    const output = this.updateSessionLimit(
      sessionId,
      bookId,
      traderId,
      limitSubTypeId,
      limitId,
      limitKey,
      limitMembers,
      null,
      userId,
      client,
    );
    return output;
  }

  async addDateRangeLimit(
    sessionId: number,
    bookId: number,
    traderId: number,
    limitMembers: DateRangeLimitMembers,
    customMembers: any,
    userId: number,
    client?: pg.PoolClient,
  ): Promise<AddMutationResponse> {
    const limitSubTypeId = ParameterSubTypeIdE.DR;
    const {
      status: validationStatus,
      errors: validationErrors,
      data: updatedObject,
    } = validationObject(limitMembers, DateRangeLimitMembersSchema);
    if (!validationStatus) {
      return {
        code: 400,
        message: 'Invalid Date Range Limit Members',
        metaData: validationErrors,
      };
    }
    limitMembers = updatedObject;
    const output = this.addSessionLimit(
      limitSubTypeId,
      sessionId,
      bookId,
      traderId,
      null,
      limitMembers,
      customMembers,
      userId,
      client,
    );
    return output;
  }

  async addDateRangeLimits(
    multiDateRange: MultiSessionDateRangeLimit[],
    client: pg.PoolClient,
  ): Promise<AddMutationResponse> {
    const {
      status: validationStatus,
      errors: validationErrors,
      data: objArray,
    } = validateFieldInObjectArray(
      multiDateRange,
      'parameter_members',
      SingleMaturityLimitMembersSchema,
    );
    if (!validationStatus) {
      return {
        code: 400,
        message: 'Invalid Date Range Limit Members',
        metaData: validationErrors,
      };
    }
    multiDateRange = objArray;
    return this.addSessionLimits(multiDateRange, client);
  }

  async updateDateRangeLimit(
    sessionId: number,
    bookId: number,
    traderId: number,
    limitId: number,
    limitMembers: DateRangeLimitMembers,
    customMembers: any,
    userId: number,
    client?: pg.PoolClient,
  ): Promise<AddMutationResponse> {
    const limitSubTypeId = ParameterSubTypeIdE.DR;
    const {
      status: validationStatus,
      errors: validationErrors,
      data: updatedObject,
    } = validationObject(limitMembers, DateRangeLimitMembersSchema);
    if (!validationStatus) {
      return {
        code: 400,
        message: 'Invalid Date Range Limit Members',
        metaData: validationErrors,
      };
    }
    limitMembers = updatedObject;
    const output = this.updateSessionLimit(
      sessionId,
      bookId,
      traderId,
      limitSubTypeId,
      limitId,
      null,
      limitMembers,
      customMembers,
      userId,
      client,
    );
    return output;
  }

  async addRelativeDateLimit(
    sessionId: number,
    bookId: number,
    traderId: number,
    limitMembers: JSON,
    userId: number,
    client?: pg.PoolClient,
  ): Promise<AddMutationResponse> {
    const limitSubTypeId = ParameterSubTypeIdE.RD;
    const limitKey = await this.generateParameterSubTypeNameOrderKey(
      limitSubTypeId,
      client,
    );
    const output = this.addSessionLimit(
      limitSubTypeId,
      sessionId,
      bookId,
      traderId,
      limitKey,
      limitMembers,
      null,
      userId,
      client,
    );
    return output;
  }

  async updateRelativeDateLimit(
    sessionId: number,
    bookId: number,
    traderId: number,
    limitId: number,
    limitMembers: JSON,
    userId: number,
    client?: pg.PoolClient,
  ): Promise<AddMutationResponse> {
    const limitSubTypeId = ParameterSubTypeIdE.RD;
    const limitKey = await this.generateParameterSubTypeNameOrderKey(
      limitSubTypeId,
      client,
    );
    const output = this.updateSessionLimit(
      sessionId,
      bookId,
      traderId,
      limitSubTypeId,
      limitId,
      limitKey,
      limitMembers,
      null,
      userId,
      client,
    );
    return output;
  }

  async addRelativeDateLimitSetting(
    sessionId: number,
    bookId: number,
    traderId: number,
    limitMembers: RelativeDateLimitSettingMembers,
    userId: number,
    client?: pg.PoolClient,
  ): Promise<AddMutationResponse> {
    const limitSubTypeId = ParameterSubTypeIdE.RD_SETTING;
    const limitKey = await this.generateParameterSubTypeNameOrderKey(
      limitSubTypeId,
      client,
    );
    const output = this.addSessionLimit(
      limitSubTypeId,
      sessionId,
      bookId,
      traderId,
      limitKey,
      limitMembers,
      null,
      userId,
      client,
    );
    return output;
  }

  async updateRelativeDateLimitSetting(
    sessionId: number,
    bookId: number,
    traderId: number,
    limitId: number,
    limitMembers: RelativeDateLimitSettingMembers,
    userId: number,
    client?: pg.PoolClient,
  ): Promise<AddMutationResponse> {
    const limitSubTypeId = ParameterSubTypeIdE.RD_SETTING;
    const limitKey = await this.generateParameterSubTypeNameOrderKey(
      limitSubTypeId,
      client,
    );
    const output = this.updateSessionLimit(
      sessionId,
      bookId,
      traderId,
      limitSubTypeId,
      limitId,
      limitKey,
      limitMembers,
      null,
      userId,
      client,
    );
    return output;
  }

  async addLiquidInstruments(
    sessionId: number,
    bookId: number,
    traderId: number,
    limitMembers: LiquidInstrumentsMembers,
    userId: number,
    client?: pg.PoolClient,
  ): Promise<AddMutationResponse> {
    const limitSubTypeId = ParameterSubTypeIdE.LIQUID;
    const limitKey = await this.generateParameterSubTypeNameOrderKey(
      limitSubTypeId,
      client,
    );
    const output = this.addSessionLimit(
      limitSubTypeId,
      sessionId,
      bookId,
      traderId,
      limitKey,
      limitMembers,
      null,
      userId,
      client,
    );
    return output;
  }

  async updateLiquidInstruments(
    sessionId: number,
    bookId: number,
    traderId: number,
    limitId: number,
    limitMembers: LiquidInstrumentsMembers,
    userId: number,
    client?: pg.PoolClient,
  ): Promise<AddMutationResponse> {
    const limitSubTypeId = ParameterSubTypeIdE.LIQUID;
    const limitKey = await this.generateParameterSubTypeNameOrderKey(
      limitSubTypeId,
      client,
    );
    const output = this.updateSessionLimit(
      sessionId,
      bookId,
      traderId,
      limitSubTypeId,
      limitId,
      limitKey,
      limitMembers,
      null,
      userId,
      client,
    );
    return output;
  }

  async addOtherParameters(
    sessionId: number,
    bookId: number,
    traderId: number,
    parameter_detail_list: OtherParametersMembersWithSubId[],
    userId: number,
    client?: pg.PoolClient,
  ): Promise<AddMutationResponse> {
    const validSubTypes = [
      ParameterSubTypeIdE.MAX_GROSS_NOTIONAL,
      ParameterSubTypeIdE.MAX_TRADE_COUNT,
      ParameterSubTypeIdE.MAX_MM_PNL,
    ]; // TODO pick this from database
    const variablesPromise = parameter_detail_list.map(
      async ({ parameter_subtype_id, parameter_member }) => {
        if (!validSubTypes.includes(parameter_subtype_id)) {
          throw new Error(
            `Invalid limit subtype id for Other Parameters: ${parameter_subtype_id}`,
          );
        }
        const limitKey = await this.generateParameterSubTypeNameOrderKey(
          parameter_subtype_id,
          client,
        );
        return [
          parameter_subtype_id,
          sessionId,
          bookId,
          traderId,
          limitKey,
          parameter_member,
          null,
          userId,
        ];
      },
    );

    const inputValuesArrayOfArray = await Promise.all(variablesPromise);
    const inputValues = inputValuesArrayOfArray.flat();

    const placeholder = parameter_detail_list
      .map(
        (_, index) =>
          `($${index * 8 + 1}::integer, $${index * 8 + 2}::integer, $${
            index * 8 + 3
          }::integer, $${index * 8 + 4}::integer, $${index * 8 + 5}::text, $${
            index * 8 + 6
          }::jsonb, $${index * 8 + 7}::jsonb, $${index * 8 + 8}::int)`,
      )
      .join(', ');
    const queryConfig = this.queryConfigBuilder(
      QTypeE.ADD,
      'ADD_MULTI_PARAMETERS',
      inputValues,
    );
    queryConfig.text = queryConfig.text.replace('{placeholder}', placeholder);

    const response = await this.dbService.query(queryConfig, client);
    if (response.code != 200) {
      return { code: 500, message: 'Error updating Other Parameters' };
    }
    return {
      code: 200,
      message: 'Other Parameters updated successfully',
      metaData: { limits: response.result.rows },
    };
  }
  async updateOtherParameters(
    sessionId: number,
    bookId: number,
    traderId: number,
    parameter_detail_list: OtherParametersMembersWithId[],
    userId: number,
    client?: pg.PoolClient,
  ): Promise<AddMutationResponse> {
    const validSubTypes = [
      ParameterSubTypeIdE.MAX_GROSS_NOTIONAL,
      ParameterSubTypeIdE.MAX_TRADE_COUNT,
      ParameterSubTypeIdE.MAX_MM_PNL,
    ]; // TODO pick this from database
    const inputValues = [
      sessionId,
      bookId,
      traderId,
      userId,
      validSubTypes,
      ...parameter_detail_list.flatMap((data) => [
        data.parameter_id,
        data.parameter_member,
      ]),
    ];
    const placeholder = parameter_detail_list
      .map(
        (_, index) => `($${index * 2 + 6}::integer, $${index * 2 + 7}::jsonb)`,
      )
      .join(', ');

    const queryConfig = this.queryConfigBuilder(
      QTypeE.UPDATE,
      'UPDATE_MULTI_PARAMETERS',
      inputValues,
    );
    queryConfig.text = queryConfig.text.replace('{placeholder}', placeholder);

    const response = await this.dbService.query(queryConfig, client);
    if (response.code != 200) {
      return { code: 500, message: 'Error updating Other Parameters' };
    }
    return {
      code: 200,
      message: `Other Parameters updated successfully`,
      metaData: { limits: response.result.rows },
    };
  }

  async addDlNetDV01RangeLimit(
    sessionId: number,
    bookId: number,
    traderId: number,
    limitMembers: DlNetDV01RangeMembers,
    userId: number,
    client?: pg.PoolClient,
  ) {
    const limitSubTypeId = ParameterSubTypeIdE.NET_AMOUNT_RANGE;
    const output = this.addSessionLimit(
      limitSubTypeId,
      sessionId,
      bookId,
      traderId,
      null,
      limitMembers,
      null,
      userId,
      client,
    );
    return output;
  }

  async updateDlNetDV01RangeLimit(
    sessionId: number,
    bookId: number,
    traderId: number,
    limitId: number,
    limitMembers: DlNetDV01RangeMembers,
    userId: number,
    client?: pg.PoolClient,
  ) {
    const output = this.updateSessionLimit(
      sessionId,
      bookId,
      traderId,
      ParameterSubTypeIdE.NET_AMOUNT_RANGE,
      limitId,
      null,
      limitMembers,
      null,
      userId,
      client,
    );
    return output;
  }

  async deleteSessionParametersCustomColumn(
    sessionId: number,
    bookId: number,
    traderId: number,
    limitTypeId: number,
    columnName: string,
    userId: number,
    client?: pg.PoolClient,
  ): Promise<DeleteMutationResponse> {
    const queryConfig = this.queryConfigBuilder(
      QTypeE.DELETE,
      'DELETE_PARAMETERS_CUSTOM_COLUMN',
      [sessionId, bookId, traderId, limitTypeId, columnName, userId],
    );
    const response = await this.dbService.query(queryConfig, client);
    if (response.code != 200) {
      return {
        code: 500,
        message: 'Error deleting session limit custom column',
      };
    }
    return {
      code: 200,
      message: `No. of session limits deleted: ${response.result.rowCount}`,
    };
  }

  async deleteSessionParameters(
    sessionId: number,
    bookId: number,
    traderId: number,
    limitIds: number[],
    userId: number,
    client?: pg.PoolClient,
  ): Promise<DeleteMutationResponse> {
    const queryConfig = this.queryConfigBuilder(
      QTypeE.DELETE,
      'DELETE_PARAMETERS_BY_IDS',
      [sessionId, bookId, traderId, limitIds, userId],
    );
    const response = await this.dbService.query(queryConfig, client);
    if (response.code != 200) {
      return { code: 500, message: 'Error deleting session limits' };
    }
    return {
      code: 200,
      message: `No. of session limits deleted: ${response.result.rowCount}`,
    };
  }

  async deleteAllSessionParametersByTypeIds(
    sessionId: number,
    bookId: number,
    traderId: number,
    limitTypeIds: number[],
    userId: number,
    client?: pg.PoolClient,
  ): Promise<DeleteMutationResponse> {
    const queryConfig = this.queryConfigBuilder(
      QTypeE.DELETE,
      'DELETE_ALL_PARAMETERS_BY_TYPE_IDS',
      [sessionId, bookId, traderId, limitTypeIds, userId],
    );
    const response = await this.dbService.query(queryConfig, client);
    if (response.code != 200) {
      return { code: 500, message: 'Error deleting session limits' };
    }
    return {
      code: 200,
      message: `No. of session limits deleted: ${response.result.rowCount}`,
    };
  }

  async deleteInferredLimits(
    sessionId: number,
    bookId: number,
    userId: number,
    client?: pg.PoolClient,
  ): Promise<DeleteMutationResponse> {
    try {
      const transactionManager =
        await this.dbService.getTransactionManager(client);
      transactionManager.setCallback(async (client) => {
        const queryConfig = this.queryConfigBuilder(
          QTypeE.DELETE,
          'DELETE_PARAMETERS_BY_SUBTYPE_IDS',
          [
            sessionId,
            bookId,
            -1,
            [ParameterSubTypeIdE.RD_INFERRED, ParameterSubTypeIdE.SM_INFERRED],
            userId,
          ],
        );
        const response = await this.dbService.query(queryConfig, client);
        if (response.code != 200) {
          return { code: 500, message: 'Error deleting RD inferred limits' };
        }
        return {
          code: 200,
          message: `No. of inferred limits deleted: ${response.result.rowCount}`,
        };
      });
      const output = await transactionManager.executeTransaction();
      return output;
    } catch (error) {
      return { code: 500, message: 'Error deleting inferred limits' };
    }
  }

  private async generateInstrumentBasedLimitKey(
    sessionId: number,
    limitSubTypeId: ParameterSubTypeIdE,
    limitMembers: any,
    sessionInstrumentMapper?: Map<number, string>,
    client?: pg.PoolClient,
  ): Promise<string> {
    const idToSymbolMap =
      sessionInstrumentMapper ||
      (await this.sessionInstrumentsService.getSessionInstrumentSymbolMapper(
        sessionId,
        undefined,
        client,
      ));
    switch (limitSubTypeId) {
      case ParameterSubTypeIdE.SM:
        return `${idToSymbolMap.get(limitMembers.instrument_id)}`;
      case ParameterSubTypeIdE.DR:
        return `${idToSymbolMap.get(
          limitMembers.instrument_id_min,
        )}-${idToSymbolMap.get(limitMembers.instrument_id_max)}`;
      default:
        return;
    }
  }

  private async generateParameterSubTypeNameOrderKey(
    subLimitTypeId: number,
    client?: pg.PoolClient,
  ): Promise<string> {
    const mapper = await this.getParameterSubTypeIdToNameMap(client);
    return mapper.get(subLimitTypeId);
  }

  async getParameterSubTypeIdToNameMap(
    client: pg.PoolClient,
  ): Promise<Map<number, string>> {
    const queryConfig = this.queryConfigBuilder(
      QTypeE.QUERY,
      'GET_PARAMETER_SUBTYPES',
      [],
    );
    const response = await this.dbService.query(queryConfig, client);
    if (
      response.code != 200 ||
      response.result.rowCount == 0 ||
      response.result.rowCount == null
    ) {
      return;
    }
    const subLimitTypeIdToNameMap = response.result.rows.reduce((map, row) => {
      map.set(row.parameter_subtype_id, row.parameter_subtype_name);
      return map;
    }, new Map());
    return subLimitTypeIdToNameMap;
  }
}
