import * as path from 'path';
import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'common/database/database.service';
import { QTypeE } from 'utils/enum';
import {
  AddMutationResponse,
  DeleteMutationResponse,
  DeltaLadderOrderDetailMembers,
  FlyDOMembers,
  FlyMMOrderMembers,
  MultiSessionOrderDetail,
  SessionMultiOrder,
  SessionOrder,
  SessionOrderDetail,
  SingleMaturityDOMembers,
  SingleMaturityMMOrderMembers,
  SpreadDOMembers,
  SpreadMMOrderMembers,
} from 'frontend/graphql.schema';
import { SubOrderTypeIdE } from './enums_constants';
import * as pg from 'pg';
import { SessionInstrumentsService } from 'frontend/session-instruments/session-instruments.service';
import {
  validateFieldInObjectArray,
  validateFieldInObjectArrayDynamic,
  validationObject,
} from 'common/validations/common.validations';
import { DLOrderDetailMembersSchema } from 'common/validations/delta-ladder.validations';
import {
  FlyMMOrderMembersSchema,
  SingleMaturityMMOrderMembersSchema,
  SpreadMMOrderMembersSchema,
} from 'common/validations/market-making.validations';
import {
  AllOfDOrderMembersSchema,
  AnyOfDOrderMembersSchema,
  FlyDOrderMembersSchema,
  SingleMaturityDOrderMembersSchema,
  SpreadDOrderMembersSchema,
} from 'common/validations/directional.validations';

@Injectable()
export class OrdersService {
  queryConfigBuilder: Function;
  multiQueryConfigBuilder: Function;

  constructor(
    private readonly dbService: DatabaseService,
    private readonly sessionInstrumentsService: SessionInstrumentsService,
  ) {
    [this.queryConfigBuilder, this.multiQueryConfigBuilder] =
      this.dbService.queryConfigBuilderFactory(
        path.join(__dirname, 'orders.queries.json'),
      );
  }

  async getSessionOrdersByOrderTypes(
    sessionId: number,
    bookId: number,
    traderId: number,
    orderTypeIds: number[],
    client?: pg.PoolClient,
  ): Promise<SessionOrder[]> {
    const queryConfig = this.queryConfigBuilder(
      QTypeE.QUERY,
      'GET_ORDER_BY_ORDER_TYPES',
      [sessionId, bookId, traderId, orderTypeIds],
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

  async getSessionOrdersByOrderTypesBook(
    sessionId: number,
    bookId: number,
    orderTypeIds: number[],
    client?: pg.PoolClient,
  ): Promise<SessionOrder[]> {
    const queryConfig = this.queryConfigBuilder(
      QTypeE.QUERY,
      'GET_ORDER_BY_ORDER_TYPES_BOOK',
      [sessionId, bookId, orderTypeIds],
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

  async getSessionOrderById(
    sessionId: number,
    bookId: number,
    traderId: number,
    orderId: number,
    client?: pg.PoolClient,
  ): Promise<SessionOrder> {
    const queryConfig = this.queryConfigBuilder(
      QTypeE.QUERY,
      'GET_ORDER_BY_ID',
      [sessionId, bookId, traderId, orderId],
    );
    const response = await this.dbService.query(queryConfig, client);
    if (
      response.code !== 200 ||
      response.result.rowCount === 0 ||
      response.result.rowCount === null
    ) {
      return;
    }
    return response.result.rows[0];
  }
  async addSessionOrder(
    orderSubTypeId: number,
    sessionId: number,
    bookId: number,
    traderId: number,
    orderKey: string,
    orderMembers: any,
    customMembers: any,
    userId: number,
    client?: pg.PoolClient,
  ): Promise<AddMutationResponse> {
    const validationSchema =
      this.getValidationSchemaFromOrderSubTypeId(orderSubTypeId);
    if (validationSchema) {
      const {
        status: validationStatus,
        errors: validationErrors,
        data: updatedObject,
      } = validationObject(orderMembers, validationSchema);
      if (!validationStatus) {
        return {
          code: 400,
          message: 'Invalid Order Members',
          metaData: validationErrors,
        };
      }
      orderMembers = updatedObject;
    }
    const queryConfig = this.queryConfigBuilder(QTypeE.ADD, 'ADD_ORDER', [
      orderSubTypeId,
      sessionId,
      bookId,
      traderId,
      orderKey,
      orderMembers,
      customMembers,
      userId,
    ]);
    const response = await this.dbService.query(queryConfig, client);
    if (response.code != 200) {
      return {
        code: 500,
        message: `Error adding session order ${response.message}`,
      };
    }
    return {
      code: 200,
      message: `Session orders added successfully`,
      metaData: { order: response.result.rows[0] },
    };
  }

  async addSessionOrders(
    sessionMultiOrder: SessionMultiOrder[],
    client?: pg.PoolClient,
  ) {
    if (sessionMultiOrder.length == 0) {
      return { code: 200, message: 'No orders to add' };
    }
    const {
      status: validationStatus,
      errors: validationErrors,
      data: objArray,
    } = validateFieldInObjectArrayDynamic(
      sessionMultiOrder,
      'order_members',
      'order_subtype_id',
      this.getValidationSchemaFromOrderSubTypeId,
    );
    if (!validationStatus) {
      return {
        code: 400,
        message: 'Invalid Order Members',
        metaData: validationErrors,
      };
    }
    sessionMultiOrder = objArray;
    const queryConfig = this.multiQueryConfigBuilder(
      QTypeE.ADD,
      'ADD_MULTI_ORDERS',
      [sessionMultiOrder],
    );
    const response = await this.dbService.query(queryConfig, client);
    if (response.code != 200) {
      return {
        code: 500,
        message: `Error adding session order ${response.message}`,
      };
    }
    return {
      code: 200,
      message: `Session orders added successfully`,
      metaData: { order: response.result.rows },
    };
  }

  async updateSessionOrder(
    sessionId: number,
    bookId: number,
    traderId: number,
    orderSubTypeId: number,
    orderId: number,
    orderKey: string,
    orderMembers: any,
    customMembers: any,
    userId: number,
    client?: pg.PoolClient,
  ): Promise<AddMutationResponse> {
    const validationSchema =
      this.getValidationSchemaFromOrderSubTypeId(orderSubTypeId);
    if (validationSchema) {
      const {
        status: validationStatus,
        errors: validationErrors,
        data: updatedObject,
      } = validationObject(orderMembers, validationSchema);
      if (!validationStatus) {
        return {
          code: 400,
          message: 'Invalid Order Members',
          metaData: validationErrors,
        };
      }
      orderMembers = updatedObject;
    }
    const queryConfig = this.queryConfigBuilder(QTypeE.UPDATE, 'UPDATE_ORDER', [
      sessionId,
      bookId,
      traderId,
      orderId,
      orderKey,
      orderMembers,
      customMembers,
      userId,
    ]);
    const response = await this.dbService.query(queryConfig, client);
    if (response.code != 200) {
      return { code: 500, message: 'Error updating session order' };
    }
    return {
      code: 200,
      message: `Session orders added successfully`,
      metaData: { order: response.result.rows[0] },
    };
  }

  async addDOOrder(
    orderSubTypeId: number,
    sessionId: number,
    bookId: number,
    traderId: number,
    orderMembers: SingleMaturityDOMembers | SpreadDOMembers | FlyDOMembers,
    customMembers: any,
    userId: number,
    client?: pg.PoolClient,
  ): Promise<AddMutationResponse> {
    const output = await this.addSessionOrder(
      orderSubTypeId,
      sessionId,
      bookId,
      traderId,
      null,
      orderMembers,
      customMembers,
      userId,
      client,
    );
    return output;
  }

  async updateDOOrder(
    sessionId: number,
    bookId: number,
    traderId: number,
    orderSubTypeId: number,
    orderId: number,
    orderMembers: SingleMaturityDOMembers | SpreadDOMembers | FlyDOMembers,
    customMembers: any,
    userId: number,
    client?: pg.PoolClient,
  ): Promise<AddMutationResponse> {
    const output = await this.updateSessionOrder(
      sessionId,
      bookId,
      traderId,
      orderSubTypeId,
      orderId,
      null,
      orderMembers,
      customMembers,
      userId,
      client,
    );
    return output;
  }

  async addMMOrder(
    orderSubTypeId: number,
    sessionId: number,
    bookId: number,
    traderId: number,
    orderMembers:
      | SingleMaturityMMOrderMembers
      | SpreadMMOrderMembers
      | FlyMMOrderMembers,
    customMembers: any,
    userId: number,
    client?: pg.PoolClient,
  ): Promise<AddMutationResponse> {
    const orderKey = await this.generateMMOrderKey(
      sessionId,
      orderSubTypeId,
      orderMembers,
      undefined,
      client,
    );
    const output = await this.addSessionOrder(
      orderSubTypeId,
      sessionId,
      bookId,
      traderId,
      orderKey,
      orderMembers,
      customMembers,
      userId,
      client,
    );
    return output;
  }

  async addMMOrders(
    orderSubTypeId: number,
    sessionId: number,
    bookId: number,
    traderId: number,
    orderMembers: (
      | SingleMaturityMMOrderMembers
      | SpreadMMOrderMembers
      | FlyMMOrderMembers
    )[],
    customMembers: any,
    userId: number,
    client?: pg.PoolClient,
  ): Promise<AddMutationResponse> {
    const output = await this.addSessionOrder(
      orderSubTypeId,
      sessionId,
      bookId,
      traderId,
      null,
      orderMembers,
      customMembers,
      userId,
      client,
    );
    return output;
  }

  async updateMMOrder(
    orderSubTypeId: number,
    sessionId: number,
    bookId: number,
    traderId: number,
    orderId: number,
    orderMembers:
      | SingleMaturityMMOrderMembers
      | SpreadMMOrderMembers
      | FlyMMOrderMembers,
    customMembers: any,
    userId: number,
    client?: pg.PoolClient,
  ): Promise<AddMutationResponse> {
    const output = await this.updateSessionOrder(
      sessionId,
      bookId,
      traderId,
      orderSubTypeId,
      orderId,
      null,
      orderMembers,
      customMembers,
      userId,
      client,
    );
    return output;
  }

  async addRuleBasedMMOrder(
    orderSubTypeId: number,
    sessionId: number,
    bookId: number,
    traderId: number,
    orderMembers: any,
    customMembers: any,
    userId: number,
    client?: pg.PoolClient,
  ): Promise<AddMutationResponse> {
    const orderKey = await this.generateSubOrderNameOrderKey(
      orderSubTypeId,
      undefined,
      client,
    );
    const output = await this.addSessionOrder(
      orderSubTypeId,
      sessionId,
      bookId,
      traderId,
      orderKey,
      orderMembers,
      customMembers,
      userId,
      client,
    );
    return output;
  }

  async updateRuleBasedMMOrder(
    orderSubTypeId: number,
    sessionId: number,
    bookId: number,
    traderId: number,
    orderId: number,
    orderMembers: any,
    customMembers: any,
    userId: number,
    client?: pg.PoolClient,
  ) {
    const output = await this.updateSessionOrder(
      sessionId,
      bookId,
      traderId,
      orderSubTypeId,
      orderId,
      null,
      orderMembers,
      customMembers,
      userId,
      client,
    );
    return output;
  }

  async deleteSessionOrdersCustomColumn(
    sessionId: number,
    bookId: number,
    traderId: number,
    orderTypeId: number,
    columnName: string,
    userId: number,
    client?: pg.PoolClient,
  ): Promise<DeleteMutationResponse> {
    const queryConfig = this.queryConfigBuilder(
      QTypeE.DELETE,
      'DELETE_ORDERS_CUSTOM_COLUMN',
      [sessionId, bookId, traderId, orderTypeId, columnName, userId],
    );
    const response = await this.dbService.query(queryConfig, client);
    if (response.code != 200) {
      return {
        code: 500,
        message: 'Error deleting session order custom column',
      };
    }
    return {
      code: 200,
      message: `No. of session order custom column deleted: ${response.result.rowCount}`,
    };
  }

  async deleteSessionOrders(
    sessionId: number,
    bookId: number,
    traderId: number,
    orderIds: number[],
    userId: number,
    client?: pg.PoolClient,
  ): Promise<DeleteMutationResponse> {
    const queryConfig = this.queryConfigBuilder(
      QTypeE.DELETE,
      'DELETE_ORDER_BY_IDS',
      [sessionId, bookId, traderId, orderIds, userId],
    );
    const response = await this.dbService.query(queryConfig, client);
    if (response.code != 200) {
      return { code: 500, message: 'Error deleting session orders' };
    }
    return {
      code: 200,
      message: `No. of session orders deleted: ${response.result.rowCount}`,
    };
  }

  async deleteAllSessionOrdersByTypeIds(
    sessionId: number,
    bookId: number,
    traderId: number,
    orderTypeIds: number[],
    userId: number,
    client?: pg.PoolClient,
  ): Promise<DeleteMutationResponse> {
    const queryConfig = this.queryConfigBuilder(
      QTypeE.DELETE,
      'DELETE_ALL_ORDERS_BY_TYPE_IDS',
      [sessionId, bookId, traderId, orderTypeIds, userId],
    );
    const response = await this.dbService.query(queryConfig, client);
    if (response.code != 200) {
      return { code: 500, message: 'Error deleting all session orders' };
    }
    return {
      code: 200,
      message: `No. of session orders deleted: ${response.result.rowCount}`,
    };
  }

  async getSessionOrderDetailsByOrderId(
    sessionId: number,
    bookId: number,
    traderId: number,
    orderId: number,
    client?: pg.PoolClient,
  ): Promise<SessionOrderDetail[]> {
    const queryConfig = this.queryConfigBuilder(
      QTypeE.QUERY,
      'GET_ORDER_DETAILS_BY_ORDER_ID',
      [sessionId, bookId, traderId, orderId],
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

  async getSessionOrderDetailsByBook(
    sessionId: number,
    bookId: number,
    client?: pg.PoolClient,
  ): Promise<SessionOrderDetail[]> {
    const queryConfig = this.queryConfigBuilder(
      QTypeE.QUERY,
      'GET_ORDER_DETAILS_BY_BOOK',
      [sessionId, bookId],
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

  async getSessionOrderDetailsByInstrumentId(
    sessionId: number,
    bookId: number,
    traderId: number,
    orderId: number,
    instrumentId: number,
    client?: pg.PoolClient,
  ): Promise<SessionOrderDetail> {
    const queryConfig = this.queryConfigBuilder(
      QTypeE.QUERY,
      'GET_ORDER_DETAILS_BY_INSTRUMENT_ID',
      [sessionId, bookId, traderId, orderId, instrumentId],
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

  async deleteOrderDetails(
    sessionId: number,
    bookId: number,
    traderId: number,
    orderId: number,
    instrumentIds: number[],
    userId: number,
    client?: pg.PoolClient,
  ): Promise<DeleteMutationResponse> {
    const queryConfig = this.queryConfigBuilder(
      QTypeE.DELETE,
      'DELETE_ORDER_DETAILS_BY_INSTRUMENT_IDS',
      [sessionId, bookId, traderId, orderId, instrumentIds, userId],
    );
    const response = await this.dbService.query(queryConfig, client);
    if (response.code != 200) {
      return { code: 500, message: 'Error deleting order details' };
    }
    return {
      code: 200,
      message: `No. of order details deleted: ${response.result.rowCount}`,
    };
  }

  async deleteAllOrderDetailsByOrderId(
    sessionId: number,
    bookId: number,
    traderId: number,
    orderId: number,
    userId: number,
    client?: pg.PoolClient,
  ): Promise<DeleteMutationResponse> {
    const queryConfig = this.queryConfigBuilder(
      QTypeE.DELETE,
      'DELETE_ALL_ORDER_DETAILS_BY_ORDER_ID',
      [sessionId, bookId, traderId, orderId, userId],
    );
    const response = await this.dbService.query(queryConfig, client);
    if (response.code != 200) {
      return { code: 500, message: 'Error deleting all order details' };
    }
    return {
      code: 200,
      message: `No. of order details deleted: ${response.result.rowCount}`,
    };
  }

  async deleteOrderDetailsCustomColumn(
    sessionId: number,
    bookId: number,
    traderId: number,
    orderId: number,
    columnName: string,
    userId: number,
    client?: pg.PoolClient,
  ): Promise<DeleteMutationResponse> {
    const queryConfig = this.queryConfigBuilder(
      QTypeE.DELETE,
      'DELETE_ORDER_DETAILS_CUSTOM_COLUMN',
      [sessionId, bookId, traderId, orderId, columnName, userId],
    );
    const response = await this.dbService.query(queryConfig, client);
    if (response.code != 200) {
      return {
        code: 500,
        message: 'Error deleting order details custom column',
      };
    }
    return {
      code: 200,
      message: `No. of order details custom column deleted: ${response.result.rowCount}`,
    };
  }

  async addDeltaLadderOrder(
    sessionId: number,
    bookId: number,
    traderId: number,
    orderMembers: any,
    userId: number,
    client?: pg.PoolClient,
  ): Promise<AddMutationResponse> {
    const orderSubTypeId = SubOrderTypeIdE.DL;
    const output = await this.addSessionOrder(
      orderSubTypeId,
      sessionId,
      bookId,
      traderId,
      null,
      orderMembers,
      null,
      userId,
      client,
    );
    return output;
  }

  async updateDeltaLadderOrder(
    sessionId: number,
    bookId: number,
    traderId: number,
    orderSubTypeId: number,
    orderId: number,
    orderMembers: any,
    userId: number,
    client?: pg.PoolClient,
  ): Promise<AddMutationResponse> {
    const output = await this.updateSessionOrder(
      sessionId,
      bookId,
      traderId,
      orderSubTypeId,
      orderId,
      null,
      orderMembers,
      null,
      userId,
      client,
    );
    return output;
  }

  async addDeltaLadderOrderDetail(
    sessionId: number,
    bookId: number,
    traderId: number,
    orderId: number,
    instrumentId: number,
    orderDetailMembers: DeltaLadderOrderDetailMembers,
    customMembers: any,
    userId: number,
    client?: pg.PoolClient,
  ): Promise<AddMutationResponse> {
    const orderSubTypeId = SubOrderTypeIdE.DL;
    const {
      status: validationStatus,
      errors: validationErrors,
      data: updatedObject,
    } = validationObject(orderDetailMembers, DLOrderDetailMembersSchema);
    if (!validationStatus) {
      return {
        code: 400,
        message: 'Invalid Delta Ladder',
        metaData: validationErrors,
      };
    }
    orderDetailMembers = updatedObject;
    const queryConfigCheck = this.queryConfigBuilder(
      QTypeE.QUERY,
      'GET_ORDER_BY_ORDER_SUBTYPE_AND_ID',
      [sessionId, bookId, traderId, orderSubTypeId, orderId],
    );
    const responseCheck = await this.dbService.query(queryConfigCheck, client);
    if (responseCheck.code != 200 || responseCheck.result.rowCount === 0) {
      return { code: 500, message: 'Invalid order id.' };
    }

    const queryConfig = this.queryConfigBuilder(
      QTypeE.ADD,
      'ADD_ORDER_DETAIL',
      [
        orderId,
        sessionId,
        instrumentId,
        orderDetailMembers,
        customMembers,
        userId,
      ],
    );

    const response = await this.dbService.query(queryConfig, client);
    if (response.code != 200) {
      return { code: 500, message: 'Error adding session order details' };
    }
    return {
      code: 200,
      message: `Session order details added successfully`,
      metaData: { order_details: response.result.rows[0] },
    };
  }

  async addDeltaLadderOrderDetails(
    sessionMultiOrderDetails: MultiSessionOrderDetail[],
    client?: pg.PoolClient,
  ) {
    if (sessionMultiOrderDetails.length == 0) {
      return { code: 200, message: 'No order details to add' };
    }
    const {
      status: validationStatus,
      errors: validationErrors,
      data: objArray,
    } = validateFieldInObjectArray(
      sessionMultiOrderDetails,
      'order_detail_members',
      DLOrderDetailMembersSchema,
    );
    if (!validationStatus) {
      return {
        code: 400,
        message: 'Invalid Delta Ladder',
        metaData: validationErrors,
      };
    }
    sessionMultiOrderDetails = objArray;
    const queryConfig = this.multiQueryConfigBuilder(
      QTypeE.ADD,
      'ADD_MULTI_ORDER_DETAILS',
      [sessionMultiOrderDetails],
    );
    const response = await this.dbService.query(queryConfig, client);
    if (response.code != 200) {
      return {
        code: 500,
        message: `Error adding session order details  ${response.message}`,
      };
    }
    return {
      code: 200,
      message: `Session order details added successfully`,
      metaData: { order: response.result.rows },
    };
  }

  async updateDeltaLadderOrderDetail(
    sessionId: number,
    bookId: number,
    traderId: number,
    orderId: number,
    instrumentId: number,
    orderDetailMembers: DeltaLadderOrderDetailMembers,
    customMembers: any,
    userId: number,
    client?: pg.PoolClient,
  ): Promise<AddMutationResponse> {
    const orderSubTypeId = SubOrderTypeIdE.DL;
    const {
      status: validationStatus,
      errors: validationErrors,
      data: updatedObj,
    } = validationObject(orderDetailMembers, DLOrderDetailMembersSchema);
    if (!validationStatus) {
      return {
        code: 400,
        message: 'Invalid Delta Ladder',
        metaData: validationErrors,
      };
    }
    orderDetailMembers = updatedObj;

    const queryConfig = this.queryConfigBuilder(
      QTypeE.UPDATE,
      'UPDATE_ORDER_DETAILS',
      [
        sessionId,
        bookId,
        traderId,
        orderId,
        orderSubTypeId,
        instrumentId,
        orderDetailMembers,
        customMembers,
        userId,
      ],
    );
    const response = await this.dbService.query(queryConfig, client);
    if (
      response.code != 200 ||
      response.result.rowCount == 0 ||
      response.result.rowCount == null
    ) {
      return { code: 500, message: 'Error updating session order details' };
    }
    return {
      code: 200,
      message: `Session order details updated successfully`,
      metaData: { order_details: response.result.rows[0] },
    };
  }

  async generateMMOrderKey(
    sessionId: number,
    orderSubTypeId: SubOrderTypeIdE,
    orderMembers: any,
    sessionInstrumentSymbolMapper?: Map<number, string>,
    client?: pg.PoolClient,
  ): Promise<string> {
    const idToSymbolMap =
      sessionInstrumentSymbolMapper ||
      (await this.sessionInstrumentsService.getSessionInstrumentSymbolMapper(
        sessionId,
        undefined,
        client,
      ));
    switch (orderSubTypeId) {
      case SubOrderTypeIdE.MM_SINGLE:
        return `${idToSymbolMap.get(orderMembers.instrument_id1)}`;
      case SubOrderTypeIdE.MM_SPREAD:
        return `${idToSymbolMap.get(
          orderMembers.instrument_id1,
        )}-${idToSymbolMap.get(orderMembers.instrument_id2)}`;
      case SubOrderTypeIdE.MM_FLY:
        return `${idToSymbolMap.get(
          orderMembers.instrument_id1,
        )}-${idToSymbolMap.get(
          orderMembers.instrument_id2,
        )}-${idToSymbolMap.get(orderMembers.instrument_id3)}`;
      default:
        return;
    }
  }

  async generateSubOrderNameOrderKey(
    subOrderTypeId: number,
    subOrderTypeMapper?: Map<number, string>,
    client?: pg.PoolClient,
  ): Promise<string> {
    const mapper =
      subOrderTypeMapper || (await this.getSubOrderTypeIdToNameMap(client));
    return mapper.get(subOrderTypeId);
  }

  async getSubOrderTypeIdToNameMap(
    client?: pg.PoolClient,
  ): Promise<Map<number, string>> {
    const queryConfig = this.queryConfigBuilder(
      QTypeE.QUERY,
      'GET_ORDER_SUBTYPES',
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
    const subOrderTypeIdToNameMap = response.result.rows.reduce((map, row) => {
      map.set(row.order_subtype_id, row.order_subtype_name);
      return map;
    }, new Map());
    return subOrderTypeIdToNameMap;
  }

  private getValidationSchemaFromOrderSubTypeId(subOrderTypeId: number) {
    switch (subOrderTypeId) {
      case SubOrderTypeIdE.MM_SINGLE:
        return SingleMaturityMMOrderMembersSchema;
      case SubOrderTypeIdE.MM_SPREAD:
        return SpreadMMOrderMembersSchema;
      case SubOrderTypeIdE.MM_FLY:
        return FlyMMOrderMembersSchema;
      case SubOrderTypeIdE.DO_SINGLE:
        return SingleMaturityDOrderMembersSchema;
      case SubOrderTypeIdE.DO_SPREAD:
        return SpreadDOrderMembersSchema;
      case SubOrderTypeIdE.DO_FLY:
        return FlyDOrderMembersSchema;
      case SubOrderTypeIdE.DO_ALL_OF:
        return AllOfDOrderMembersSchema;
      case SubOrderTypeIdE.DO_ANY_OF:
        return AnyOfDOrderMembersSchema;
      default:
        return;
    }
  }
}
