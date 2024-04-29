/**
 * Implied Limits Utils
 * This file contains the utility functions generating the implied limits
 * from the market making, directional and delta ladder limits
 * @module business-parsers-utils/implied-limits
 */

import {
  BreachDirection,
  MultiSessionSingleMaturityLimit,
  SessionLimit,
  SessionOrder,
  SessionOrderDetail,
  SingleMaturityLimitImplied,
} from 'frontend/graphql.schema';
import { ParameterSubTypeIdE } from 'frontend/parameters/enums_constants';
import { OrderTypeIdE, SubOrderTypeIdE } from 'frontend/orders/enums_constants';
import { AmountType, Direction, SessionInstrument } from 'graphql.schema';
import * as lodash from 'lodash';

/**
 * Enum for the limits
 */
export enum LimitsEnum {
  MARKET_MAKING_PAY = 'mm_max_pay_limit',
  MARKET_MAKING_RECEIVE = 'mm_max_receive_limit',
  DIRECTIONAL_PAY = 'do_max_pay_limit',
  DIRECTIONAL_RECEIVE = 'do_max_receive_limit',
  DELTA_PAY = 'dl_max_pay_limit',
  DELTA_RECEIVE = 'dl_max_receive_limit',
  MATURITY = 'maturity',
  INSTRUMENT_ID = 'instrument_id',
  INSTRUMENT_ID_START = 'instrument_id_min',
  INSTRUMENT_ID_END = 'instrument_id_max',
  MAX_PAY_LIMIT = 'max_pay_limit',
  MAX_RECEIVE_LIMIT = 'max_receive_limit',
  LIMIT_ID = 'user_parameter_id',
  LIMIT_TYPE_ID = 'parameter_type_id',
  LIMIT_SUBTYPE_ID = 'parameter_subtype_id',
  LIMIT_SUBTYPE_NAME = 'parameter_subtype_name',
  parameter_key = 'parameter_key',
  UNIT = 'unit',
  LIMIT_MEMBERS = 'parameter_members',
  LIMIT_TYPE = 'limit_type',
  MATURITY_START = 'maturity_start',
  MATURITY_END = 'maturity_end',
  USER_PAY_LIMIT = 'user_max_pay_limit',
  USER_RECEIVE_LIMIT = 'user_max_receive_limit',
  ADJUST_LIMIT_DELTA_LADDER = 'adjustLimitDeltaLadder',
  ADJUST_LIMIT_DIRECTIONAL = 'adjustLimitDirectional',
  ADJUST_LIMIT_MARKET_MAKING = 'adjustLimitMarketMaking',
  ORDER_TYPE_IDS = 'order_type_ids',
  INSTRUMENT_ID_MAX = 'instrument_id_max',
  INSTRUMENT_ID_MIN = 'instrument_id_min',
  IMPLIED = 'inferred',
  LIMIT_BREACH = 'limit_breach',
  BREACH_DIRECTION = 'breach_direction',
  CUMULATIVE_PAY = 'cumulative_pay_exposure',
  CUMULATIVE_RECEIVE = 'cumulative_receive_exposure',
}

/**
 * Type for the cumulative amounts
 */
export type CumulativeAmounts = {
  [key: string]: {
    [LimitsEnum.MARKET_MAKING_PAY]: number;
    [LimitsEnum.MARKET_MAKING_RECEIVE]: number;
    [LimitsEnum.DIRECTIONAL_PAY]: number;
    [LimitsEnum.DIRECTIONAL_RECEIVE]: number;
    [LimitsEnum.DELTA_PAY]: number;
    [LimitsEnum.DELTA_RECEIVE]: number;
    [LimitsEnum.USER_PAY_LIMIT]: number;
    [LimitsEnum.USER_RECEIVE_LIMIT]: number;
    [LimitsEnum.LIMIT_ID]: number;
    [LimitsEnum.IMPLIED]: boolean;
    [LimitsEnum.MAX_PAY_LIMIT]: number;
    [LimitsEnum.MAX_RECEIVE_LIMIT]: number;
    [LimitsEnum.LIMIT_BREACH]: boolean;
  };
};

const newDataPoint = {
  [LimitsEnum.MARKET_MAKING_PAY]: 0,
  [LimitsEnum.MARKET_MAKING_RECEIVE]: 0,
  [LimitsEnum.DIRECTIONAL_PAY]: 0,
  [LimitsEnum.DIRECTIONAL_RECEIVE]: 0,
  [LimitsEnum.DELTA_PAY]: 0,
  [LimitsEnum.DELTA_RECEIVE]: 0,
  [LimitsEnum.USER_PAY_LIMIT]: null,
  [LimitsEnum.USER_RECEIVE_LIMIT]: null,
  [LimitsEnum.LIMIT_ID]: -1,
  [LimitsEnum.IMPLIED]: true,
  [LimitsEnum.MAX_PAY_LIMIT]: null,
  [LimitsEnum.MAX_RECEIVE_LIMIT]: null,
  [LimitsEnum.LIMIT_BREACH]: null,
  [LimitsEnum.BREACH_DIRECTION]: null,
  [LimitsEnum.CUMULATIVE_PAY]: 0,
  [LimitsEnum.CUMULATIVE_RECEIVE]: 0,
};

function updateDataPointCalcFieldsToDefault(
  dataPoint: CumulativeAmounts['key'],
): CumulativeAmounts['key'] {
  dataPoint[LimitsEnum.MAX_PAY_LIMIT] = 0;
  dataPoint[LimitsEnum.MAX_RECEIVE_LIMIT] = 0;
  dataPoint[LimitsEnum.LIMIT_BREACH] = false;
  dataPoint[LimitsEnum.BREACH_DIRECTION] = BreachDirection.Both;
  return dataPoint;
}

function transformToLimitFlags(limitSettings: SessionLimit): {
  mm: boolean;
  do: boolean;
  dl: boolean;
} {
  return {
    mm:
      limitSettings?.parameter_members?.order_type_ids?.includes(
        OrderTypeIdE.MM,
      ) ?? true,
    do:
      limitSettings?.parameter_members?.order_type_ids?.includes(
        OrderTypeIdE.DO,
      ) ?? false,
    dl:
      limitSettings?.parameter_members?.order_type_ids?.includes(
        OrderTypeIdE.DL,
      ) ?? false,
  };
}

/**
 * Fun to combine market making limits and update the result
 * @param row The row
 * @param result The result
 */
function combineMarketMaking(row: SessionOrder, result: CumulativeAmounts) {
  if (row.order_subtype_id === SubOrderTypeIdE.MM_SINGLE) {
    const instrument_id1 = row?.order_members?.instrument_id1;
    if (instrument_id1) {
      if (!result[instrument_id1]) {
        result[instrument_id1] = lodash.cloneDeep(newDataPoint);
      }
      result[instrument_id1][LimitsEnum.MARKET_MAKING_PAY] +=
        (row.order_members.pay_amount ?? 0) +
        (row.order_members.fo_pay_amount ?? 0);
      result[instrument_id1][LimitsEnum.MARKET_MAKING_RECEIVE] +=
        (row.order_members.receive_amount ?? 0) +
        (row.order_members.fo_receive_amount ?? 0);
    }
  }

  if (row.order_subtype_id === SubOrderTypeIdE.MM_SPREAD) {
    const instrument_id1 = row?.order_members?.instrument_id1;
    const instrument_id2 = row?.order_members?.instrument_id2;
    if (instrument_id1) {
      if (!result[instrument_id1]) {
        result[instrument_id1] = lodash.cloneDeep(newDataPoint);
      }
      result[instrument_id1][LimitsEnum.MARKET_MAKING_PAY] +=
        +(row.order_members.receive_amount ?? 0) +
        (row.order_members.fo_receive_amount ?? 0);
      result[instrument_id1][LimitsEnum.MARKET_MAKING_RECEIVE] +=
        +(row.order_members.pay_amount ?? 0) +
        (row.order_members.fo_pay_amount ?? 0);
    }
    if (instrument_id2) {
      if (!result[instrument_id2]) {
        result[instrument_id2] = lodash.cloneDeep(newDataPoint);
      }
      result[instrument_id2][LimitsEnum.MARKET_MAKING_PAY] +=
        (row.order_members.pay_amount ?? 0) +
        (row.order_members.fo_pay_amount ?? 0);
      result[instrument_id2][LimitsEnum.MARKET_MAKING_RECEIVE] +=
        (row.order_members.receive_amount ?? 0) +
        (row.order_members.fo_receive_amount ?? 0);
    }
  }

  if (row.order_subtype_id === SubOrderTypeIdE.MM_FLY) {
    const instrument_id1 = row?.order_members?.instrument_id1;
    const instrument_id2 = row?.order_members?.instrument_id2;
    const instrument_id3 = row?.order_members?.instrument_id3;
    if (instrument_id1) {
      if (!result[instrument_id1]) {
        result[instrument_id1] = lodash.cloneDeep(newDataPoint);
      }
      result[instrument_id1][LimitsEnum.MARKET_MAKING_PAY] +=
        (+(row.order_members.receive_amount ?? 0) +
          (row.order_members.fo_receive_amount ?? 0)) /
        2;
      result[instrument_id1][LimitsEnum.MARKET_MAKING_RECEIVE] +=
        (+(row.order_members.pay_amount ?? 0) +
          (row.order_members.fo_pay_amount ?? 0)) /
        2;
    }
    if (instrument_id2) {
      if (!result[instrument_id2]) {
        result[instrument_id2] = lodash.cloneDeep(newDataPoint);
      }
      result[instrument_id2][LimitsEnum.MARKET_MAKING_PAY] +=
        (row.order_members.pay_amount ?? 0) +
        (row.order_members.fo_pay_amount ?? 0);
      result[instrument_id2][LimitsEnum.MARKET_MAKING_RECEIVE] +=
        (row.order_members.receive_amount ?? 0) +
        (row.order_members.fo_receive_amount ?? 0);
    }
    if (instrument_id3) {
      if (!result[instrument_id3]) {
        result[instrument_id3] = lodash.cloneDeep(newDataPoint);
      }
      result[instrument_id3][LimitsEnum.MARKET_MAKING_PAY] +=
        ((row.order_members.receive_amount ?? 0) +
          (row.order_members.fo_receive_amount ?? 0)) /
        2;
      result[instrument_id3][LimitsEnum.MARKET_MAKING_RECEIVE] +=
        ((row.order_members.pay_amount ?? 0) +
          (row.order_members.fo_pay_amount ?? 0)) /
        2;
    }
  }
}

const getRightAmount = (
  amount: number,
  type: number,
  direction: string,
  instrument: number,
) => {
  if (type === SubOrderTypeIdE.DO_SINGLE) {
    return direction === Direction.Pay ? amount : -amount;
  } else if (type === SubOrderTypeIdE.DO_SPREAD) {
    if (instrument === 1) {
      return direction === Direction.Pay ? -amount : amount;
    } else {
      return direction === Direction.Pay ? amount : -amount;
    }
  } else {
    if (instrument === 1) {
      return direction === Direction.Pay ? -amount / 2 : amount / 2;
    } else if (instrument === 2) {
      return direction === Direction.Pay ? amount : -amount;
    } else {
      return direction === Direction.Pay ? -amount / 2 : amount / 2;
    }
  }
};

/**
 * Fun to combine directional limits and update the result
 * @param row The row
 * @param result The result
 * @param instrumentIndexMap The instrument index map
 * @param sessionInstruments The session instruments
 * @param maturityFromInstrumentMap The maturity from instrument map
 * @returns The combined directional limits
 */
function combineDirectional(
  row: SessionOrder,
  result: CumulativeAmounts,
  instrumentIndexMap: any,
  sessionInstruments: any[],
) {
  function addValue(instrument_id: number, value: number) {
    if (!result[instrument_id]) {
      result[instrument_id] = lodash.cloneDeep(newDataPoint);
    }
    if (value > 0) {
      result[instrument_id][LimitsEnum.DIRECTIONAL_PAY] += value;
    } else {
      result[instrument_id][LimitsEnum.DIRECTIONAL_RECEIVE] += Math.abs(value);
    }
  }

  const orderMember = row.order_members;
  if (row.order_subtype_id === SubOrderTypeIdE.DO_ANY_OF) {
    const orderDetails = orderMember?.order_details || [];
    const amount = orderMember?.fo_amount
      ? orderMember.amount + orderMember.fo_amount
      : orderMember.amount;

    for (let i = 0; i < orderDetails.length; i++) {
      const item = orderDetails[i];

      const instrumentId = item.instrument_id1;
      const instrumentIdMin = item.instrument_id1_min;
      const instrumentIdMax = item.instrument_id1_max;

      let min = instrumentIdMin || instrumentId;
      let max = instrumentIdMax || instrumentId;

      if (!min && !max && instrumentId) {
        addValue(instrumentId, amount);
        continue; // Skip to the next iteration
      }

      const minIndex = instrumentIndexMap[min];
      const maxIndex = instrumentIndexMap[max];

      if (minIndex !== -1 && maxIndex !== -1) {
        for (let idx = minIndex; idx <= maxIndex; idx++) {
          const id = sessionInstruments[idx].instrument_id;
          addValue(id, amount);
        }
      }
    }
  } else if (row.order_subtype_id === SubOrderTypeIdE.DO_ALL_OF) {
    const orderDetails = row.order_members?.order_details || [];

    for (let i = 0; i < orderDetails.length; i++) {
      const item = orderDetails[i];
      const instrumentId = item.instrument_id1;
      const instrumentIdMin = item.instrument_id1_min;
      const instrumentIdMax = item.instrument_id1_max;

      const amount = item?.fo_amount
        ? item.amount + item.fo_amount
        : item.amount;

      let min = instrumentIdMin || instrumentId;
      let max = instrumentIdMax || instrumentId;

      if (!min && !max && instrumentId) {
        addValue(instrumentId, amount);
        continue; // Skip to the next iteration
      }

      const minIndex = instrumentIndexMap[min];
      const maxIndex = instrumentIndexMap[max];

      if (minIndex !== -1 && maxIndex !== -1) {
        for (let idx = minIndex; idx <= maxIndex; idx++) {
          const id = sessionInstruments[idx].instrument_id;
          addValue(id, amount);
        }
      }
    }
  } else {
    const amount = orderMember?.fo_amount
      ? orderMember.amount + orderMember.fo_amount
      : orderMember.amount;
    const type = row.order_subtype_id;
    const direction = orderMember.direction;

    //add value for all available instruments
    for (let i = 1; i <= 3; i++) {
      const instrumentIdKey = `instrument_id${i}`;
      const instrumentId = orderMember[instrumentIdKey];

      const minKey = `${instrumentIdKey}_min`;
      const maxKey = `${instrumentIdKey}_max`;

      let min = orderMember[minKey];
      let max = orderMember[maxKey];

      if (!min && !max && instrumentId) {
        addValue(instrumentId, getRightAmount(amount, type, direction, i + 1));
        continue; // Skip to the next iteration
      }

      min = min || instrumentId;
      max = max || instrumentId;

      const minIndex = instrumentIndexMap[min];
      const maxIndex = instrumentIndexMap[max];

      if (minIndex !== -1 && maxIndex !== -1) {
        for (let idx = minIndex; idx <= maxIndex; idx++) {
          const id = sessionInstruments[idx].instrument_id;
          addValue(id, getRightAmount(amount, type, direction, i + 1));
        }
      }
    }
  }
}

/**
 * Fun to combine delta ladder limits and update the result
 * @param row The row
 * @param result The result
 * @returns The combined delta ladder limits
 */
function combineDeltaLadder(
  row: SessionOrderDetail,
  result: CumulativeAmounts,
) {
  const instrument = row.instrument_id;
  if (!result[instrument]) {
    result[instrument] = lodash.cloneDeep(newDataPoint);
  }
  if (row.order_detail_members.direction === Direction.Pay) {
    result[instrument][LimitsEnum.DELTA_RECEIVE] +=
      row.order_detail_members.amount -
      (row.order_detail_members.preserve_amount ?? 0);
  } else {
    result[instrument][LimitsEnum.DELTA_PAY] +=
      row.order_detail_members.amount -
      (row.order_detail_members.preserve_amount ?? 0);
  }
}

function combineLimits(row: SessionLimit, result: CumulativeAmounts) {
  const instrument = row.parameter_members.instrument_id;
  if (!result[instrument]) {
    result[instrument] = lodash.cloneDeep(newDataPoint);
  }
  result[instrument][LimitsEnum.USER_PAY_LIMIT] +=
    row.parameter_members.max_pay_limit;
  result[instrument][LimitsEnum.USER_RECEIVE_LIMIT] +=
    row.parameter_members.max_receive_limit;
  result[instrument][LimitsEnum.LIMIT_ID] = row.parameter_id;
  result[instrument][LimitsEnum.IMPLIED] = false;
}

function createCumulativeAmounts(
  marketMaking: SessionOrder[],
  directional: SessionOrder[],
  deltaLadder: SessionOrderDetail[],
  limits: SessionLimit[],
  sessionInstruments: SessionInstrument[],
  instrumentIndexMap: Record<number, number>,
): CumulativeAmounts {
  const result: CumulativeAmounts = {};

  marketMaking.forEach((row) => combineMarketMaking(row, result));
  directional.forEach((row) =>
    combineDirectional(row, result, instrumentIndexMap, sessionInstruments),
  );
  deltaLadder.forEach((row) => combineDeltaLadder(row, result));
  limits.forEach((row) => combineLimits(row, result));
  return result;
}

function createSMLs(
  cumulativeAmounts: CumulativeAmounts,
  limitFlags: {
    mm: boolean;
    dl: boolean;
    do: boolean;
  },
  sessionInstruments: SessionInstrument[],
): SingleMaturityLimitImplied[] {
  return sessionInstruments.map((instrument) => {
    let dataPoint;
    if (!cumulativeAmounts[instrument.instrument_id]) {
      dataPoint = updateDataPointCalcFieldsToDefault(
        lodash.cloneDeep(newDataPoint),
      );
    } else {
      dataPoint = cumulativeAmounts[instrument.instrument_id];
      const cumulative_pay =
        dataPoint[LimitsEnum.MARKET_MAKING_PAY] +
        dataPoint[LimitsEnum.DIRECTIONAL_PAY] +
        dataPoint[LimitsEnum.DELTA_PAY];
      const cumulative_receive =
        dataPoint[LimitsEnum.MARKET_MAKING_RECEIVE] +
        dataPoint[LimitsEnum.DIRECTIONAL_RECEIVE] +
        dataPoint[LimitsEnum.DELTA_RECEIVE];
      if (dataPoint[LimitsEnum.IMPLIED]) {
        if (limitFlags.mm) {
          dataPoint[LimitsEnum.MAX_PAY_LIMIT] +=
            dataPoint[LimitsEnum.MARKET_MAKING_PAY];
          dataPoint[LimitsEnum.MAX_RECEIVE_LIMIT] +=
            dataPoint[LimitsEnum.MARKET_MAKING_RECEIVE];
        }
        if (limitFlags.dl) {
          dataPoint[LimitsEnum.MAX_PAY_LIMIT] +=
            dataPoint[LimitsEnum.DELTA_PAY];
          dataPoint[LimitsEnum.MAX_RECEIVE_LIMIT] +=
            dataPoint[LimitsEnum.DELTA_RECEIVE];
        }
        if (limitFlags.do) {
          dataPoint[LimitsEnum.MAX_PAY_LIMIT] +=
            dataPoint[LimitsEnum.DIRECTIONAL_PAY];
          dataPoint[LimitsEnum.MAX_RECEIVE_LIMIT] +=
            dataPoint[LimitsEnum.DIRECTIONAL_RECEIVE];
        }
      } else {
        dataPoint[LimitsEnum.MAX_PAY_LIMIT] =
          dataPoint[LimitsEnum.USER_PAY_LIMIT];
        dataPoint[LimitsEnum.MAX_RECEIVE_LIMIT] =
          dataPoint[LimitsEnum.USER_RECEIVE_LIMIT];
      }
      dataPoint[LimitsEnum.LIMIT_BREACH] =
        dataPoint[LimitsEnum.MAX_PAY_LIMIT] < cumulative_pay ||
        dataPoint[LimitsEnum.MAX_RECEIVE_LIMIT] < cumulative_receive;
      dataPoint[LimitsEnum.BREACH_DIRECTION] =
        dataPoint[LimitsEnum.MAX_PAY_LIMIT] < cumulative_pay &&
        dataPoint[LimitsEnum.MAX_RECEIVE_LIMIT] < cumulative_receive
          ? BreachDirection.Both
          : dataPoint[LimitsEnum.MAX_PAY_LIMIT] < cumulative_pay
            ? BreachDirection.Pay
            : BreachDirection.Receive;
      dataPoint[LimitsEnum.CUMULATIVE_PAY] = cumulative_pay;
      dataPoint[LimitsEnum.CUMULATIVE_RECEIVE] = cumulative_receive;
    }
    return {
      instrument_id: instrument.instrument_id,
      ...dataPoint,
    } as SingleMaturityLimitImplied;
  });
}

export function generateImpliedLimits(
  marketMaking: SessionOrder[],
  directional: SessionOrder[],
  deltaLadder: SessionOrderDetail[],
  sessionInstruments: SessionInstrument[],
  limits: SessionLimit[],
  limitSettings: SessionLimit,
): SingleMaturityLimitImplied[] {
  // Step 1: create a map of instrument_id to index
  const instrumentIndexMap = {};
  const instrumentIdToObjMap: Map<number, SessionInstrument> = new Map(
    sessionInstruments.map((instrument, index) => {
      instrumentIndexMap[instrument.instrument_id] = index;
      return [instrument.instrument_id, instrument];
    }),
  );

  //step: create cumulative amounts from the market making, directional and delta ladder for each instrument
  const cumulativeAmounts = createCumulativeAmounts(
    marketMaking,
    directional,
    deltaLadder,
    limits,
    sessionInstruments,
    instrumentIndexMap,
  );

  const limitFlags = transformToLimitFlags(limitSettings);
  // const limitUpdateFlags = limits;

  //step: calculate the implied limits
  const impliedLimits = createSMLs(
    cumulativeAmounts,
    limitFlags,
    sessionInstruments,
  );

  return impliedLimits;
}

export function transformImpliedSMLimitsToMulti(
  sessionId: number,
  bookId: number,
  traderId: number,
  userId: number,
  impliedSMLimits: SingleMaturityLimitImplied[],
): MultiSessionSingleMaturityLimit[] {
  return impliedSMLimits
    .map((limit) => {
      if (!limit.inferred) return;
      return {
        parameter_subtype_id: ParameterSubTypeIdE.SM_INFERRED,
        session_id: sessionId,
        book_id: bookId,
        trader_id: traderId,
        parameter_key: null,
        parameter_members: {
          instrument_id: limit.instrument_id,
          max_pay_limit: limit.max_pay_limit,
          max_receive_limit: limit.max_receive_limit,
          unit: AmountType.DV01,
        },
        custom_members: null,
        updated_by: userId,
      };
    })
    .filter(Boolean);
}
