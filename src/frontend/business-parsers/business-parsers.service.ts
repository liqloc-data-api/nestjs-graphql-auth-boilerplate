import { parseMaturityMapper } from './business-parsers-utils/maturity-mapper.utils';
import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'common/database/database.service';
import {
  MMWJson,
  Session,
  SingleMaturityLimitImplied,
} from 'frontend/graphql.schema';
import { ParametersService } from 'frontend/parameters/parameters.service';
import { OrdersService } from 'frontend/orders/orders.service';
import { SessionInstrumentsService } from 'frontend/session-instruments/session-instruments.service';
import { SessionsService } from 'frontend/sessions/sessions.service';
import {
  AddMutationResponse,
  RuleBasedMMOrderMembers,
  SessionMultiOrder,
} from 'graphql.schema';
import * as path from 'path';
import * as pg from 'pg';
import {
  MMWParser,
  SampleDataFormatter,
} from './business-parsers-utils/mmw.utils';
import { FeSettingsService } from 'frontend/fe-settings/fe-settings.service';
import {
  ParameterSubTypeIdE,
  ParameterTypeIdE,
} from 'frontend/parameters/enums_constants';
import { OrderTypeIdE, SubOrderTypeIdE } from 'frontend/orders/enums_constants';
import { SettingTypeIdE } from 'frontend/fe-settings/enums_constants';
import { CurvesService } from 'frontend/curves/curves.service';
import {
  generateImpliedLimits,
  transformImpliedSMLimitsToMulti,
} from './business-parsers-utils/implied-limits.utils';
import { getRdrlValues } from './business-parsers-utils/rdrl-values.utils';

@Injectable()
export class BusinessParsersService {
  queryConfigBuilder: Function;
  multiQueryConfigBuilder: Function;

  constructor(
    private readonly dbService: DatabaseService,
    private readonly sessionsService: SessionsService,
    private readonly sessionInstrumentsService: SessionInstrumentsService,
    private readonly feSettingsService: FeSettingsService,
    private readonly ordersService: OrdersService,
    private readonly ParametersService: ParametersService,
    private readonly curvesService: CurvesService,
  ) {
    [this.queryConfigBuilder, this.multiQueryConfigBuilder] =
      this.dbService.queryConfigBuilderFactory(
        path.join(__dirname, 'business-parsers.queries.json'),
      );
  }

  async getMaturityMapper(
    sessionId: number,
    bookId: number,
    traderId: number,
  ): Promise<any> {
    const sessionInstrumentsP =
      this.sessionInstrumentsService.getSessionInstruments(sessionId);
    const directionalOrdersP = this.ordersService.getSessionOrdersByOrderTypes(
      sessionId,
      bookId,
      traderId,
      [OrderTypeIdE.DO],
    );
    const limitsP = this.ParametersService.getSessionParametersByParameterTypes(
      bookId,
      -1,
      sessionId,
      [ParameterTypeIdE.SM, ParameterTypeIdE.DR],
    );
    const [sessionInstruments, directionalOrders, limits] = await Promise.all([
      sessionInstrumentsP,
      directionalOrdersP,
      limitsP,
    ]);
    const maturityMapper = parseMaturityMapper(
      sessionInstruments,
      directionalOrders,
      limits,
    );
    return maturityMapper;
  }

  async addMMWOrdersParams(
    sessionId: number,
    bookId: number,
    traderId: number,
    mmwJson: MMWJson,
    userId: number,
    client?: pg.PoolClient,
  ): Promise<AddMutationResponse> {
    try {
      const session = await this.sessionsService.getSession(sessionId, client);
      if (!session) {
        throw new Error('Session not found');
      }
      const sessionInstruments =
        await this.sessionInstrumentsService.getSessionInstruments(
          sessionId,
          client,
        );
      const sessionInstrumentsMap =
        await this.sessionInstrumentsService.getSessionInstrumentSymbolMapper(
          sessionId,
          sessionInstruments,
          client,
        );
      const subOrderTypeIdToNameMap =
        await this.ordersService.getSubOrderTypeIdToNameMap(client);
      if (sessionInstruments.length === 0) {
        throw new Error('Session instruments not found');
      }
      const defaultRelativeDate = (
        await this.feSettingsService.getSessionFeSettingsByTypeId(
          sessionId,
          SettingTypeIdE.DefaultBucketsRDRL,
          client,
        )
      ).setting_members;
      const mmwParser = new MMWParser(
        mmwJson,
        sessionInstruments,
        session,
        defaultRelativeDate,
      );
      const parsedData = mmwParser.mainParser();
      const transactionManager =
        await this.dbService.getTransactionManager(client);
      transactionManager.setCallback(async (client) => {
        const limitTypeDelete = [];
        if (parsedData.data.liquidInstruments)
          limitTypeDelete.push(ParameterTypeIdE.LIQUID);
        if (parsedData.data.relativeDateSettings)
          limitTypeDelete.push(ParameterTypeIdE.RD);
        if (parsedData.data.singleMaturitySettings)
          limitTypeDelete.push(ParameterTypeIdE.SM);
        let mmOrdersToWrite = [];

        if (parsedData.data.liquidMMOrders) {
          mmOrdersToWrite = mmOrdersToWrite.concat(
            parsedData.data.liquidMMOrders,
          );
        }
        if (parsedData.data.spotMMOrders) {
          mmOrdersToWrite = mmOrdersToWrite.concat(
            parsedData.data.spotMMOrders,
          );
        }
        if (parsedData.data.immMMOrders) {
          mmOrdersToWrite = mmOrdersToWrite.concat(parsedData.data.immMMOrders);
        }

        const orderTypeDelete = [];
        let multiOrderObject: SessionMultiOrder[] = [];
        if (mmOrdersToWrite.length > 0) {
          orderTypeDelete.push(OrderTypeIdE.MM);
          const mmMultiOrders = await this.convertMMWOrdersToSessionMultiOrder(
            mmOrdersToWrite,
            sessionId,
            bookId,
            traderId,
            userId,
            sessionInstrumentsMap,
            client,
          );
          multiOrderObject = multiOrderObject.concat(mmMultiOrders);
        }
        if (parsedData?.data?.ruleBasedOrders) {
          orderTypeDelete.push(OrderTypeIdE.RB);
          const rbMultiOrders = await this.convertRBOrdersToSessionMultiOrder(
            parsedData.data.ruleBasedOrders,
            sessionId,
            bookId,
            traderId,
            userId,
            subOrderTypeIdToNameMap,
            client,
          );
          multiOrderObject = multiOrderObject.concat(rbMultiOrders);
        }

        if (mmwJson.DummyDataCopy.deltaLadder) {
          orderTypeDelete.push(OrderTypeIdE.DL);
          const deltaLadderDeleteResponse =
            await this.ParametersService.deleteAllSessionParametersByTypeIds(
              sessionId,
              bookId,
              traderId,
              [ParameterTypeIdE.DL],
              userId,
              client,
            );
        }

        if (mmwJson.DummyDataCopy.directional)
          orderTypeDelete.push(OrderTypeIdE.DO);

        const limitDeleteResponse =
          await this.ParametersService.deleteAllSessionParametersByTypeIds(
            sessionId,
            bookId,
            -1,
            limitTypeDelete,
            userId,
            client,
          );

        const orderDeleteResponse =
          await this.ordersService.deleteAllSessionOrdersByTypeIds(
            sessionId,
            bookId,
            traderId,
            orderTypeDelete,
            userId,
            client,
          );

        if (mmwJson.DummyDataCopy.curve) {
          await this.curvesService.deleteAllSessionCurves(
            sessionId,
            bookId,
            traderId,
            userId,
            client,
          );
        }

        const addResponseArray = [];

        if (parsedData.data.liquidInstruments) {
          const responseLiquidInstruments =
            this.ParametersService.addLiquidInstruments(
              sessionId,
              bookId,
              -1,
              parsedData.data.liquidInstruments,
              userId,
              client,
            );
          addResponseArray.push(responseLiquidInstruments);
        }
        if (parsedData.data.relativeDateSettings) {
          const responseRelativeDateSetting =
            this.ParametersService.addRelativeDateLimitSetting(
              sessionId,
              bookId,
              -1,
              parsedData.data.relativeDateSettings,
              userId,
              client,
            );
          addResponseArray.push(responseRelativeDateSetting);
        }
        if (parsedData.data.singleMaturitySettings) {
          const responseSingleMaturityLimitSetting =
            this.ParametersService.addSingleMaturityLimitSetting(
              sessionId,
              bookId,
              -1,
              parsedData.data.singleMaturitySettings,
              userId,
              client,
            );
          addResponseArray.push(responseSingleMaturityLimitSetting);
        }

        if (multiOrderObject.length > 0) {
          const responseOrders = this.ordersService.addSessionOrders(
            multiOrderObject,
            client,
          );
          addResponseArray.push(responseOrders);
        }

        if (
          mmwJson?.DummyDataCopy.curve ||
          mmwJson?.DummyDataCopy.directional ||
          mmwJson?.DummyDataCopy.deltaLadder
        ) {
          const sampleDataFormatter = new SampleDataFormatter(
            sessionInstruments,
          );
          const sampleDataTemplate = (
            await this.feSettingsService.getSessionFeSettingsByTypeId(
              sessionId,
              SettingTypeIdE.DemoOnlySampleData,
              client,
            )
          ).setting_members;
          if (mmwJson?.DummyDataCopy.directional) {
            const sampleDO = sampleDataFormatter.directionalOrdersParser(
              sessionId,
              bookId,
              traderId,
              userId,
              sampleDataTemplate.DO,
            );
            const responseDirectionalOrders =
              this.ordersService.addSessionOrders(sampleDO, client);
            addResponseArray.push(responseDirectionalOrders);
          }
          if (mmwJson.DummyDataCopy.deltaLadder) {
            const deltaLadderOrderMembers =
              sampleDataFormatter.deltaLadderOrderMembersParser();
            const responseDeltaLaderOrder =
              await this.ordersService.addDeltaLadderOrder(
                sessionId,
                bookId,
                traderId,
                deltaLadderOrderMembers,
                userId,
                client,
              );
            const deltaLadderOrderId =
              responseDeltaLaderOrder.metaData.order.order_id;
            const sampleDL = sampleDataFormatter.deltaLadderDetailParser(
              deltaLadderOrderId,
              sessionId,
              userId,
              sampleDataTemplate.DL,
            );
            const responseDeltaLadderDetails =
              this.ordersService.addDeltaLadderOrderDetails(sampleDL, client);
            addResponseArray.push(responseDeltaLadderDetails);
          }
          if (mmwJson.DummyDataCopy.curve) {
            const sampleCurve = sampleDataFormatter.curvesParser(
              sessionId,
              bookId,
              traderId,
              userId,
              sampleDataTemplate.CR,
            );
            const responseCurve = this.curvesService.addSessionCurves(
              sampleCurve,
              client,
            );
            addResponseArray.push(responseCurve);
          }
        }

        const outputStatus = await Promise.all(addResponseArray);
        outputStatus.forEach((status) => {
          if (status.code != 200) {
            throw new Error(`Error adding data: ${status.message}`);
          }
        });

        return true;
      });
      const status = await transactionManager.executeTransaction();
      if (status === true) {
        return {
          code: 200,
          message: 'Success',
          metaData: parsedData,
        };
      }
      throw Error('Error executing transaction');
    } catch (err) {
      return {
        code: 500,
        message: `Error: ${err.stack}`,
      };
    }
  }

  async convertMMWOrdersToSessionMultiOrder(
    mmOrdersToWrite: any[],
    sessionId: number,
    bookId: number,
    traderId: number,
    userId: number,
    sessionInstrumentsMap: Map<number, string>,
    client: pg.PoolClient,
  ): Promise<SessionMultiOrder[]> {
    return await Promise.all(
      mmOrdersToWrite.map(async (order) => {
        return {
          session_id: sessionId,
          book_id: bookId,
          trader_id: traderId,
          order_subtype_id: SubOrderTypeIdE.MM_SINGLE,
          order_key: null,
          order_members: order,
          custom_members: null,
          updated_by: userId,
        };
      }),
    );
  }

  async convertRBOrdersToSessionMultiOrder(
    rbOrdersToWrite: Record<number, RuleBasedMMOrderMembers>,
    sessionId: number,
    bookId: number,
    traderId: number,
    userId: number,
    subOrderTypeIdToNameMap: Map<number, string>,
    client: pg.PoolClient,
  ): Promise<SessionMultiOrder[]> {
    return Promise.all(
      Object.keys(rbOrdersToWrite).map(async (key) => {
        return {
          session_id: sessionId,
          book_id: bookId,
          trader_id: traderId,
          order_subtype_id: Number(key),
          order_key: null,
          order_members: rbOrdersToWrite[key],
          custom_members: null,
          updated_by: userId,
        };
      }),
    );
  }

  async getImpliedSMLimits(
    sessionId: number,
    bookId: number,
    client?: pg.PoolClient,
  ): Promise<SingleMaturityLimitImplied[]> {
    const sessionInstrumentsP =
      this.sessionInstrumentsService.getSessionInstruments(sessionId, client);
    const directionalOrdersP =
      this.ordersService.getSessionOrdersByOrderTypesBook(
        sessionId,
        bookId,
        [OrderTypeIdE.DO],
        client,
      );
    const marketMakingOrdersP =
      this.ordersService.getSessionOrdersByOrderTypesBook(
        sessionId,
        bookId,
        [OrderTypeIdE.MM],
        client,
      );
    const deltaLadderP = this.ordersService.getSessionOrderDetailsByBook(
      sessionId,
      bookId,
      client,
    );
    const limitsP = this.ParametersService.getSessionParametersByParameterTypes(
      bookId,
      -1,
      sessionId,
      [ParameterTypeIdE.SM],
      client,
    );

    const [
      sessionInstruments,
      directionalOrders,
      marketMakingOrders,
      deltaLadder,
      limits,
    ] = await Promise.all([
      sessionInstrumentsP,
      directionalOrdersP,
      marketMakingOrdersP,
      deltaLadderP,
      limitsP,
    ]);

    const sessionLimits = [];
    let limitSettings;
    limits.map((limit) => {
      if (limit.parameter_subtype_id === ParameterSubTypeIdE.SM)
        sessionLimits.push(limit);
      else if (limit.parameter_subtype_id === ParameterSubTypeIdE.SM_SETTING)
        limitSettings = limit;
    });

    const impliedLimits = generateImpliedLimits(
      marketMakingOrders,
      directionalOrders,
      deltaLadder,
      sessionInstruments,
      sessionLimits,
      limitSettings,
    );

    return impliedLimits;
  }

  async getImpliedRDRLimits(
    sessionId: number,
    bookId: number,
    smImpliedLimits?: SingleMaturityLimitImplied[],
    client?: pg.PoolClient,
  ): Promise<any> {
    let impliedLimits;
    if (smImpliedLimits) {
      impliedLimits = smImpliedLimits;
    } else {
      impliedLimits = await this.getImpliedSMLimits(sessionId, bookId, client);
    }

    const sessionInstrumentsP =
      this.sessionInstrumentsService.getSessionInstruments(sessionId, client);

    const savedLimitsP =
      this.ParametersService.getSessionParametersByParameterTypes(
        bookId,
        -1,
        sessionId,
        [ParameterTypeIdE.RD],
        client,
      );

    const limitSettingsP = this.feSettingsService.getSessionFeSettingsByTypeId(
      sessionId,
      SettingTypeIdE.DefaultBucketsRDRL,
      client,
    );

    const [savedLimits, limitSettings, sessionInstruments] = await Promise.all([
      savedLimitsP,
      limitSettingsP,
      sessionInstrumentsP,
    ]);

    const rdrlValues = getRdrlValues(
      impliedLimits,
      savedLimits,
      limitSettings,
      sessionInstruments,
    );

    return rdrlValues;
  }

  async addImpliedLimits(
    sessionId: number,
    bookId: number,
    userId: number,
    client?: pg.PoolClient,
  ): Promise<AddMutationResponse> {
    try {
      const rawSMImpliedLimits = await this.getImpliedSMLimits(
        sessionId,
        bookId,
        client,
      );
      const rawRDRLImpliedLimits = await this.getImpliedRDRLimits(
        sessionId,
        bookId,
        rawSMImpliedLimits,
        client,
      );
      const smMultiData = transformImpliedSMLimitsToMulti(
        sessionId,
        bookId,
        -1,
        userId,
        rawSMImpliedLimits,
      );

      const transactionManager =
        await this.dbService.getTransactionManager(client);
      transactionManager.setCallback(async (client) => {
        const deleteResponse =
          await this.ParametersService.deleteInferredLimits(
            sessionId,
            bookId,
            userId,
            client,
          );
        if (deleteResponse.code != 200) {
          throw new Error(
            `Error deleting inferred limits: ${deleteResponse.message}`,
          );
        }
        const smResponse =
          await this.ParametersService.addSingleMaturityLimitsInternal(
            smMultiData,
            client,
          );
        if (smResponse.code != 200) {
          throw new Error(
            `Error adding SM implied limits: ${smResponse.message}`,
          );
        }

        const rdrlResponse = await this.ParametersService.addSessionLimit(
          ParameterSubTypeIdE.RD_INFERRED,
          sessionId,
          bookId,
          -1,
          null,
          rawRDRLImpliedLimits,
          null,
          userId,
          client,
        );
        if (rdrlResponse.code != 200) {
          throw new Error(
            `Error adding RDRL implied limits: ${rdrlResponse.message}`,
          );
        }
      });

      const response = await transactionManager.executeTransaction();

      return {
        code: 200,
        message: 'Successfully added implied limits to database',
        metaData: {
          sm_limit: smMultiData,
          rdrl_limit: rawRDRLImpliedLimits,
        },
      };
    } catch (err) {
      return {
        code: 500,
        message: `Error: ${err.stack}`,
      };
    }
  }
}
