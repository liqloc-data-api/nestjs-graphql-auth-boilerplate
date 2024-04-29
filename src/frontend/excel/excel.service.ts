import * as pg from 'pg';
import { Injectable } from '@nestjs/common';
import { SettingTypeIdE } from 'frontend/fe-settings/enums_constants';
import { FeSettingsService } from 'frontend/fe-settings/fe-settings.service';
import { CurvesTemplateGenerator } from './excel.utils/excel.write.utils/curves.write.utils';
import { SessionInstrumentsService } from 'frontend/session-instruments/session-instruments.service';
import { CurvesService } from 'frontend/curves/curves.service';
import { ParametersService } from 'frontend/parameters/parameters.service';
import { LiquidInstrumentsMembers } from 'graphql.schema';
import {
  MetaDataFieldsE,
  RawFeTableSettingsI,
  SheetNameE,
} from './excel.utils/enums_constants';
import { DeltaLadderTemplateGenerator } from './excel.utils/excel.write.utils/deltaladder.write.utils';
import { OrdersService } from 'frontend/orders/orders.service';
import { SingleMaturityTemplateGenerator } from './excel.utils/excel.write.utils/singlematurity.write.utils';
import { DateRangeTemplateGenerator } from './excel.utils/excel.write.utils/daterange.write.utils';
import { MarketMakingTemplateGenerator } from './excel.utils/excel.write.utils/marketmaking.write.utils';
import {
  AddMutationResponse,
  Book,
  Session,
  SessionInstrument,
  User,
} from 'frontend/graphql.schema';
import { CurveExcelReader } from './excel.utils/excel.read.utils/curve.read.utils';
import { DatabaseService } from 'common/database/database.service';
import { DeltaLadderExcelReader } from './excel.utils/excel.read.utils/deltaLadder.read.utils';
import { ParameterTypeIdE } from 'frontend/parameters/enums_constants';
import { toDBLiquidMaturitiesFormat } from './excel.utils/excel.transformation.utils/liquidMaturities.transformaiton.utils';
import { SingleMaturityExcelReader } from './excel.utils/excel.read.utils/singleMaturity.read.utils';
import { DateRangeExcelReader } from './excel.utils/excel.read.utils/dateRange.read.utils';
import { MarketMakingExcelReader } from './excel.utils/excel.read.utils/marketMaking.read.utils';
import { OrderTypeIdE } from 'frontend/orders/enums_constants';
import { UsersService } from 'frontend/users/users.service';
import { SessionsService } from 'frontend/sessions/sessions.service';
import { BooksService } from 'frontend/books/books.service';

@Injectable()
export class ExcelService {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly feSettingsService: FeSettingsService,
    private readonly sessionInstrumentsService: SessionInstrumentsService,
    private readonly sessionCurvesService: CurvesService,
    private readonly sessionLimitService: ParametersService,
    private readonly sessionOrdersService: OrdersService,
    private readonly sessionUsersService: UsersService,
    private readonly sessionsSessionsService: SessionsService,
    private readonly sessionsBooksService: BooksService,
  ) {}

  private async outputFormatter(buffer: Buffer): Promise<string> {
    const base64 = buffer.toString('base64');
    return base64;
  }

  private async getMetaData(
    sessionId: number,
    bookId: number,
    traderId: number,
  ) {
    const sessionDetails: Session =
      await this.sessionsSessionsService.getSession(sessionId);
    const bookDetails: Book = await this.sessionsBooksService.getBook(bookId);
    const traderDetails: User =
      await this.sessionUsersService.getUser(traderId);
    return {
      [MetaDataFieldsE.SESSION]: {
        name: 'Session',
        value: sessionDetails.session_name,
      },
      [MetaDataFieldsE.BOOK]: { name: 'Book', value: bookDetails.book_name },
      [MetaDataFieldsE.TRADER]: {
        name: 'Trader',
        value: traderDetails.first_name,
      },
    };
  }

  async getExcelCurve(
    sessionId: number,
    bookId: number,
    traderId: number,
    withData: boolean,
  ): Promise<string> {
    const sessionInstruments =
      await this.sessionInstrumentsService.getSessionInstruments(sessionId);
    const feTableSettings = await this.getFeTableSettings(
      SettingTypeIdE.FeTableCurve,
      sessionId,
      bookId,
      traderId,
    );
    const metaData = await this.getMetaData(sessionId, bookId, traderId);
    const curveTemplateGenerator = new CurvesTemplateGenerator(
      sessionInstruments,
      feTableSettings,
      metaData,
    );
    let buffer: Buffer;
    if (!withData) {
      buffer = await curveTemplateGenerator.generateBlankTemplate();
    } else {
      const curveData = await this.sessionCurvesService.getSessionCurves(
        sessionId,
        bookId,
        traderId,
      );
      const liquidMaturities =
        await this.sessionLimitService.getSessionParametersByParameterTypes(
          bookId,
          -1,
          sessionId,
          [4],
        );
      let liquidInstrumentsMembers: LiquidInstrumentsMembers = {
        instrument_ids: [],
      };
      if (liquidMaturities?.length > 0) {
        liquidInstrumentsMembers = liquidMaturities[0].parameter_members;
      }
      buffer = await curveTemplateGenerator.generateTemplateWithData(
        curveData,
        liquidInstrumentsMembers,
      );
    }
    return this.outputFormatter(buffer);
  }

  async getExcelDeltaLadder(
    sessionId: number,
    bookId: number,
    traderId: number,
    withData: boolean = true,
    orderId?: number,
  ): Promise<string> {
    const feTableSettings = await this.getFeTableSettings(
      SettingTypeIdE.FeTableDeltaLadder,
      sessionId,
      bookId,
      traderId,
    );
    const sessionInstruments =
      await this.sessionInstrumentsService.getSessionInstruments(sessionId);
    const metaData = await this.getMetaData(sessionId, bookId, traderId);
    const deltaLadderTemplateGenerator = new DeltaLadderTemplateGenerator(
      sessionInstruments,
      feTableSettings,
      metaData,
    );
    let buffer: Buffer;
    if (!withData) {
      buffer = await deltaLadderTemplateGenerator.generateBlankTemplate();
    } else {
      const deltaLadderData =
        await this.sessionOrdersService.getSessionOrderDetailsByOrderId(
          sessionId,
          bookId,
          traderId,
          orderId,
        );
      const liquidMaturities =
        await this.sessionLimitService.getSessionParametersByParameterTypes(
          bookId,
          -1,
          sessionId,
          [4],
        );
      let liquidInstrumentsMembers: LiquidInstrumentsMembers = {
        instrument_ids: [],
      };
      if (liquidMaturities?.length > 0) {
        liquidInstrumentsMembers = liquidMaturities[0].parameter_members;
      }
      buffer = await deltaLadderTemplateGenerator.generateTemplateWithData(
        deltaLadderData,
        liquidInstrumentsMembers,
      );
    }
    return this.outputFormatter(buffer);
  }

  async getExcelSingleMaturity(
    sessionId: number,
    bookId: number,
    traderId: number,
    withData: boolean = true,
  ): Promise<string> {
    const feTableSettings = await this.getFeTableSettings(
      SettingTypeIdE.FeTableSingleMaturity,
      sessionId,
      bookId,
      traderId,
    );
    const sessionInstruments =
      await this.sessionInstrumentsService.getSessionInstruments(sessionId);
    const metaData = await this.getMetaData(sessionId, bookId, traderId);
    const singleMaturityTemplateGenerator = new SingleMaturityTemplateGenerator(
      sessionInstruments,
      feTableSettings,
      metaData,
    );
    let buffer: Buffer;
    if (!withData) {
      buffer = await singleMaturityTemplateGenerator.generateBlankTemplate();
    } else {
      const singleMaturityData =
        await this.sessionLimitService.getSessionParametersByParameterTypes(
          bookId,
          -1,
          sessionId,
          [1],
        );
      const liquidMaturities =
        await this.sessionLimitService.getSessionParametersByParameterTypes(
          bookId,
          -1,
          sessionId,
          [4],
        );
      let liquidInstrumentsMembers: LiquidInstrumentsMembers = {
        instrument_ids: [],
      };
      if (liquidMaturities?.length > 0) {
        liquidInstrumentsMembers = liquidMaturities[0].parameter_members;
      }
      buffer = await singleMaturityTemplateGenerator.generateTemplateWithData(
        singleMaturityData,
        liquidInstrumentsMembers,
      );
    }
    return this.outputFormatter(buffer);
  }

  async getExcelDateRange(
    sessionId: number,
    bookId: number,
    traderId: number,
    withData: boolean = true,
  ): Promise<string> {
    const feTableSettings = await this.getFeTableSettings(
      SettingTypeIdE.FeTableDateRange,
      sessionId,
      bookId,
      traderId,
    );
    const sessionInstruments =
      await this.sessionInstrumentsService.getSessionInstruments(sessionId);
    const metaData = await this.getMetaData(sessionId, bookId, traderId);
    const dateRangeTemplateGenerator = new DateRangeTemplateGenerator(
      sessionInstruments,
      feTableSettings,
      metaData,
    );
    let buffer: Buffer;
    if (!withData) {
      buffer = await dateRangeTemplateGenerator.generateBlankTemplate();
    } else {
      const dateRangeMaturityData =
        await this.sessionLimitService.getSessionParametersByParameterTypes(
          bookId,
          -1,
          sessionId,
          [2],
        );
      buffer = await dateRangeTemplateGenerator.generateTemplateWithData(
        dateRangeMaturityData,
      );
    }
    return this.outputFormatter(buffer);
  }

  async getExcelMarketMaking(
    sessionId: number,
    bookId: number,
    traderId: number,
    withData: boolean = true,
  ): Promise<string> {
    const feTableSettings = await this.getFeTableSettings(
      SettingTypeIdE.FeTableMarketMaking,
      sessionId,
      bookId,
      traderId,
    );
    const sessionInstruments =
      await this.sessionInstrumentsService.getSessionInstruments(sessionId);
    const metaData = await this.getMetaData(sessionId, bookId, traderId);
    const marketMakingTemplateGenerator = new MarketMakingTemplateGenerator(
      sessionInstruments,
      feTableSettings,
      metaData,
    );
    let buffer: Buffer;
    if (!withData) {
      buffer = await marketMakingTemplateGenerator.generateBlankTemplate();
    } else {
      const marketMakingMaturityData =
        await this.sessionOrdersService.getSessionOrdersByOrderTypes(
          sessionId,
          bookId,
          traderId,
          [3],
        );
      buffer = await marketMakingTemplateGenerator.generateTemplateWithData(
        marketMakingMaturityData,
      );
    }
    return this.outputFormatter(buffer);
  }

  private async getFeTableSettings(
    settingsTypeId: number,
    sessionId: number,
    bookId: number,
    traderId: number,
  ): Promise<RawFeTableSettingsI> {
    const output = {
      sessionSettings:
        await this.feSettingsService.getSessionFeSettingsByTypeId(
          sessionId,
          settingsTypeId,
        ),
      bookSettings:
        await this.feSettingsService.getSessionBookFeSettingsByTypeId(
          sessionId,
          bookId,
          settingsTypeId,
        ),
      bookUserSettings:
        await this.feSettingsService.getSessionBookUserFeSettingsByTypeId(
          sessionId,
          bookId,
          traderId,
          settingsTypeId,
        ),
    };

    return output;
  }

  async replaceExcelCurveData(
    sessionId: number,
    bookId: number,
    traderId: number,
    excelCurveData: string,
    userId: number,
    client?: pg.PoolClient,
  ): Promise<AddMutationResponse> {
    const columnSettings = await this.getFeTableSettings(
      SettingTypeIdE.FeTableCurve,
      sessionId,
      bookId,
      traderId,
    );
    const curveExcelObj = new CurveExcelReader(
      excelCurveData,
      columnSettings,
      SheetNameE.CURVES,
    );
    const instrumentMap = new Map<string, SessionInstrument>(
      (
        await this.sessionInstrumentsService.getSessionInstruments(sessionId)
      ).map((instrument) => [instrument.symbol, instrument]),
    );
    const excelCurve = await curveExcelObj.getMultiCurveData(
      sessionId,
      bookId,
      traderId,
      userId,
      instrumentMap,
    );

    const liquidInstruments = toDBLiquidMaturitiesFormat(
      instrumentMap,
      curveExcelObj.rawData,
    );
    const transactionManager =
      await this.dbService.getTransactionManager(client);
    transactionManager.setCallback(async (client) => {
      const deleteResponse =
        await this.sessionCurvesService.deleteAllSessionCurves(
          sessionId,
          bookId,
          traderId,
          userId,
          client,
        );
      if (deleteResponse.code != 200) {
        throw new Error('Error in deleting curve data');
      }
      const deleteLiquidResponse =
        await this.sessionLimitService.deleteAllSessionParametersByTypeIds(
          sessionId,
          bookId,
          -1,
          [ParameterTypeIdE.LIQUID],
          userId,
          client,
        );
      if (deleteLiquidResponse.code != 200) {
        throw new Error('Error in deleting liquid instruments data');
      }
      const writeResponseLiquid =
        await this.sessionLimitService.addLiquidInstruments(
          sessionId,
          bookId,
          -1,
          liquidInstruments,
          userId,
          client,
        );
      if (writeResponseLiquid.code != 200) {
        throw new Error('Error in writing liquid instruments data');
      }
      const writeResponse = await this.sessionCurvesService.addSessionCurves(
        excelCurve,
        client,
      );
      if (writeResponse.code === 400) {
        throw new Error(`Invalid Curve Data: ${JSON.stringify(writeResponse)}`);
      }
      if (writeResponse.code != 200) {
        throw new Error('Error in writing curve data');
      }
      return writeResponse;
    });
    const result = await transactionManager.executeTransaction();
    return result;
  }

  async replaceExcelDeltaLadderData(
    sessionId: number,
    bookId: number,
    traderId: number,
    orderId: number,
    excelDeltaLadderData: string,
    userId: number,
    client?: pg.PoolClient,
  ): Promise<AddMutationResponse> {
    const columnSettings = await this.getFeTableSettings(
      SettingTypeIdE.FeTableDeltaLadder,
      sessionId,
      bookId,
      traderId,
    );
    const deltaLadderExcelObj = new DeltaLadderExcelReader(
      excelDeltaLadderData,
      columnSettings,
      SheetNameE.DELTA_LADDER,
    );
    const instrumentMap = new Map<string, SessionInstrument>(
      (
        await this.sessionInstrumentsService.getSessionInstruments(sessionId)
      ).map((instrument) => [instrument.symbol, instrument]),
    );
    const excelDeltaLadder = await deltaLadderExcelObj.getMultiDeltaLadderData(
      sessionId,
      orderId,
      userId,
      instrumentMap,
    );
    const liquidInstruments = toDBLiquidMaturitiesFormat(
      instrumentMap,
      deltaLadderExcelObj.rawData,
    );
    const transactionManager =
      await this.dbService.getTransactionManager(client);
    transactionManager.setCallback(async (client) => {
      const deleteLiquidResponse =
        await this.sessionLimitService.deleteAllSessionParametersByTypeIds(
          sessionId,
          bookId,
          -1,
          [ParameterTypeIdE.LIQUID],
          userId,
          client,
        );
      if (deleteLiquidResponse.code != 200) {
        throw new Error('Error in deleting liquid instruments data');
      }
      const deleteResponse =
        await this.sessionOrdersService.deleteAllOrderDetailsByOrderId(
          sessionId,
          bookId,
          traderId,
          orderId,
          userId,
          client,
        );
      if (deleteResponse.code != 200) {
        throw new Error('Error in deleting curve data');
      }
      const writeResponseLiquid =
        await this.sessionLimitService.addLiquidInstruments(
          sessionId,
          bookId,
          -1,
          liquidInstruments,
          userId,
          client,
        );
      if (writeResponseLiquid.code != 200) {
        throw new Error('Error in writing liquid instruments data');
      }
      const writeResponse =
        await this.sessionOrdersService.addDeltaLadderOrderDetails(
          excelDeltaLadder,
          client,
        );
      if (writeResponse.code === 400) {
        throw new Error(
          `Invalid Delta Ladder Data: ${JSON.stringify(writeResponse)}`,
        );
      }
      if (writeResponse.code != 200) {
        throw new Error('Error in writing curve data');
      }
      return writeResponse;
    });
    const result = await transactionManager.executeTransaction();
    return result;
  }

  async replaceExcelSingleMaturityData(
    sessionId: number,
    bookId: number,
    traderId: number,
    excelSingleMaturityData: string,
    userId: number,
    client?: pg.PoolClient,
  ): Promise<AddMutationResponse> {
    const columnSettings = await this.getFeTableSettings(
      SettingTypeIdE.FeTableSingleMaturity,
      sessionId,
      bookId,
      traderId,
    );
    const singleMaturityExcelObj = new SingleMaturityExcelReader(
      excelSingleMaturityData,
      columnSettings,
      SheetNameE.SINGLE_MATURITY,
    );
    const instrumentMap = new Map<string, SessionInstrument>(
      (
        await this.sessionInstrumentsService.getSessionInstruments(sessionId)
      ).map((instrument) => [instrument.symbol, instrument]),
    );
    const excelSingleMaturity =
      await singleMaturityExcelObj.getMultiSingleMaturityData(
        sessionId,
        bookId,
        traderId,
        userId,
        instrumentMap,
      );
    const liquidInstruments = toDBLiquidMaturitiesFormat(
      instrumentMap,
      singleMaturityExcelObj.rawData,
    );
    const transactionManager =
      await this.dbService.getTransactionManager(client);

    transactionManager.setCallback(async (client) => {
      const deleteLiquidResponse =
        await this.sessionLimitService.deleteAllSessionParametersByTypeIds(
          sessionId,
          bookId,
          -1,
          [ParameterTypeIdE.LIQUID],
          userId,
          client,
        );
      if (deleteLiquidResponse.code != 200) {
        throw new Error('Error in deleting liquid instruments data');
      }
      const deleteResponse =
        await this.sessionLimitService.deleteAllSessionParametersByTypeIds(
          sessionId,
          bookId,
          -1,
          [ParameterTypeIdE.SM],
          userId,
          client,
        );
      if (deleteResponse.code != 200) {
        throw new Error('Error in deleting curve data');
      }
      const writeResponseLiquid =
        await this.sessionLimitService.addLiquidInstruments(
          sessionId,
          bookId,
          -1,
          liquidInstruments,
          userId,
          client,
        );
      if (writeResponseLiquid.code != 200) {
        throw new Error('Error in writing liquid instruments data');
      }
      const writeResponse =
        await this.sessionLimitService.addSingleMaturityLimitsInternal(
          excelSingleMaturity,
          client,
        );
      if (writeResponse.code === 400) {
        throw new Error(
          `Invalid Single Maturity Data: ${JSON.stringify(writeResponse)}`,
        );
      }
      if (writeResponse.code != 200) {
        throw new Error('Error in writing single maturity data');
      }
      return writeResponse;
    });
    const result = await transactionManager.executeTransaction();
    return result;
  }

  async replaceExcelDateRangeData(
    sessionId: number,
    bookId: number,
    traderId: number,
    excelDateRangeData: string,
    userId: number,
    client?: pg.PoolClient,
  ): Promise<AddMutationResponse> {
    const columnSettings = await this.getFeTableSettings(
      SettingTypeIdE.FeTableDateRange,
      sessionId,
      bookId,
      traderId,
    );
    const dateRangeExcelObj = new DateRangeExcelReader(
      excelDateRangeData,
      columnSettings,
      SheetNameE.DATE_RANGE,
    );
    const instrumentMap = new Map<string, SessionInstrument>(
      (
        await this.sessionInstrumentsService.getSessionInstruments(sessionId)
      ).map((instrument) => [instrument.symbol, instrument]),
    );
    const excelDateRange = await dateRangeExcelObj.getMultiDateRangeData(
      sessionId,
      bookId,
      traderId,
      userId,
      instrumentMap,
    );
    const transactionManager =
      await this.dbService.getTransactionManager(client);
    transactionManager.setCallback(async (client) => {
      const deleteResponse =
        await this.sessionLimitService.deleteAllSessionParametersByTypeIds(
          sessionId,
          bookId,
          -1,
          [ParameterTypeIdE.DR],
          userId,
          client,
        );
      if (deleteResponse.code != 200) {
        throw new Error('Error in deleting curve data');
      }
      const writeResponse = await this.sessionLimitService.addDateRangeLimits(
        excelDateRange,
        client,
      );
      if (writeResponse.code === 400) {
        throw new Error(
          `Invalid Date Range Data: ${JSON.stringify(writeResponse)}`,
        );
      }
      if (writeResponse.code != 200) {
        throw new Error('Error in writing date range data');
      }
      return writeResponse;
    });
    const result = await transactionManager.executeTransaction();
    return result;
  }

  async replaceExcelMarketMakingData(
    sessionId: number,
    bookId: number,
    traderId: number,
    excelMarketMakingData: string,
    userId: number,
    client?: pg.PoolClient,
  ): Promise<AddMutationResponse> {
    const columnSettings = await this.getFeTableSettings(
      SettingTypeIdE.FeTableMarketMaking,
      sessionId,
      bookId,
      traderId,
    );
    const marketMakingExcelObj = new MarketMakingExcelReader(
      excelMarketMakingData,
      columnSettings,
      SheetNameE.MARKET_MAKING,
    );
    const instrumentMap = new Map<string, SessionInstrument>(
      (
        await this.sessionInstrumentsService.getSessionInstruments(sessionId)
      ).map((instrument) => [instrument.symbol, instrument]),
    );
    const excelMarketMaking =
      await marketMakingExcelObj.getMultiMarketMakingData(
        sessionId,
        bookId,
        traderId,
        userId,
        instrumentMap,
      );
    const transactionManager =
      await this.dbService.getTransactionManager(client);
    transactionManager.setCallback(async (client) => {
      const deleteResponse =
        await this.sessionOrdersService.deleteAllSessionOrdersByTypeIds(
          sessionId,
          bookId,
          traderId,
          [OrderTypeIdE.MM],
          userId,
          client,
        );
      if (deleteResponse.code != 200) {
        throw new Error('Error in deleting market making data');
      }
      const writeResponse = await this.sessionOrdersService.addSessionOrders(
        excelMarketMaking,
        client,
      );
      if (writeResponse.code === 400) {
        throw new Error(
          `Invalid Market Making Data: ${JSON.stringify(writeResponse)}`,
        );
      }
      if (writeResponse.code != 200) {
        throw new Error('Error in writing market making data');
      }
      return writeResponse;
    });
    const result = await transactionManager.executeTransaction();
    return result;
  }
}
